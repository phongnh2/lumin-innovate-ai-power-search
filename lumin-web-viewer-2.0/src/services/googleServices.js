/* eslint-disable sonarjs/no-duplicate-string */
/// <reference path="./googleServices.d.ts" />
import { HttpStatusCode } from 'axios';
import dayjs from 'dayjs';
import i18next from 'i18next';
import pRetry, { AbortError } from 'p-retry';

import selectors from 'selectors';
import { store } from 'store';

import { cookieManager } from 'helpers/cookieManager';
import logger from 'helpers/logger';

import commonUtils from 'utils/common';
import { isElectron } from 'utils/corePathHelper';
import { fileUtils } from 'utils/file';
import { getLanguage } from 'utils/getLanguage';
import googleDriveError from 'utils/googleDriveError';
import { redirectFlowUtils } from 'utils/redirectFlow';
import {
  getDriveUserRestrictedDomain,
  getDriveUserRestrictedEmail,
  openCannotAuthorizeModal,
} from 'utils/restrictedUserUtil';
import toastUtils from 'utils/toastUtils';

import { DriveErrorCode, DriveScopes, LOGIN_SERVICES } from 'constants/authConstant';
import { CookieStorageKey } from 'constants/cookieName';
import { DURATION_TIME_RENEW_GOOGLE_ACCESS_TOKEN } from 'constants/customConstant';
import { ErrorCode } from 'constants/errorCode';
import { GOOGLE_LANGUAGES } from 'constants/language';
import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER, STATUS_CODE, ModalTypes } from 'constants/lumin-common';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import electronGoogleServices, { ElectronGoogleServices } from './electronGoogleServices';

const DRIVE_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 8000,
  factor: 2,
};

export const shouldRetryDriveRequest = (error) => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code;

  return (
    errorMessage.includes('network error') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('timeout') ||
    errorCode === HttpStatusCode.ServiceUnavailable ||
    errorCode === HttpStatusCode.TooManyRequests ||
    errorCode === HttpStatusCode.InternalServerError ||
    errorCode === HttpStatusCode.BadGateway
  );
};

function gapiWrapper(handler) {
  return async (...rest) => {
    try {
      const tokenData = JSON.parse(localStorage.getItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN));
      const timestampExpireAcessToken = Number(
        localStorage.getItem(LocalStorageKey.EXPIRE_TIME_GOOGLE_IMPLICIT_ACCESS_TOKEN)
      );
      const currentTimestamp = dayjs().unix();
      if (!tokenData || !timestampExpireAcessToken || timestampExpireAcessToken < currentTimestamp) {
        await new Promise((resolve, reject) => {
          implicitSignIn({
            callback: () => resolve(null),
            onError: (error) => {
              const errorType = error && error?.type;
              if (errorType === ErrorCode.Common.POPUP_FAILED_TO_OPEN) {
                toastUtils.openToastMulti({
                  message: i18next.t('openDrive.blockByBrowser'),
                  type: ModalTypes.ERROR,
                });
              }
              if (
                googleDriveError.isAccessDeniedError(error) ||
                googleDriveError.isClosePopUpError(error) ||
                googleDriveError.isBlockPopUpError(error)
              ) {
                reject(error);
                return;
              }
              resolve();
            },
            loginHint: getAccessTokenEmail(),
          });
        });
      }
      return await handler(...rest);
    } catch (e) {
      if (e.code === STATUS_CODE.UNAUTHORIZED || e.error_description === 'Invalid Value') {
        const error = await new Promise((resolve) => {
          implicitSignIn({
            callback: () => resolve(null),
            onError: resolve,
          });
        });
        if (error) {
          throw error;
        }
        return handler(...rest);
      }
      throw e;
    }
  };
}

function getImplicitAccessToken() {
  const accessToken = localStorage.getItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
  return accessToken ? JSON.parse(accessToken) : null;
}

