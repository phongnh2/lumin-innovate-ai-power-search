import { dropboxServices, googleServices, oneDriveServices } from 'services';
import electronDropboxServices from 'services/electronDropboxServices';

import { getFileService } from 'utils';
import { isElectron } from 'utils/corePathHelper';

import { documentStorage } from 'constants/documentConstants';
import { MAX_DOCUMENT_SIZE } from 'constants/lumin-common';
import { DROPBOX_AUTHORIZE_DOWNLOAD_API } from 'constants/urls';

const AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED';

const authorizeAccountService = async (service) => {
  switch (service) {
    case documentStorage.dropbox: {
      try {
        const user = await dropboxServices.getDropboxUserInfo();
        if (!user) {
          throw new Error(AUTHENTICATION_FAILED);
        }
      } catch (error) {
        if (isElectron()) {
          electronDropboxServices.authenticate({ authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API }).catch(() => {});
        } else {
          window.open(DROPBOX_AUTHORIZE_DOWNLOAD_API, '_blank');
        }
        throw new Error(AUTHENTICATION_FAILED);
      }
      break;
    }
    case documentStorage.google: {
      if (!googleServices.isSignedIn()) {
        try {
          await googleServices.implicitSignIn();
        } catch (e) {
          throw new Error(AUTHENTICATION_FAILED);
        }
      }
      break;
    }
    case documentStorage.onedrive: {
      const isSignedIn = oneDriveServices.isSignedIn();
      if (!isSignedIn) {
        try {
          await oneDriveServices.getToken();
        } catch (error) {
          throw new Error(AUTHENTICATION_FAILED);
        }
      }
      break;
    }
    default:
      throw new Error('No service found');
  }
};

const validateFileSize = async (document) => {
  const { remoteId, externalStorageAttributes, service } = document;
  switch (service) {
    case documentStorage.dropbox: {
      const fileInfo = await dropboxServices.getFileMetaData(remoteId);
      return fileInfo.data.size <= MAX_DOCUMENT_SIZE * 1024 * 1024;
    }
    case documentStorage.google: {
      const fileInfo = await googleServices.getFileInfo(remoteId, '*', 'validateFileSize');
      return fileInfo.size <= MAX_DOCUMENT_SIZE * 1024 * 1024;
    }
    case documentStorage.onedrive: {
      const fileInfo = await oneDriveServices.getFileInfo({
        driveId: externalStorageAttributes.driveId,
        remoteId,
      });
      return fileInfo.size <= MAX_DOCUMENT_SIZE * 1024 * 1024;
    }
    default:
      return false;
  }
};

const getExternalStorageFile = async (document) => {
  if (document.service === documentStorage.s3) {
    return null;
  }
  await authorizeAccountService(document.service);
  const isValidSize = await validateFileSize(document);
  if (!isValidSize) {
    throw new Error('File size must be less than 200 MB.');
  }
  return getFileService.getDocument(document);
};

export default getExternalStorageFile;
