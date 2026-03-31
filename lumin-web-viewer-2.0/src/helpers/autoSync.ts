import dayjs from 'dayjs';
import { get } from 'lodash';
import { AnyAction } from 'redux';

import actions from 'actions';
import core from 'core';
import { store } from 'store';

import timeTracking from 'screens/Viewer/time-tracking';

import documentServices from 'services/documentServices';
import { socketService } from 'services/socketServices';

import logger from 'helpers/logger';

import { file as fileUtils, getFileService } from 'utils';
import { checkAndDispatchQuotaExceeded } from 'utils/checkQuotaExternalStorage';
import documentEvent from 'utils/Factory/EventCollection/DocumentEventCollection';
import { isBlockPopUpError } from 'utils/googleDriveError';

import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';
import { setIsExceedQuotaExternalStorage } from 'features/QuotaExternalStorage/slices';

import { SYNC_RESULT, AUTO_SYNC_ERROR } from 'constants/autoSyncConstant';
import { general } from 'constants/documentType';
import { ErrorCode } from 'constants/errorCode';
import { AUTO_SYNC_BYTE_MAXIMUM } from 'constants/fileSize';
import { STORAGE_TYPE, LOGGER, MAX_DOCUMENT_SIZE, STATUS_CODE } from 'constants/lumin-common';
import { SAVING_DOCUMENT } from 'constants/timeTracking';

import { IDocumentBase } from 'interfaces/document/document.interface';

const DEFAULT_ENABLE_AUTO_SYNC_DATE = '2023-02-15';

interface SyncDataChange {
  isFileContentChanged?: boolean;
  [key: string]: unknown;
}

interface SyncResponse {
  remoteId: string;
  documentId: string;
  status: string;
  message: string;
  reason: string;
  dataSync: SyncDataChange;
  hasBackupToS3: boolean;
}

interface SyncResult {
  code?: number;
  errors?: Array<{ message?: string; reason?: string }>;
  md5Checksum?: string;
  [key: string]: unknown;
}

/**
 * Check if the file is syncable with Google Drive
 * @param {object} doc - The document object to check.
 * @returns {boolean} - Returns true if the file is syncable with Google Drive, false otherwise.
 */
export const isSyncableFile = ({ service, mimeType }: Pick<IDocumentBase, 'service' | 'mimeType'>): boolean =>
  service === STORAGE_TYPE.GOOGLE && mimeType === general.PDF;

export const isOversizeToAutoSync = (docSize: number): boolean => docSize > AUTO_SYNC_BYTE_MAXIMUM;

export const isAutoSync = (doc: IDocumentBase): boolean =>
  doc && isSyncableFile(doc) && !isOversizeToAutoSync(doc.size);

export const isManualSync = (doc: IDocumentBase): boolean => isSyncableFile(doc) && isOversizeToAutoSync(doc.size);

export const isReadyToSync = (doc: IDocumentBase): boolean =>
  isManualSync(doc) || (isAutoSync(doc) && !!doc.enableGoogleSync);

