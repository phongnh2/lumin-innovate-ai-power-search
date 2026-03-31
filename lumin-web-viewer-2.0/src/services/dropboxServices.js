import Axios from '@libs/axios';

import logger from 'helpers/logger';

import { isElectron } from 'utils/corePathHelper';
import fileUtils from 'utils/file';

import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER } from 'constants/lumin-common';
import { DROPBOX_AUTHORIZE_DOWNLOAD_API } from 'constants/urls';

import dropboxServices from './dropboxServices';
import electronDropboxServices from './electronDropboxServices';

const ContentType = {
  JSON: 'application/json',
  OCTET_STREAM: 'application/octet-stream',
  PLAIN_TEXT: 'text/plain; charset=dropbox-cors-hack',
};

function getUserSpaceInfo() {
  // Ref: https://www.dropbox.com/developers/documentation/http/documentation#users-get_space_usage
  logger.logInfo({
    message: LOGGER.EVENT.DROPBOX_GET_USER_SPACE_INFO,
    reason: LOGGER.Service.DROPBOX_GET_USER_SPACE_INFO,
  });
  return Axios.dropboxInstance({
    method: 'POST',
    url: 'https://api.dropboxapi.com/2/users/get_space_usage',
    headers: {
      'Content-Type': ContentType.OCTET_STREAM,
    },
  });
}

function uploadFileToDropbox({ fileId, file }, { signal } = {}) {
  logger.logInfo({
    message: LOGGER.EVENT.DROPBOX_UPLOAD_FILE,
    reason: LOGGER.Service.DROPBOX_API_INFO,
    attributes: { fileId, file },
  });
  return Axios.dropboxInstance({
    method: 'POST',
    url: 'https://content.dropboxapi.com/2/files/upload',
    headers: {
      'Dropbox-API-Arg': JSON.stringify({
        mode: 'overwrite',
        path: fileId,
      }),
      'Content-Type': ContentType.OCTET_STREAM,
    },
    data: file,
    signal,
  });
}

function insertFileToDropbox({ fileName, file, folderPath = '' }, { signal } = {}) {
  logger.logInfo({
    message: LOGGER.EVENT.DROPBOX_INSERT_FILE,
    reason: LOGGER.Service.DROPBOX_API_INFO,
    attributes: { fileName, file },
  });
  const filePath = folderPath ? `${folderPath}/${fileName}` : `/${fileName}`;
  return Axios.dropboxInstance({
    method: 'POST',
    url: 'https://content.dropboxapi.com/2/files/upload',
    headers: {
      'Dropbox-API-Arg': fileUtils.getHttpSafeHeaderJson({
        mode: 'add',
        path: filePath,
        autorename: true,
      }),
      'Content-Type': ContentType.OCTET_STREAM,
    },
    data: file,
    signal,
  });
}

function getFileMetaData(fileId, { signal } = {}) {
  logger.logInfo({
    message: LOGGER.EVENT.DROPBOX_GET_FILE_META_DATA,
    reason: LOGGER.Service.DROPBOX_API_INFO,
    attributes: { fileId },
  });
  return Axios.dropboxInstance({
    method: 'POST',
    url: `https://api.dropboxapi.com/2/files/get_metadata`,
    headers: {
      'Content-Type': ContentType.JSON,
    },
    data: JSON.stringify({ path: fileId }),
    signal,
  });
}

function getFolderFromPath(path) {
  const lastSplash = path.lastIndexOf('/');
  if (lastSplash === 0) {
    return '/';
  }
  return `${path.slice(0, path.lastIndexOf('/'))}/`;
}

async function renameFile(fileId, fileName, pathDisplay, { signal } = {}) {
  logger.logInfo({
    message: LOGGER.EVENT.DROPBOX_RENAME_FILE,
    reason: LOGGER.Service.DROPBOX_API_INFO,
    attributes: { fileId, fileName, pathDisplay },
  });
  return Axios.dropboxInstance({
    method: 'POST',
    url: 'https://api.dropboxapi.com/2/files/move_v2',
    headers: {
      'Content-Type': ContentType.JSON,
    },
    data: {
      from_path: fileId,
      to_path: `${getFolderFromPath(pathDisplay)}${fileName}`,
      autorename: true,
    },
    signal,
  });
}

async function getFileFromDropbox(fileName, fileLink) {
  logger.logInfo({
    message: LOGGER.EVENT.DROPBOX_GET_FILE,
    reason: LOGGER.Service.DROPBOX_API_INFO,
    attributes: { fileName, fileLink },
  });
  try {
    const response = await Axios.axios.get(fileLink.replace('www.dropbox.com', 'dl.dropboxusercontent.com'), {
      responseType: 'blob',
    });
    return new File([new Blob([response.data])], fileName, { type: response.data.type });
  } catch (error) {
    dropboxServices.handleErrorGetFileFromDropbox(error);
  }
}

function handleErrorGetFileFromDropbox(error) {
  logger.logError({
    error,
    reason: LOGGER.Service.DROPBOX_API_ERROR,
    attributes: { message: LOGGER.EVENT.DROPBOX_HANDLE_ERROR_GET_FILE },
  });
  localStorage.removeItem('token-dropbox');
  if (error.response.status !== 400) {
    if (isElectron()) {
      electronDropboxServices.authenticate({ authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API }).catch(() => {});
      return;
    }
    const windowLogout = window.open('https://www.dropbox.com/logout');
    windowLogout?.close();
    return;
  }

  if (isElectron()) {
    electronDropboxServices.authenticate({ authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API }).catch(() => {});
    return;
  }

  window.open(DROPBOX_AUTHORIZE_DOWNLOAD_API, '_blank');
}

function requestPermission() {
  if (isElectron()) {
    const fakeWindow = {
      closed: false,
      close: () => {
        fakeWindow.closed = true;
      },
    };

    const unsubscribe = electronDropboxServices.subscribe(({ token, error }) => {
      if (token || error) {
        fakeWindow.closed = true;
        unsubscribe();
      }
    });

    electronDropboxServices.authenticate({ authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API }).catch(() => {
      fakeWindow.closed = true;
      unsubscribe();
    });

    return fakeWindow;
  }
  return window.open(DROPBOX_AUTHORIZE_DOWNLOAD_API, '_blank');
}

function getDropboxUserInfo() {
  logger.logInfo({
    message: LOGGER.EVENT.DROPBOX_GET_USER_INFO,
    reason: LOGGER.Service.DROPBOX_API_INFO,
  });
  return Axios.dropboxInstance({
    method: 'POST',
    url: 'https://api.dropboxapi.com/2/users/get_current_account',
    headers: {
      'Content-Type': ContentType.JSON,
    },
  });
}

function isSignedIn() {
  return !!localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN);
}

export default {
  insertFileToDropbox,
  uploadFileToDropbox,
  renameFile,
  getFileMetaData,
  requestPermission,
  getFileFromDropbox,
  getFolderFromPath,
  handleErrorGetFileFromDropbox,
  getDropboxUserInfo,
  isSignedIn,
  getUserSpaceInfo,
};