function removeImplicitAccessToken() {
  window.gapi.client.setToken(null);
  localStorage.removeItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
  cookieManager.delete(CookieStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
  localStorage.removeItem(LocalStorageKey.EXPIRE_TIME_GOOGLE_IMPLICIT_ACCESS_TOKEN);
}

// for check authentication
function isSignedInWithGoolge(loginService) {
  return loginService === LOGIN_SERVICES.GOOGLE;
}

// for check authorization
function isSignedIn() {
  if (isElectron()) {
    return ElectronGoogleServices.isSignedIn();
  }
  const googleAccessToken = localStorage.getItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
  return Boolean(googleAccessToken);
}

async function uploadFileToDrive({ fileId, fileMetadata, fileData }) {
  return new Promise(async (resolve, reject) => {
    if (!window.gapi.client.drive) {
      await window.gapi.client.load({ name: 'drive', version: 'v3' });
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(fileData);
    reader.addEventListener('load', async () => {
      try {
        const resp = await onLoadFileReaderUploadFile({
          fileData,
          reader,
          fileMetadata,
          fileId,
        });
        logger.logInfo({
          message: LOGGER.EVENT.UPLOAD_FILE_TO_GOOGLE_DRIVE,
          reason: LOGGER.Service.GOOGLE_API_INFO,
          attributes: {
            resp,
            fileData,
            reader,
            fileMetadata,
            fileId,
          },
        });
        resolve(resp);
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.GOOGLE_API_ERROR,
          error,
          context: uploadFileToDrive.name,
        });
        reject(error);
      }
    });
  });
}

function uint8ArrayToBase64(uint8Array) {
  const chunkSize = 0x8000; // 32KB chunks to avoid stack overflow
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binaryString);
}

function onLoadFileReaderUploadFile({ fileData, reader, fileMetadata, fileId }) {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;
  const contentType = fileData.type || 'application/octet-stream';
  const base64Data = uint8ArrayToBase64(new Uint8Array(reader.result));
  const multipartRequestBody =
    `${delimiter}Content-Type: application/json\r\n\r\n${JSON.stringify(
      fileMetadata
    )}${delimiter}Content-Type: ${contentType}\r\n` +
    'Content-Transfer-Encoding: base64\r\n' +
    `\r\n${base64Data}${closeDelim}`;

  const request = window.gapi.client.request({
    path: `/upload/drive/v3/files/${fileId}`,
    method: 'PATCH',
    params: { uploadType: 'multipart', alt: 'json', supportsAllDrives: true, fields: 'md5Checksum' },
    headers: {
      'Content-Type': `multipart/mixed; boundary="${boundary}"`,
    },
    body: multipartRequestBody,
  });
  return executeRequestToDrive(request, {
    fileId,
    context: 'onLoadFileReaderUploadFile',
  });
}

function executeRequestToDrive(request, extraInfo = {}) {
  return pRetry(
    () =>
      new Promise((resolve, reject) => {
        request.execute((resp) => {
          if (resp.error) {
            if (shouldRetryDriveRequest(resp.error)) {
              reject(resp.error);
            } else {
              logger.logError({
                reason: LOGGER.Service.GOOGLE_API_ERROR,
                error: resp.error,
                attributes: {
                  ...extraInfo,
                },
              });
              const error = new Error(resp.error.message);
              error.code = resp.error.code;
              error.reason = resp.error.errors?.[0]?.reason;
              error.message = resp.error.message;
              reject(new AbortError(error));
            }
          } else {
            resolve(resp);
          }
        });
      }),
    {
      retries: DRIVE_RETRY_CONFIG.maxRetries,
      factor: DRIVE_RETRY_CONFIG.factor,
      minTimeout: DRIVE_RETRY_CONFIG.initialDelay,
      maxTimeout: DRIVE_RETRY_CONFIG.maxDelay,
      onFailedAttempt: (error) => {
        logger.logError({
          context: executeRequestToDrive.name,
          error,
          attributes: {
            attemptNumber: error.attemptNumber,
            retriesLeft: error.retriesLeft,
            ...extraInfo,
          },
        });
      },
    }
  );
}

/**
 * Insert new file.
 *
 * @param {File} fileData File object to read data from.
 * @param {Object} fileMetadata Object to read metadata from.
 */
function insertFileToDrive({ fileData, fileMetadata }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(fileData);
    // eslint-disable-next-line no-unused-vars
    reader.addEventListener('load', async () => {
      try {
        const resp = await onLoadFileReaderInsertFile({ fileData, reader, fileMetadata });
        resolve(resp);
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.GOOGLE_API_ERROR,
          error,
        });
        reject(error);
      }
    });
  });
}

