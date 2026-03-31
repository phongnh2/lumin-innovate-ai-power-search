import { AnyAction } from 'redux';

import actions from 'actions';
import { store } from 'store';

import documentServices from 'services/documentServices';
import googleServices from 'services/googleServices';
import { oneDriveServices } from 'services/oneDriveServices';

import logger from 'helpers/logger';

import { checkOneDrivePermissions } from 'features/Annotation/utils/checkOneDrivePermissions';

import { documentStorage } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

export default async function getThirdPartyFileInfo(currentDocument: IDocumentBase) {
  let fileInfo;
  try {
    switch (currentDocument.service) {
      case documentStorage.google: {
        fileInfo = await googleServices.getFileInfo(
          currentDocument.remoteId,
          'capabilities,size,md5Checksum,permissions,parents',
          'onFinishRendering'
        );
        const canModifyDriveContent = fileInfo.capabilities.canModifyContent;
        store.dispatch(actions.setCanModifyDriveContent(canModifyDriveContent) as AnyAction);
        break;
      }
      case documentStorage.onedrive: {
        fileInfo = await oneDriveServices.getFileInfo({
          driveId: currentDocument.externalStorageAttributes.driveId,
          remoteId: currentDocument.remoteId,
        });
        checkOneDrivePermissions().catch(() => {});
        break;
      }
      case documentStorage.dropbox: {
        const res = await documentServices.getDropboxFileInfo(currentDocument.remoteId);
        fileInfo = res.data;
        break;
      }
      default:
        return null;
    }
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.DOCUMENT_INFO,
      error: error as Error,
    });
  }
  return fileInfo;
}