export const syncFile = async ({
  document,
  dataSync,
}: {
  document: IDocumentBase;
  dataSync?: SyncDataChange;
}): Promise<SyncResponse> => {
  const { remoteId, _id: documentId, name } = document;
  let response: SyncResponse = {
    remoteId,
    documentId,
    status: SYNC_RESULT.FAIL,
    message: '',
    reason: '',
    dataSync: dataSync || {},
    hasBackupToS3: false,
  };
  try {
    const isInContentEditMode = core.getContentEditManager().isInContentEditMode();
    const isInFormBuilderMode = core.getFormFieldCreationManager().isInFormFieldCreationMode();
    if (isInContentEditMode || isInFormBuilderMode) {
      response = {
        ...response,
        reason: AUTO_SYNC_ERROR.CANCEL_SYNC_REQUEST,
      };
      socketService.sendAutoSyncResult(response);
      return response;
    }
    const fileData = await getFileService.getLinearizedDocumentFile(name);
    if (!fileData) {
      throw new Error(ErrorCode.Document.INVALID_DOC_REFERENCE);
    }
    if (checkAndDispatchQuotaExceeded(fileData, document)) {
      return response;
    }
    timeTracking.register(SAVING_DOCUMENT);

    const typedDocumentServices = documentServices as unknown as {
      syncFileToDrive: (params: {
        fileId: string;
        fileMetadata: {
          name: string;
          mimeType: string;
        };
        fileData: File;
      }) => Promise<SyncResult>;
      uploadDriveDocumentTemporary?: (params: { _id: string; name: string }) => Promise<unknown>;
    };

    const result = await typedDocumentServices.syncFileToDrive({
      fileId: remoteId,
      fileMetadata: {
        name: fileUtils.convertExtensionToPdf(name),
        mimeType: general.PDF,
      },
      fileData,
    });

    timeTracking.finishTracking(SAVING_DOCUMENT);

    type TrackingInfo = { timeTracking?: number };
    const rawTrackingInfo: unknown = timeTracking.getTrackingInfo(SAVING_DOCUMENT);
    const trackingObject: TrackingInfo =
      rawTrackingInfo && typeof rawTrackingInfo === 'object'
        ? (rawTrackingInfo as TrackingInfo)
        : { timeTracking: undefined };
    const timeToSaveTheDocument = trackingObject.timeTracking;

    if (timeToSaveTheDocument) {
      documentEvent
        .documentSaving({
          timeToSaveTheDocument,
          source: document.service,
        })
        .catch(() => {
          /* do nothing */
        });
    }
    timeTracking.unRegister(SAVING_DOCUMENT);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    logger.logInfo({
      reason: LOGGER.EVENT.AUTO_SYNC_RESULT,
      attributes: result,
    });
    if ('code' in result && result.code !== 200) {
      const errorData = get(result, 'errors[0]') || {};
      const message = (errorData as { message?: string }).message || '';
      const reason = (errorData as { reason?: string }).reason || '';
      response = {
        ...response,
        message,
        reason,
      };
      socketService.sendAutoSyncResult(response);
      logger.logError({
        reason: LOGGER.EVENT.AUTO_SYNC_ERROR,
        message,
      });
      const maxFileSize = MAX_DOCUMENT_SIZE * 1024 * 1024;

      if (
        dataSync?.isFileContentChanged &&
        fileData.size < maxFileSize &&
        typeof typedDocumentServices.uploadDriveDocumentTemporary === 'function'
      ) {
        await typedDocumentServices.uploadDriveDocumentTemporary({
          _id: documentId,
          name,
        });
        response.hasBackupToS3 = true;
      }
    } else {
      response = {
        ...response,
        status: SYNC_RESULT.SUCCESS,
        dataSync: dataSync || {},
      };
      socketService.sendAutoSyncResult({
        ...response,
        increaseVersion: dataSync?.isFileContentChanged,
      });
      await documentCacheBase.updateCache({
        key: getCacheKey(documentId),
        etag: result.md5Checksum || '',
        file: fileData,
      });
      store.dispatch(actions.updateCurrentDocument({ size: fileData.size }) as AnyAction);
      socketService.updateDocumentSize(documentId, fileData.size);
    }
    return response;
  } catch (error: unknown) {
    const errorData = error as { reason?: string; message?: string, code?: number };
    response.reason = errorData.reason || '';
    response.message = errorData.message || '';
    if (isBlockPopUpError(error)) {
      throw error;
    }
    socketService.sendAutoSyncResult(response);
    logger.logError({
      reason: LOGGER.EVENT.AUTO_SYNC_ERROR,
      error: error instanceof Error ? error.message : String(error),
    });
    const statusCode = errorData.code;
    if (statusCode === STATUS_CODE.FORBIDDEN && errorData.reason === AUTO_SYNC_ERROR.STORAGE_QUOTA_EXCEEDED) {
      store.dispatch(setIsExceedQuotaExternalStorage(true));
    }
    return response;
  }
};

export const toggleAutoSync = (documentId: string, enableGoogleSync: boolean): void => {
  socketService.toggleAutoSync(documentId, enableGoogleSync);
};

export const isFormerUserHasDefaultAutoSync = ({ createdAt }: { createdAt: string }): boolean => {
  const userCreatedDate = dayjs(createdAt.substr(0, 10));
  const enabledFeatureDate = dayjs(DEFAULT_ENABLE_AUTO_SYNC_DATE);

  return userCreatedDate.isBefore(enabledFeatureDate);
};