function onLoadFileReaderInsertFile({ reader, fileData, fileMetadata }) {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;
  const contentType = fileData.type || 'application/octet-stream';

  const base64Data = uint8ArrayToBase64(new Uint8Array(reader.result));
  const multipartRequestBody =
    `${delimiter}Content-Type: application/json\r\n\r\n${JSON.stringify(
      fileMetadata
    )}${delimiter}Content-Type: ${contentType}\r\n` +
    'Content-Transfer-Encoding: base64\r\n' +
    `\r\n${base64Data}${closeDelim}`;

  const request = window.gapi.client.request({
    path: '/upload/drive/v3/files',
    method: 'POST',
    params: { uploadType: 'multipart', supportsAllDrives: true },
    headers: {
      'Content-Type': `multipart/mixed; boundary="${boundary}"`,
    },
    body: multipartRequestBody,
  });
  return executeRequestToDrive(request, {
    context: 'onLoadFileReaderInsertFile',
  });
}

function requestPermission() {
  logger.logInfo({
    message: LOGGER.EVENT.REQUEST_PERMISSION,
    reason: LOGGER.Service.GOOGLE_API_INFO,
  });
  return implicitSignIn({});
}

async function getCurrentRemoteEmail() {
  const userInfo = await getBasicProfile();
  return userInfo.email ? userInfo.email.toLowerCase() : '';
}

async function getCurrentUserId() {
  logger.logInfo({
    message: LOGGER.EVENT.GET_CURRENT_DRIVE_USER_ID,
    reason: LOGGER.Service.GOOGLE_API_INFO,
  });

  const userInfo = await getBasicProfile();
  return userInfo.id || userInfo.sub || '';
}

function getTokenInfo() {
  const googleTokenResp = getImplicitAccessToken();

  if (!googleTokenResp?.access_token) {
    return null;
  }
  const request = window.gapi.client.request({
    path: 'oauth2/v3/tokeninfo',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${googleTokenResp.access_token}`,
    },
  });
  return new Promise((resolve, reject) => {
    request.execute((resp) => {
      if (resp.error || resp.error_description) {
        reject(resp);
      }
      if (resp.email) {
        resp.email = resp.email.toLowerCase();
      }
      resolve(resp);
    });
  });
}

async function isValidToken() {
  try {
    const tokenInfo = await getTokenInfo();
    return tokenInfo !== null;
  } catch (error) {
    return false;
  }
}

function getFileInfo(fileId, fields = '*', from = '') {
  // if (!fileId) throw new Error()
  return new Promise(async (resolve, reject) => {
    try {
      if (!window.gapi.client.drive) {
        await window.gapi.client.load('drive', 'v3');
      }
      const request = window.gapi.client.drive.files.get({
        fileId,
        supportsAllDrives: true,
        fields,
      });
      const googleToken = window.gapi.client.getToken();
      if (!googleToken?.access_token) {
        reject(new Error(DriveErrorCode.MISSING_ACCESS_TOKEN));
        return;
      }
      const resp = await executeRequestToDrive(request, {
        fileId,
        context: 'getFileInfo',
        from,
      });
      logger.logInfo({
        message: LOGGER.EVENT.GET_FILE_INFO,
        reason: LOGGER.Service.GOOGLE_API_INFO,
        attributes: { resp },
      });
      resolve(resp);
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error,
      });
      reject(error);
    }
  });
}

function getFileRevisions(fileId) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!window.gapi.client.drive) {
        await window.gapi.client.load('drive', 'v3');
      }
      const request = window.gapi.client.drive.revisions.list({
        fileId,
        fields: '*',
      });
      const resp = await executeRequestToDrive(request, {
        fileId,
        context: 'getFileRevisions',
      });
      logger.logInfo({
        message: LOGGER.EVENT.GET_FILE_INFO,
        reason: LOGGER.Service.GOOGLE_API_INFO,
        attributes: { resp },
      });
      resolve(resp);
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error,
      });
      reject(error);
    }
  });
}

function getFileContent(document) {
  return new Promise(async (resolve, reject) => {
    window.gapi.client.load('drive', 'v3', async () => {
      try {
        const res = await window.gapi.client.drive.files.get({
          fileId: document.remoteId,
          alt: 'media',
        });
        if (res.code) {
          logger.logError({ error: res });
          reject(res);
        }
        /* convert binary stream to Blob */
        const array = new Uint8Array(res.body?.length);
        for (let i = 0; i < res.body.length; i++) {
          array[i] = res.body.charCodeAt(i);
        }
        const file = new File([new Blob([array])], document.name, { type: document.mimeType });
        logger.logInfo({
          message: LOGGER.EVENT.GET_FILE_GOOGLE_SERVICE,
          reason: LOGGER.Service.GOOGLE_API_INFO,
        });
        resolve(file);
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.GOOGLE_API_ERROR,
          error,
        });
        reject(error);
      }
    });
  });
}

function getPreviousFileVersionContent(document, versionId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Make sure the drive API is loaded
      if (!window.gapi.client.drive) {
        await window.gapi.client.load('drive', 'v3');
      }

      // Get the current access token
      const token = window.gapi.client.getToken();
      if (!token || !token.access_token) {
        throw new Error('No authorization token available');
      }

      // Construct the URL for the file content
      const url = `https://www.googleapis.com/drive/v3/files/${document.remoteId}/revisions/${versionId}?alt=media`;

      // Use fetch with the access token to get binary data directly
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.status} ${response.statusText}`);
      }

      // Get the response directly as a blob
      const blob = await response.blob();

      // Create a File object from the blob
      const file = new File([blob], document.name, { type: document.mimeType });

      logger.logInfo({
        message: LOGGER.EVENT.GET_FILE_GOOGLE_SERVICE,
        reason: LOGGER.Service.GOOGLE_API_INFO,
      });

      resolve(file);
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error,
      });
      reject(error);
    }
  });
}

function downloadFile(fileId, fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      window.gapi.client.drive.files
        .get({
          fileId,
          alt: 'media',
        })
        .then((res) => {
          const dataUrl = `data:${res.headers['Content-Type']};base64,${window.btoa(res.body)}`;
          const file = fileUtils.dataURLtoFile(dataUrl, fileName);
          logger.logInfo({
            message: LOGGER.EVENT.DOWNLOAD_FILE,
            reason: LOGGER.Service.GOOGLE_API_INFO,
            attributes: { file, dataUrl },
          });
          resolve(file);
        });
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error,
      });
      reject(error);
    }
  });
}

function hasGrantedScope(scope) {
  const accessToken = getImplicitAccessToken();
  if (!accessToken) {
    return false;
  }
  return window.google.accounts.oauth2.hasGrantedAnyScope(accessToken, scope);
}

async function renameFileToDrive({ fileId, newName }) {
  try {
    if (!window.gapi.client.drive) {
      await window.gapi.client.load('drive', 'v3');
    }
    const request = window.gapi.client.request({
      path: `/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { supportsAllDrives: true },
      body: {
        name: newName,
      },
    });
    return await executeRequestToDrive(request, {
      context: 'renameFileToDrive',
      fileId,
    });
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.GOOGLE_API_ERROR,
      error,
    });
    throw error;
  }
}

