import axios, { type AxiosResponse } from 'axios';

import { oneDriveServices } from 'services/oneDriveServices';

import logger from 'helpers/logger';

import SessionUtils from 'utils/session';

import { socket } from '@socket';

import { AUTHORIZATION_HEADER } from 'constants/authConstant';
import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER } from 'constants/lumin-common';
import {
  AXIOS_BASEURL,
  AUTH_SERVICE_URL,
  ONE_DRIVE_BASE_URL,
  SIGN_BACKEND_URL,
  AGREEMENT_GEN_API_URL,
  DEVELOPER_API_BASEURL,
} from 'constants/urls';

import { RequestHeaderDeviceTypes, RequestHeaderKeys } from './constants';
import retry from './retry';

const isProductionMode = process.env.NODE_ENV !== 'development';

const axiosInstance = axios.create({
  baseURL: AXIOS_BASEURL,
  withCredentials: true,
});

const axiosLuminAuth = axios.create({
  baseURL: `${AUTH_SERVICE_URL}/api`,
  withCredentials: true,
});

axiosLuminAuth.interceptors.request.use(async (config) => {
  const token = await SessionUtils.getAuthorizedToken();
  if (token) {
    Object.assign(config.headers, {
      Authorization: `Bearer ${token}`,
    });
  }
  return config;
});

retry(axiosLuminAuth);

axiosInstance.interceptors.request.use(async (config) => {
  const token = await SessionUtils.getAuthorizedToken();
  if (token) {
    Object.assign(config.headers, {
      [AUTHORIZATION_HEADER]: `Bearer ${token}`,
      errorContext: new Error('Thrown at:'), // tracking error location
      [RequestHeaderKeys.SocketId]: socket._id,
    });
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    logger.logInfo({
      message: LOGGER.EVENT.AXIOS_INSTANCE_RESPONSE,
      reason: LOGGER.Service.NETWORK_INFO,
    });
    return response;
  },
  (error: Error) => {
    if (!axios.isCancel(error)) {
      logger.logError({
        reason: LOGGER.Service.NETWORK_ERROR,
        error,
      });
    }

    return Promise.reject(error);
  }
);

retry(axiosInstance);

const dropboxInstance = axios.create();

dropboxInstance.interceptors.request.use((config) => {
  const authorization = `Bearer ${localStorage.getItem('token-dropbox')}`;
  Object.assign(config.headers, {
    authorization,
  });
  return config;
});

dropboxInstance.interceptors.response.use(
  (response) => {
    logger.logInfo({
      message: LOGGER.EVENT.DROPBOX_INSTANCE_RESPONSE,
      reason: LOGGER.Service.DROPBOX_API_INFO,
    });
    return response;
  },
  (error: Error) => {
    if (!axios.isCancel(error)) {
      logger.logError({
        reason: LOGGER.Service.DROPBOX_API_ERROR,
        error,
      });
    }
    return Promise.reject(error);
  }
);

const editorInstance = axios.create({
  ...(isProductionMode && { withCredentials: true }),
  headers: {
    [RequestHeaderKeys.LuminDeviceType]: RequestHeaderDeviceTypes.Web,
  },
});

editorInstance.interceptors.request.use(async (config) => {
  const token = await SessionUtils.getAuthorizedToken();
  if (token) {
    Object.assign(config.headers, {
      [`Authorization-V2`]: `Bearer ${token}`,
    });
  }
  return config;
});

const axiosLuminSignInstance = axios.create({
  baseURL: SIGN_BACKEND_URL,
  withCredentials: true,
});

axiosLuminSignInstance.interceptors.request.use(async (config) => {
  const token = await SessionUtils.getAuthorizedToken();
  if (token) {
    Object.assign(config.headers, {
      [AUTHORIZATION_HEADER]: `Bearer ${token}`,
    });
  }
  return config;
});

const oneDriveInstance = axios.create({
  baseURL: ONE_DRIVE_BASE_URL,
});

oneDriveInstance.interceptors.request.use(async (config) => {
  const shouldRenewToken = Boolean(localStorage.getItem(LocalStorageKey.SHOULD_RENEW_ONEDRIVE_AUTH_TOKEN));
  const accessToken = shouldRenewToken
    ? (
        await oneDriveServices.getTokenWithScopes({
          scopes: [],
          additionalAuthParams: {
            forceRefresh: true,
          },
        })
      ).accessToken
    : await oneDriveServices.getAccessToken();
  if (accessToken) {
    const authorization = `Bearer ${accessToken}`;
    Object.assign(config.headers, {
      Authorization: authorization,
    });
    localStorage.removeItem(LocalStorageKey.SHOULD_RENEW_ONEDRIVE_AUTH_TOKEN);
  }
  return config;
});

const axiosAgreementGenInstance = axios.create({
  baseURL: AGREEMENT_GEN_API_URL,
});

axiosAgreementGenInstance.interceptors.request.use(async (config) => {
  Object.assign(config.headers, {
    authorization: `Bearer ${await SessionUtils.getAuthorizedToken()}`,
  });
  return config;
});

const axiosDeveloperApiInstance = axios.create({
  baseURL: DEVELOPER_API_BASEURL,
});

axiosDeveloperApiInstance.interceptors.request.use(async (config) => {
  Object.assign(config.headers, {
    authorization: `Bearer ${await SessionUtils.getAuthorizedToken()}`,
  });
  return config;
});

export default {
  axios,
  axiosInstance,
  dropboxInstance,
  axiosLuminAuth,
  editorInstance,
  axiosLuminSignInstance,
  oneDriveInstance,
  axiosAgreementGenInstance,
  axiosDeveloperApiInstance,
};

export { AxiosResponse };
