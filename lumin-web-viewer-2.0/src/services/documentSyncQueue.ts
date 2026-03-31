import { AnyAction, Dispatch } from 'redux';

import Axios from '@libs/axios';
import { SaveOperationType } from 'types/saveOperations';

import actions from 'actions';
import core from 'core';
import { store } from 'store';

import timeTracking from 'screens/Viewer/time-tracking';

import { Handler, storageHandler } from 'HOC/OfflineStorageHOC';

import documentServices from 'services/documentServices';
import { socketService } from 'services/socketServices';

import fireEvent from 'helpers/fireEvent';
import { requestIdleCallback } from 'helpers/requestIdleCallback';

import documentEvent from 'utils/Factory/EventCollection/DocumentEventCollection';
import fileUtils from 'utils/file';
import { getLinearizedDocumentFile } from 'utils/getFileService';
import { completeSaveOperation, startSaveOperation } from 'utils/saveOperationUtils';

import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { SAVE_OPERATION_TYPES, SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';
import { SAVING_DOCUMENT } from 'constants/timeTracking';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { UploadDocFrom } from './types/documentServices.types';

interface SyncOptions {
  increaseVersion?: boolean;
  isAppliedOCR?: boolean;
  uploadDocFrom?: UploadDocFrom;
  action?: SaveOperationType;
}

interface DocumentSyncStatus {
  isCurrentlySync: boolean;
  isProcessing: boolean;
}

interface S3FileSyncStatus {
  status: 'syncing' | 'preparing' | 'failed';
  isAppliedOCR?: boolean;
  increaseVersion: boolean;
}

interface SyncResult {
  data?: unknown;
  status?: number;
  statusText?: string;
}

interface TimeTrackingInfo {
  timeTracking?: number;
}

/**
 * Global document sync queue manager
 * Ensures only one document syncs at a time across the application
 */
class DocumentSyncQueue {
  private currentController: AbortController | null;

  private currentDocumentId: string | null;

  private isProcessing: boolean;

  private dispatch: Dispatch;

  private currentOperationId: string | null;

  constructor() {
    this.currentController = null;
    this.currentDocumentId = null;
    this.isProcessing = false;
    this.dispatch = store.dispatch;
  }

  async addToQueue(currentDocument: IDocumentBase, options: SyncOptions = {}): Promise<SyncResult> {
    const documentId = currentDocument._id;

    if (this.currentController && !this.currentController.signal.aborted) {
      this.currentController.abort();
    }

    this.currentController = new AbortController();
    this.currentDocumentId = documentId;
    this.isProcessing = true;

    const operationId = startSaveOperation(this.dispatch, options.action || SAVE_OPERATION_TYPES.AUTO_SYNC, {
      metadata: {
        documentId,
        increaseVersion: options.increaseVersion,
        isAppliedOCR: options.isAppliedOCR,
        uploadDocFrom: options.uploadDocFrom,
      },
    });

    try {
      const result = await this._performSync(currentDocument, options, this.currentController.signal);

      completeSaveOperation(this.dispatch, operationId, { status: SAVE_OPERATION_STATUS.SUCCESS });

      return result;
    } catch (error) {
      const isCanceledError = error instanceof Error && error.name === 'CanceledError';
      const status = isCanceledError ? SAVE_OPERATION_STATUS.CANCELLED : SAVE_OPERATION_STATUS.ERROR;
      completeSaveOperation(this.dispatch, operationId, { status });
      throw error;
    } finally {
      if (this.currentController && this.currentDocumentId === documentId) {
        this.currentController = null;
        this.currentDocumentId = null;
        this.isProcessing = false;
      }
    }
  }

  private async _performSync(
    currentDocument: IDocumentBase,
    { increaseVersion = false, isAppliedOCR = false, uploadDocFrom }: SyncOptions,
    signal: AbortSignal
  ): Promise<SyncResult> {
    const { remoteId, thumbnailRemoteId, _id: documentId } = currentDocument;

    this._updateS3FileSyncStatus(documentId, { status: 'syncing', isAppliedOCR, increaseVersion });

    let file: File;
    let thumbnail: File | null = null;

    try {
      file = await getLinearizedDocumentFile(currentDocument.name);
    } catch (error) {
      this._updateS3FileSyncStatus(documentId, { status: 'failed', isAppliedOCR, increaseVersion });
      throw new Error(
        `Failed to get linearized document file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    try {
      const thumbnailCanvas = await fileUtils.getThumbnailWithDocument(core.getDocument(), {});
      thumbnail = await fileUtils.convertThumnailCanvasToFile(thumbnailCanvas);
    } catch (error) {
      console.warn('Failed to generate thumbnail, continuing without it:', error);
    }

    const { encodedUploadData } = await documentServices.uploadDocumentWithThumbnailToS3({
      thumbnail,
      thumbnailRemoteId,
      remoteId,
      file,
      signal,
      uploadDocFrom,
    });

    timeTracking.register(SAVING_DOCUMENT);

    const result = await Axios.axiosInstance.post<{ etag: string; isSyncing: boolean }>(
      '/document/v2/sync-file-s3',
      {
        documentId,
        encodedUploadData,
        increaseVersion,
      },
      { signal }
    );

    fireEvent(CUSTOM_EVENT.DOCUMENT_SYNC_COMPLETED, { documentId, result: result.data });

    requestIdleCallback(() => {
      this.trackDocumentSavingTime(currentDocument);
      this._updateCache({ currentDocument, file, etag: result.data?.etag }).catch(() => {});
    });
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  private trackDocumentSavingTime(currentDocument: IDocumentBase) {
    timeTracking.finishTracking(SAVING_DOCUMENT);

    const timeTrackingInfo = timeTracking.getTrackingInfo(SAVING_DOCUMENT) as TimeTrackingInfo;
    const timeToSaveTheDocument = timeTrackingInfo?.timeTracking;
    if (timeToSaveTheDocument) {
      documentEvent
        .documentSaving({
          timeToSaveTheDocument,
          source: currentDocument.service,
        })
        .catch(() => {});
    }

    timeTracking.unRegister(SAVING_DOCUMENT);
  }

  // eslint-disable-next-line class-methods-use-this
  private _updateS3FileSyncStatus(documentId: string, syncStatus: S3FileSyncStatus): void {
    socketService.modifyDocumentContent(documentId, syncStatus);
  }

  private async _updateCache({
    currentDocument,
    file,
    etag,
  }: {
    currentDocument: IDocumentBase;
    file: File;
    etag: string;
  }): Promise<void> {
    const isOfflineEnable = Handler.isOfflineEnabled && currentDocument.isOfflineValid;

    if (isOfflineEnable) {
      const response = new Response(file);
      await storageHandler.deleteFile(currentDocument.signedUrl);
      await storageHandler.putCustomFile(currentDocument.signedUrl, response);
    }
    documentCacheBase.updateCache({ key: getCacheKey(currentDocument._id), etag, file }).catch(() => {});
    this.dispatch(
      actions.updateCurrentDocument({
        size: file.size,
      }) as AnyAction
    );
  }

  getCurrentSyncingDocument(): string | null {
    return this.currentDocumentId;
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  cancelCurrentSync(operationId: string): void {
    if (this.currentController && !this.currentController.signal.aborted) {
      if (operationId) {
        completeSaveOperation(this.dispatch, operationId, { status: SAVE_OPERATION_STATUS.CANCELLED });
      }
      this.currentController.abort();
    }
  }

  getDocumentSyncStatus(documentId: string): DocumentSyncStatus {
    return {
      isCurrentlySync: this.currentDocumentId === documentId,
      isProcessing: this.isProcessing,
    };
  }
}

export const documentSyncQueue = new DocumentSyncQueue();