async function getProfileWithOauth2Token() {
  if (!window.gapi.client.oauth2) {
    await window.gapi.client.load('oauth2', 'v2');
  }
  const request = window.gapi.client.oauth2.userinfo.get();
  const data = await executeRequestToDrive(request, {
    context: 'getProfileWithOauth2Token',
  });
  return data || {};
}

async function getBasicProfile() {
  const accessToken = localStorage.getItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
  if (accessToken) {
    return getProfileWithOauth2Token();
  }

  return {};
}

async function getAccessTokenInfo(accessToken) {
  const request = window.gapi.client.request({
    path: 'oauth2/v3/tokeninfo',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return new Promise((resolve, reject) => {
    request.execute((resp) => {
      if (resp.error || resp.error_description) {
        reject(resp);
      }
      if (resp.email) {
        resp.email = resp.email.toLowerCase();
      }
      resolve(resp);
    });
  });
}

async function injectAccessTokenInfo(accessToken, scope, tokenInfo) {
  const tokenData = {
    scope,
    access_token: accessToken,
    email: tokenInfo.email,
  };
  setOAuth2Token({
    scope,
    access_token: accessToken,
    email: tokenInfo.email,
    userRemoteId: tokenInfo.sub || '',
  });
  return tokenData;
}

function getAccessTokenEmail() {
  const accessTokenInfo = JSON.parse(localStorage.getItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN));
  if (!accessTokenInfo) {
    return '';
  }
  const domainFromTokenInfo = commonUtils.getDomainFromEmail(accessTokenInfo.email);
  if (getDriveUserRestrictedDomain().includes(domainFromTokenInfo)) {
    cookieManager.delete(CookieStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
    localStorage.removeItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
    return '';
  }
  return accessTokenInfo.email;
}

function removeExcludeScopes(scope, excludeScopes) {
  return scope.reduce((accumulator, scope, index) => {
    excludeScopes.forEach((excludeScope) => {
      if (excludeScope === scope) {
        accumulator.splice(index, 1);
      }
    });
    return accumulator;
  }, scope);
}

async function handleElectronAuth(callback, onError, options = {}) {
  try {
    const tokenData = await electronGoogleServices.authenticate({
      callback,
      onError,
      ...options,
    });
    if (callback && tokenData) {
      callback(tokenData);
    }
  } catch (error) {
    if (onError) {
      onError(error);
    }
  }
}

function buildScopes(scope, excludeScopes) {
  let scopes = ['profile', 'email', DriveScopes.DRIVE_FILE, ...scope];
  if (excludeScopes.length) {
    scopes = removeExcludeScopes(scopes, excludeScopes);
  }
  return scopes;
}

async function handleTokenCallback(
  data,
  currentUser,
  restrictedEmail,
  callback,
  onError,
  initScope,
  prompt,
  loginHint,
  excludeScopes
) {
  const { error, error_description: errorDescription, scope, access_token: accessToken } = data;

  if (onError && (error || errorDescription)) {
    onError(new Error(error || errorDescription));
    return undefined;
  }

  if (!accessToken) {
    return undefined;
  }

  const tokenInfo = await getAccessTokenInfo(accessToken);
  const domainFromTokenInfo = commonUtils.getDomainFromEmail(tokenInfo.email);
  const isRestrictedDomain = getDriveUserRestrictedDomain().includes(domainFromTokenInfo);

  if (currentUser && (restrictedEmail || isRestrictedDomain) && restrictedEmail !== tokenInfo.email) {
    const onConfirm = () => {
      removeImplicitAccessToken();
      implicitSignIn({
        callback,
        scope: initScope,
        onError,
        prompt,
        loginHint,
        excludeScopes,
        restrictedEmail,
      });
    };
    openCannotAuthorizeModal({ restrictedEmail, onConfirm, restrictedDomain: domainFromTokenInfo });
    return undefined;
  }

  const tokenData = await injectAccessTokenInfo(accessToken, scope, tokenInfo);
  if (callback) {
    callback(tokenData);
  }
  return tokenData;
}

function implicitSignIn({
  callback = null,
  scope = [],
  onError,
  prompt = 'select_account',
  loginHint = '',
  excludeScopes = [],
}) {
  if (isElectron()) {
    return handleElectronAuth(callback, onError, {
      prompt,
      loginHint,
      scope,
    });
  }

  const initScope = scope;
  const state = store.getState();
  const currentUser = selectors.getCurrentUser(state);
  const restrictedEmail = getDriveUserRestrictedEmail(currentUser?.email) || null;

  return new Promise(async (resolve) => {
    const scopes = buildScopes(scope, excludeScopes);

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.GOOGLE_PICKER_CLIENTID,
      scope: scopes.join(' '),
      prompt: prompt || 'select_account',
      hint: restrictedEmail || loginHint || '',
      callback: async (data) => {
        await handleTokenCallback(
          data,
          currentUser,
          restrictedEmail,
          callback,
          onError,
          initScope,
          prompt,
          loginHint,
          excludeScopes
        );

        // Always resolve the Promise when the authentication flow completes
        // Success/failure is handled through callback/onError parameters
        resolve();
      },
      error_callback: (...rest) => {
        if (onError) {
          onError(...rest);
        }
        resolve();
      },
    });

    if (typeof client.m === 'string') {
      client.m += `?hl=${GOOGLE_LANGUAGES[getLanguage()]}`;
    }

    const disableGooglePopup = sessionStorage.getItem(SESSION_STORAGE_KEY.DISABLE_AUTHORIZATION_GOOGLE_POPUP);
    if (disableGooglePopup) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY.DISABLE_AUTHORIZATION_GOOGLE_POPUP);
      return;
    }

    client.requestAccessToken();
    trackGooglePopupModal();
  });
}

