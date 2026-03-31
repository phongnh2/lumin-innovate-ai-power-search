/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable class-methods-use-this */
import {
  PublicClientApplication,
  Configuration,
  SilentRequest,
  BrowserCacheLocation,
  IdTokenClaims,
} from '@azure/msal-browser';

import Axios from '@libs/axios';

import { ONEDRIVE_TOKEN_TYPE, TokenType } from 'services/TokenStorageService';

import logger from 'helpers/logger';

import { isElectron } from 'utils/corePathHelper';

import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER } from 'constants/lumin-common';
import { BASEURL, MICROSOFT_AUTHORIZATION_URL, MICROSOFT_CLIENT_ID } from 'constants/urls';

import { OneDriveAuthenticationCancelledError } from './errors';
import { PERSONAL_FILE_PICKER_URL, DEFAULT_ONEDRIVE_AUTH_SCOPE, DriveType } from './oneDrive.constants';
import {
  GetFileBaseInputs,
  GetListThumbnailsResponse,
  OneDriveSiteInfo,
  OneDriveUserInfo,
  OnedriveFileInfo,
  UploadFileBaseInputs,
  OneDriveFilePermission,
} from './oneDrive.interface';
import { electronMicrosoftServices } from '../electronMicrosoftServices';

const ContentType = {
  JSON: 'application/json',
  OCTET_STREAM: 'application/octet-stream',
};

const msalParams: Configuration = {
  auth: {
    authority: MICROSOFT_AUTHORIZATION_URL,
    clientId: MICROSOFT_CLIENT_ID,
    redirectUri: BASEURL,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
  },
};

class OneDriveServices {
  private publicClientApplication: PublicClientApplication;

  createPublicClientApplication = async (clientId?: string) => {
    this.publicClientApplication = new PublicClientApplication(
      clientId
        ? {
            ...msalParams,
            auth: { ...msalParams.auth, clientId },
          }
        : msalParams
    );
    await this.publicClientApplication.initialize();
  };

  getConfiguration() {
    return this.publicClientApplication.getConfiguration();
  }