function trackGooglePopupModal() {
  const totalGooglePopup = parseInt(sessionStorage.getItem(SESSION_STORAGE_KEY.TOTAL_GOOGLE_POPUP));
  sessionStorage.setItem(SESSION_STORAGE_KEY.TOTAL_GOOGLE_POPUP, (totalGooglePopup || 0) + 1);
}

function setOAuth2Token({ access_token, scope, email, userRemoteId }, expireAt = null) {
  const tokenResponse = {
    scope,
    access_token,
    email,
    userRemoteId,
  };
  window.gapi.client.setToken(tokenResponse);
  localStorage.setItem(LocalStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN, JSON.stringify(tokenResponse));
  cookieManager.set({
    name: CookieStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN,
    value: access_token,
    maxAge: DURATION_TIME_RENEW_GOOGLE_ACCESS_TOKEN,
    options: {
      domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.luminpdf.com',
    },
  });
  const defaultExpireTime = JSON.stringify(dayjs().set('second', DURATION_TIME_RENEW_GOOGLE_ACCESS_TOKEN).unix());
  localStorage.setItem(LocalStorageKey.EXPIRE_TIME_GOOGLE_IMPLICIT_ACCESS_TOKEN, expireAt || defaultExpireTime);
}

function syncUpAccessToken() {
  const implicitAccessToken = getImplicitAccessToken();
  const redirectAcessToken = cookieManager.get(redirectFlowUtils.loadGoogleCookieNames().googleAccessToken);
  if (implicitAccessToken && !redirectAcessToken) {
    const expireAt = localStorage.getItem(LocalStorageKey.EXPIRE_TIME_GOOGLE_IMPLICIT_ACCESS_TOKEN);
    const accessToken = implicitAccessToken.access_token;
    delete implicitAccessToken.access_token;
    cookieManager.set({
      name: redirectFlowUtils.loadGoogleCookieNames().googleAccessToken,
      value: JSON.stringify({
        ...implicitAccessToken,
        accessToken,
        // In redirect cookie, time is miliseconds
        // eslint-disable-next-line no-magic-numbers
        expireAt: expireAt * 1000,
      }),
      maxAge: 3600,
      options: {
        domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.luminpdf.com',
      },
    });
  }
}

async function checkAuthorizedUserHasPopularDomain() {
  const googleAccessToken = getImplicitAccessToken();
  if (!googleAccessToken?.email) return false;
  const popularDomains = (await import('constants/popularDomains')).default;
  return popularDomains[commonUtils.getDomainFromEmail(googleAccessToken.email)];
}

function checkGoogleAccessTokenExpired() {
  const googleAccessToken = getImplicitAccessToken();
  const expireAt = localStorage.getItem(LocalStorageKey.EXPIRE_TIME_GOOGLE_IMPLICIT_ACCESS_TOKEN);
  if (!googleAccessToken || !expireAt) return true;
  return Number(expireAt) < dayjs().unix();
}

/**
 * Initiates a resumable upload session with Google Drive API
 * @param {string} fileId - The ID of the file to update
 * @param {string} contentType - The MIME type of the file
 * @param {Object} fileMetadata - The metadata for the file
 * @returns {Promise<string>} - A Promise that resolves to the resumable upload session URL
 */
async function initiateResumableUpload(fileId, contentType, fileMetadata) {
  return new Promise((resolve, reject) => {
    // Create the request to initiate the resumable upload session
    const request = window.gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { uploadType: 'resumable', supportsAllDrives: true, fields: 'md5Checksum' },
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': contentType,
      },
      body: JSON.stringify(fileMetadata),
    });

    // Execute the request to get the session URL
    request.execute((resp, info) => {
      if (resp && resp.error) {
        logger.logError({
          reason: LOGGER.Service.GOOGLE_API_ERROR,
          error: resp.error,
          attributes: { fileId, context: 'initiateResumableUpload' },
        });
        reject(resp.error);
      } else {
        // Get the session URL from the Location header
        const { gapiRequest } = info ? JSON.parse(info) : {};
        const { headers } = gapiRequest?.data || {};
        const sessionUrl = headers?.location;
        if (!sessionUrl) {
          const error = new Error('Failed to get resumable upload session URL');
          logger.logError({
            reason: LOGGER.Service.GOOGLE_API_ERROR,
            error,
            attributes: { fileId, context: 'initiateResumableUpload' },
          });
          reject(error);
        } else {
          resolve(sessionUrl);
        }
      }
    });
  });
}

/**
 * Uploads a file using a resumable upload session
 * @param {string} sessionUrl - The resumable upload session URL
 * @param {File} fileData - The file data to upload
 * @param {string} contentType - The MIME type of the file
 * @param {number} fileSize - The size of the file in bytes
 * @returns {Promise<Object>} - A Promise that resolves to the upload response
 */