  private oneDriveWrapper(handler: (...rest: any[]) => any) {
    return async (...rest: any) => {
      try {
        const cacheAccessToken = localStorage.getItem(LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN);
        if (!cacheAccessToken) {
          await this.getTokenWithScopes({
            scopes: [],
            loginHint: this.getCurrentAccountEmailInCache(),
          });
        } else {
          const { email, expiredAt } = JSON.parse(cacheAccessToken) as {
            email: string;
            expiredAt: string;
          };
          if (Number(expiredAt) < Date.now()) {
            await this.getTokenWithScopes({
              scopes: [],
              loginHint: email,
            });
            localStorage.removeItem(LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN);
          }
        }
        return handler(...rest);
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
          error: error as Error,
        });
        throw error;
      }
    };
  }

  getTokenWithScopes = async ({
    scopes,
    loginHint,
    additionalAuthParams = {},
    tokenType = ONEDRIVE_TOKEN_TYPE.FILE_ACCESS,
  }: {
    scopes: string[];
    loginHint?: string;
    additionalAuthParams?: Omit<SilentRequest, 'scopes'>;
    tokenType?: TokenType;
  }): Promise<{
    cid: string;
    accessToken: string;
  }> => {
    if (isElectron()) {
      const tokenData = await electronMicrosoftServices.authenticate({
        scopes: scopes.length ? scopes : [DEFAULT_ONEDRIVE_AUTH_SCOPE],
        loginHint,
        prompt: (additionalAuthParams.prompt || '') as 'consent' | 'select_account' | '',
        authority: additionalAuthParams.authority,
        tokenType,
      });

      if (!tokenData) {
        throw new OneDriveAuthenticationCancelledError();
      }

      return {
        cid: tokenData.cid,
        accessToken: tokenData.access_token,
      };
    }

    let accessToken = '';
    let cid = '';
    const authParams = {
      scopes: scopes.length ? scopes : [DEFAULT_ONEDRIVE_AUTH_SCOPE],
      loginHint,
      ...(!loginHint && { prompt: 'select_account' }),
      ...additionalAuthParams,
    };
    try {
      // see if we have already the idtoken saved
      const resp = await this.publicClientApplication.acquireTokenSilent(authParams);
      accessToken = resp.accessToken;
      cid = (resp.idTokenClaims as IdTokenClaims).oid.replace(/-/g, '').slice(16);
    } catch (e) {
      localStorage.removeItem(LocalStorageKey.ONEDRIVE_FILE_PICKER_CACHE);
      // per examples we fall back to popup
      const resp = await this.publicClientApplication.loginPopup(authParams);
      this.publicClientApplication.setActiveAccount(resp.account);

      if (resp.idToken) {
        const resp2 = await this.publicClientApplication.acquireTokenSilent(authParams);
        accessToken = resp2.accessToken;
        cid = (resp2.idTokenClaims as IdTokenClaims).oid.replace(/-/g, '').slice(16);
      } else {
        throw e;
      }
    }
    return {
      cid,
      accessToken,
    };
  };

  getToken = async (): Promise<{
    cid: string;
    accessToken: string;
  }> => {
    const cacheAccessToken = localStorage.getItem(LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN);
    if (!cacheAccessToken) {
      return this.getTokenWithScopes({ scopes: [] });
    }
    const { email, expiredAt, accessToken, oid } = JSON.parse(cacheAccessToken) as {
      email: string;
      expiredAt: string;
      accessToken: string;
      oid: string;
    };
    if (Number(expiredAt) < Date.now()) {
      localStorage.removeItem(LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN);
      return this.getTokenWithScopes({
        scopes: [],
        loginHint: email,
      });
    }
    return { accessToken, cid: oid.replace(/-/g, '').slice(16) };
  };

  async getFileInfo({ driveId, remoteId }: Pick<GetFileBaseInputs, 'driveId' | 'remoteId'>): Promise<OnedriveFileInfo> {
    try {
      const response = await Axios.oneDriveInstance.get(`/drives/${driveId}/items/${remoteId}`, {
        headers: {
          'Content-Type': ContentType.JSON,
        },
      });
      return response.data as OnedriveFileInfo;
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
        error: error as Error,
        message: 'Error getting file info',
      });
      throw error;
    }
  }

  async getFilePermissions({
    driveId,
    remoteId,
  }: Pick<GetFileBaseInputs, 'driveId' | 'remoteId'>): Promise<{ value: OneDriveFilePermission[] }> {
    try {
      const response = await Axios.oneDriveInstance.get(`/drives/${driveId}/items/${remoteId}/permissions`, {
        headers: {
          'Content-Type': ContentType.JSON,
        },
      });
      return response.data as { value: OneDriveFilePermission[] };
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
        error: error as Error,
        message: 'Error getting file permissions',
      });
      throw error;
    }
  }

  async getListThumbnails({
    driveId,
    remoteId,
  }: Pick<GetFileBaseInputs, 'driveId' | 'remoteId'>): Promise<GetListThumbnailsResponse> {
    try {
      const response = await Axios.oneDriveInstance.get(`/drives/${driveId}/items/${remoteId}/thumbnails`, {
        headers: {
          'Content-Type': ContentType.JSON,
        },
      });
      return response.data as GetListThumbnailsResponse;
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
        error: error as Error,
        message: 'Error getting list thumbnails',
      });
      throw error;
    }
  }

  async getFileContent({ remoteId, driveId, name, mimeType }: GetFileBaseInputs): Promise<File> {
    try {
      const response = await Axios.oneDriveInstance.get(`/drives/${driveId}/items/${remoteId}/content`, {
        responseType: 'blob',
      });
      return new File([new Blob([response.data] as BlobPart[])], name, { type: mimeType });
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
        error: error as Error,
        message: 'Error getting content',
      });
      throw error;
    }
  }

  async renameFile({
    fileId,
    driveId,
    newName,
  }: {
    driveId: string;
    fileId: string;
    newName: string;
  }): Promise<OnedriveFileInfo> {
    try {
      const response = await Axios.oneDriveInstance.patch(`/drives/${driveId}/items/${fileId}`, {
        name: newName,
      });
      return response.data as OnedriveFileInfo;
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
        error: error as Error,
        message: 'Error renaming file',
      });
      throw error;
    }
  }

  async getMe(): Promise<OneDriveUserInfo> {
    const response = await Axios.oneDriveInstance.get('/me/drive');
    return response.data as OneDriveUserInfo;
  }

  async getRootInfo(): Promise<OnedriveFileInfo> {
    const response = await Axios.oneDriveInstance.get('/drives/me/root');
    return response.data as OnedriveFileInfo;
  }

  async getSiteInfo(): Promise<OneDriveSiteInfo> {
    const response = await Axios.oneDriveInstance.get('/sites/root');
    return response.data as OneDriveSiteInfo;
  }

  async getPickerInitialData(): Promise<{ baseUrl: string; driveType: DriveType }> {
    try {
      let results;
      const { driveType } = await this.getMe();
      if (driveType === DriveType.Personal) {
        results = {
          baseUrl: PERSONAL_FILE_PICKER_URL,
          driveType,
        };
      } else {
        const siteInfo = await this.getSiteInfo();
        results = {
          baseUrl: siteInfo.webUrl,
          driveType,
        };
      }
      localStorage.setItem(LocalStorageKey.ONEDRIVE_FILE_PICKER_CACHE, JSON.stringify(results));
      return results;
    } catch (error) {
      logger.logError({
        context: this.getPickerInitialData.name,
        reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
        message: error instanceof Error ? error.message : 'Error getting base picker url',
      });
      throw error;
    }
  }

  getCurrentAccount = () => this.publicClientApplication.getActiveAccount();

  isSignedIn = () =>
    localStorage.getItem(LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN) || this.publicClientApplication.getActiveAccount();

  logoutCurrentAccount = async () => {
    if (isElectron()) {
      electronMicrosoftServices.signOut();
    }
    await this.publicClientApplication.clearCache();
  };

  getAccessToken = async (): Promise<string> => {
    const cacheAccessToken = localStorage.getItem(LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN);
    const anonymousModeHintEmail = localStorage.getItem(LocalStorageKey.ANONYMOUS_MODE_HINT_EMAIL);
    localStorage.removeItem(LocalStorageKey.ANONYMOUS_MODE_HINT_EMAIL);
    if (!cacheAccessToken) {
      const { accessToken } = await this.getTokenWithScopes({
        scopes: [],
        ...(anonymousModeHintEmail && { loginHint: anonymousModeHintEmail }),
      });
      return accessToken;
    }
    const { accessToken, expiredAt, email } = JSON.parse(cacheAccessToken) as {
      accessToken: string;
      expiredAt: string;
      email: string;
    };
    if (Number(expiredAt) < Date.now()) {
      localStorage.removeItem(LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN);
      const { accessToken: newAccessToken } = await this.getTokenWithScopes({ scopes: [], loginHint: email });
      return newAccessToken;
    }
    return accessToken;
  };

  private async overrideFileContent(
    { remoteId, driveId, file }: UploadFileBaseInputs,
    { signal }: { signal?: AbortSignal } = {}
  ): Promise<OnedriveFileInfo> {
    try {
      const res = await Axios.oneDriveInstance.put(`/drives/${driveId}/items/${remoteId}/content`, file, {
        signal,
      });
      return res.data;
    } catch (error) {
      if (!Axios.axios.isCancel(error)) {
        logger.logError({
          reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
          error: error as Error,
        });
      }
      throw error;
    }
  }

  private async uploadLargeFile(
    uploadUrl: string,
    file: Blob,
    { signal }: { signal?: AbortSignal } = {}
  ): Promise<OnedriveFileInfo> {
    const fileSize = file.size;
    // Ref: https://learn.microsoft.com/vi-vn/onedrive/developer/rest-api/api/driveitem_createuploadsession?view=odsp-graph-online#:~:text=A%20byte%20range%20size%20of%2010%20MiB%20for%20stable%20high%20speed%20connections%20is%20optimal.%20For%20slower%20or%20less%20reliable%20connections%20you%20may%20get%20better%20results%20from%20a%20smaller%20fragment%20size.%20The%20recommended%20fragment%20size%20is%20between%205%2D10%20MiB.
    const chunkSize = 1024 * 1024 * 10; // 10 MiB
    let start = 0;
    let response;
    while (start < fileSize) {
      const end = Math.min(start + chunkSize, fileSize);
      const fileChunk = file.slice(start, end);

      const range = `bytes ${start}-${end - 1}/${fileSize}`;
      // eslint-disable-next-line no-await-in-loop
      response = await Axios.axios.put(uploadUrl, fileChunk, {
        headers: {
          'Content-Range': range,
          'Content-Length': fileChunk.size,
        },
        signal,
      });
      start = end;
    }
    return response.data as OnedriveFileInfo;
  }

  private async overrideLargeFileContent(
    { remoteId, driveId, file }: UploadFileBaseInputs,
    { signal }: { signal?: AbortSignal } = {}
  ): Promise<OnedriveFileInfo> {
    let uploadUrl = '';
    try {
      const { data } = await Axios.oneDriveInstance.post<{ uploadUrl: string }>(
        `/drives/${driveId}/items/${remoteId}/createUploadSession`,
        {
          item: {
            '@microsoft.graph.conflictBehavior': 'replace',
          },
        },
        { signal }
      );
      uploadUrl = data.uploadUrl;
      return await this.uploadLargeFile(uploadUrl, file);
    } catch (error) {
      if (!Axios.axios.isCancel(error)) {
        logger.logError({
          reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
          error: error as Error,
        });
      }
      if (uploadUrl) {
        await Axios.axios.delete(uploadUrl).catch(() => {});
      }
      throw error;
    }
  }

  private async insertFileContent(
    { driveId, file, fileName, folderId }: UploadFileBaseInputs,
    { signal }: { signal?: AbortSignal } = {}
  ): Promise<OnedriveFileInfo> {
    let id = driveId;
    const folder = folderId || 'root';
    try {
      if (!id) {
        const driveData = await this.getMe();
        id = driveData.id;
      }
      const res = await Axios.oneDriveInstance.put(`/drives/${id}/items/${folder}:/${fileName}:/content`, file, {
        signal,
        params: {
          '@microsoft.graph.conflictBehavior': 'rename',
        },
      });
      return res.data;
    } catch (error) {
      if (!Axios.axios.isCancel(error)) {
        logger.logError({
          reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
          error: error as Error,
        });
      }
      throw error;
    }
  }

  private async insertLargeFileContent(
    { driveId, file, fileName, folderId }: UploadFileBaseInputs,
    { signal }: { signal?: AbortSignal } = {}
  ): Promise<OnedriveFileInfo> {
    let uploadUrl = '';
    let id = driveId;
    const folder = folderId || 'root';
    try {
      if (!id) {
        const driveData = await this.getMe();
        id = driveData.id;
      }
      const { data } = await Axios.oneDriveInstance.post<{ uploadUrl: string }>(
        `/drives/${id}/items/${folder}:/${fileName}:/createUploadSession`,
        {
          item: {
            '@microsoft.graph.conflictBehavior': 'rename',
          },
        },
        { signal }
      );
      uploadUrl = data.uploadUrl;
      return await this.uploadLargeFile(uploadUrl, file, { signal });
    } catch (error) {
      if (!Axios.axios.isCancel(error)) {
        logger.logError({
          reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
          error: error as Error,
        });
      }
      if (uploadUrl) {
        await Axios.axios.delete(uploadUrl).catch(() => {});
      }
      throw error;
    }
  }

  overrideContent = async (
    inputs: UploadFileBaseInputs,
    { signal }: { signal?: AbortSignal } = {}
  ): Promise<OnedriveFileInfo> => {
    const { file } = inputs;

    if (this.isSmallFileSize(file)) {
      return this.overrideFileContent(inputs, { signal });
    }
    return this.overrideLargeFileContent(inputs, { signal });
  };

  insertFileToOneDrive = async (
    inputs: UploadFileBaseInputs,
    { signal }: { signal?: AbortSignal } = {}
  ): Promise<OnedriveFileInfo> => {
    const { file } = inputs;

    if (this.isSmallFileSize(file)) {
      return this.insertFileContent(inputs, { signal });
    }
    return this.insertLargeFileContent(inputs, { signal });
  };

  private isSmallFileSize(file: Blob) {
    // Ref: https://learn.microsoft.com/vi-vn/onedrive/developer/rest-api/api/driveitem_put_content?view=odsp-graph-online#:~:text=This%20method%20only%20supports%20files%20up%20to%204MB%20in%20size.
    return file.size <= 4 * 1024 * 1024; // 4MB
  }

  getCurrentAccountEmailInCache = (): string => {
    const cacheAccessToken = localStorage.getItem(LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN);
    if (cacheAccessToken) {
      const { email } = JSON.parse(cacheAccessToken) as { email: string };
      return email;
    }
    const currentAccount = this.getCurrentAccount();
    const remoteEmail = currentAccount?.idTokenClaims?.email as string;
    return remoteEmail ? remoteEmail.toLowerCase() : '';
  };

  public getAccountRemoteEmail = async (): Promise<string> => {
    const wrappedFunction = this.oneDriveWrapper(this.getCurrentAccountEmailInCache);
    return wrappedFunction();
  };

  getUserSpaceInfo = async (): Promise<{
    deleted: number;
    fileCount: number;
    remaining: number;
    state: string;
    total: number;
  }> => {
    // Ref: https://learn.microsoft.com/en-us/onedrive/developer/rest-api/api/drive_get?view=odsp-graph-online
    const response = await Axios.oneDriveInstance.get('/me/drive/quota');
    const quota = response.data as {
      deleted: number;
      fileCount: number;
      remaining: number;
      state: string;
      total: number;
    };
    return {
      deleted: quota.deleted,
      fileCount: quota.fileCount,
      remaining: quota.remaining,
      state: quota.state,
      total: quota.total,
    };
  };
}

export const oneDriveServices = new OneDriveServices();