async function uploadFileWithResumableSession(sessionUrl, fileData, contentType, fileSize) {
  const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB chunk size (recommended by Google)
  let uploaded = 0;
  let response = null;

  return new Promise((resolve, reject) => {
    const uploadNextChunk = async () => {
      try {
        const start = uploaded;
        const end = Math.min(uploaded + CHUNK_SIZE, fileSize);
        const chunk = fileData.slice(start, end);

        // Read the chunk as an ArrayBuffer
        const arrayBuffer = await readFileAsArrayBuffer(chunk);

        // Upload the chunk
        response = await uploadChunk(sessionUrl, arrayBuffer, contentType, start, end - 1, fileSize);

        // Update uploaded amount
        uploaded = end;

        if (uploaded < fileSize) {
          // Continue with the next chunk
          await uploadNextChunk();
        } else {
          // Upload complete
          resolve(response);
        }
      } catch (error) {
        // If the error contains range_unconfirmed, we can resume from the last confirmed byte
        if (error.message && error.message.includes('range_unconfirmed')) {
          // Query for the last uploaded byte and resume from there
          try {
            const status = await getUploadStatus(sessionUrl);
            uploaded = status.updatedRange ? parseInt(status.updatedRange.split('-')[1]) + 1 : 0;
            await uploadNextChunk();
          } catch (statusError) {
            reject(statusError);
          }
        } else {
          reject(error);
        }
      }
    };

    // Start the chunked upload process
    uploadNextChunk();
  });
}

/**
 * Reads a file chunk as an ArrayBuffer
 * @param {Blob} chunk - The file chunk to read
 * @returns {Promise<ArrayBuffer>} - A Promise that resolves to the ArrayBuffer
 */
function readFileAsArrayBuffer(chunk) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(chunk);
  });
}

/**
 * Uploads a single chunk to the resumable upload session
 * @param {string} sessionUrl - The resumable upload session URL
 * @param {ArrayBuffer} chunk - The chunk data to upload
 * @param {string} contentType - The MIME type of the file
 * @param {number} start - The start byte position
 * @param {number} end - The end byte position
 * @param {number} total - The total file size
 * @returns {Promise<Object>} - A Promise that resolves to the upload response
 */
async function uploadChunk(sessionUrl, chunk, contentType, start, end, total) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', sessionUrl, true);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.setRequestHeader('Content-Range', `bytes ${start}-${end}/${total}`);

    xhr.onload = function () {
      const { status } = xhr;
      if (status === 200 || status === 201) {
        // Upload is complete
        resolve(JSON.parse(xhr.responseText));
      } else if (status === 308) {
        // Incomplete upload, Google is expecting more data
        resolve({ status: 'incomplete', range: xhr.getResponseHeader('Range') });
      } else {
        // Error during upload
        reject(new Error(`Upload failed with status ${status}: ${xhr.responseText}`));
      }
    };

    xhr.onerror = function () {
      reject(new Error('Network error during upload'));
    };

    xhr.send(chunk);
  });
}

/**
 * Gets the current upload status of a resumable upload session
 * @param {string} sessionUrl - The resumable upload session URL
 * @returns {Promise<Object>} - A Promise that resolves to the upload status
 */
async function getUploadStatus(sessionUrl) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', sessionUrl, true);
    xhr.setRequestHeader('Content-Range', 'bytes */*');
    xhr.setRequestHeader('Content-Length', '0');

    xhr.onload = function () {
      const { status } = xhr;
      if (status === 200 || status === 201) {
        // Upload is already complete
        resolve({ complete: true, response: JSON.parse(xhr.responseText) });
      } else if (status === 308) {
        // Incomplete upload
        const range = xhr.getResponseHeader('Range');
        resolve({ complete: false, updatedRange: range });
      } else {
        reject(new Error(`Failed to get upload status: ${xhr.responseText}`));
      }
    };

    xhr.onerror = function () {
      reject(new Error('Network error while checking upload status'));
    };

    xhr.send();
  });
}

/**
 * Upload a file to Google Drive using resumable upload protocol
 * This allows for better handling of large files and network interruptions
 * @param {Object} options - Upload options
 * @param {string} options.fileId - The ID of the file to update
 * @param {Object} options.fileMetadata - The metadata for the file
 * @param {File} options.fileData - The file data to upload
 * @returns {Promise<Object>} - A Promise that resolves to the upload response
 */
async function uploadFileToDriveResumable({ fileId, fileMetadata, fileData }) {
  return new Promise(async (resolve, reject) => {
    if (!window.gapi.client.drive) {
      await window.gapi.client.load('drive', 'v3');
    }

    const contentType = fileData.type || 'application/octet-stream';
    const fileSize = fileData.size;

    try {
      // Step 1: Start a resumable upload session
      const sessionUrl = await initiateResumableUpload(fileId, contentType, fileMetadata);

      // Step 2: Upload the file data using the session URL
      const resp = await uploadFileWithResumableSession(sessionUrl, fileData, contentType, fileSize);

      logger.logInfo({
        message: LOGGER.EVENT.UPLOAD_FILE_TO_GOOGLE_DRIVE,
        reason: LOGGER.Service.GOOGLE_API_INFO,
        attributes: {
          resp,
          fileData,
          fileMetadata,
          fileId,
        },
      });
      resolve(resp);
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error,
      });
      if (error.code === STATUS_CODE.UNAUTHORIZED) {
        reject(error);
      } else {
        resolve(error);
      }
    }
  });
}

async function getUserSpaceInfo() {
  if (!window.gapi.client.drive) {
    await window.gapi.client.load('drive', 'v3');
  }
  const token = window.gapi.client.getToken();
  if (!token || !token.access_token) {
    throw new Error('No authorization token available');
  }
  const request = window.gapi.client.drive.about.get({
    fields: 'storageQuota',
  });

  return executeRequestToDrive(request, {
    context: 'getUserSpaceInfo',
  });
}

function clearGoogleAccessTokenCookie() {
  cookieManager.delete(CookieStorageKey.GOOGLE_IMPLICIT_ACCESS_TOKEN);
}

// Export individual functions for testing (without gapiWrapper)
export {
  insertFileToDrive,
  uploadFileToDrive,
  uploadFileToDriveResumable,
  requestPermission,
  getFileInfo,
  downloadFile,
  executeRequestToDrive,
  onLoadFileReaderUploadFile,
  onLoadFileReaderInsertFile,
  getCurrentRemoteEmail,
  getCurrentUserId,
  hasGrantedScope,
  renameFileToDrive,
  getTokenInfo,
  removeImplicitAccessToken,
  getBasicProfile,
  isSignedIn,
  setOAuth2Token,
  isSignedInWithGoolge,
  getFileContent,
  implicitSignIn,
  getImplicitAccessToken,
  getAccessTokenEmail,
  isValidToken,
  getFileRevisions,
  getPreviousFileVersionContent,
  syncUpAccessToken,
  checkAuthorizedUserHasPopularDomain,
  checkGoogleAccessTokenExpired,
  getUserSpaceInfo,
  getProfileWithOauth2Token,
  getAccessTokenInfo,
  injectAccessTokenInfo,
  removeExcludeScopes,
  trackGooglePopupModal,
  initiateResumableUpload,
  uploadFileWithResumableSession,
  readFileAsArrayBuffer,
  uploadChunk,
  getUploadStatus,
};

// Default export with gapiWrapper for production use

export default {
  insertFileToDrive: gapiWrapper(insertFileToDrive),
  uploadFileToDrive: gapiWrapper(uploadFileToDrive),
  uploadFileToDriveResumable: gapiWrapper(uploadFileToDriveResumable),
  requestPermission: gapiWrapper(requestPermission),
  getFileInfo: gapiWrapper(getFileInfo),
  downloadFile: gapiWrapper(downloadFile),
  executeRequestToDrive: gapiWrapper(executeRequestToDrive),
  onLoadFileReaderUploadFile: gapiWrapper(onLoadFileReaderUploadFile),
  onLoadFileReaderInsertFile: gapiWrapper(onLoadFileReaderInsertFile),
  getCurrentRemoteEmail: gapiWrapper(getCurrentRemoteEmail),
  getCurrentUserId: gapiWrapper(getCurrentUserId),
  hasGrantedScope,
  renameFileToDrive: gapiWrapper(renameFileToDrive),
  getTokenInfo: gapiWrapper(getTokenInfo),
  removeImplicitAccessToken,
  getBasicProfile: gapiWrapper(getBasicProfile),
  isSignedIn,
  setOAuth2Token,
  isSignedInWithGoolge,
  getFileContent: gapiWrapper(getFileContent),
  implicitSignIn,
  getImplicitAccessToken,
  getAccessTokenEmail,
  isValidToken,
  getFileRevisions: gapiWrapper(getFileRevisions),
  getPreviousFileVersionContent: gapiWrapper(getPreviousFileVersionContent),
  syncUpAccessToken,
  checkAuthorizedUserHasPopularDomain,
  checkGoogleAccessTokenExpired,
  clearGoogleAccessTokenCookie,
  getUserSpaceInfo: gapiWrapper(getUserSpaceInfo),
  getAccessTokenInfo: gapiWrapper(getAccessTokenInfo),
  injectAccessTokenInfo: gapiWrapper(injectAccessTokenInfo),
};
