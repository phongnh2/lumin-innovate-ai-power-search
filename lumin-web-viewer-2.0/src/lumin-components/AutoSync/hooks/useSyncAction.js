import last from 'lodash/last';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import core from 'core';

import useAuthenticateService from 'lumin-components/DocumentList/hooks/useAuthenticateService';

import useMakeCancelable from 'hooks/useMakeCancelable';
import { useSaveOperation } from 'hooks/useSaveOperation';
import { useTranslation } from 'hooks/useTranslation';

import documentServices from 'services/documentServices';

import { isOversizeToAutoSync, syncFile } from 'helpers/autoSync';
import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import dateUtil from 'utils/date';
import { retryOnUnavailableService } from 'utils/retryGraphQL';

import {
  AUTO_SYNC_CHANGE_TYPE,
  AUTO_SYNC_STATUS,
  SYNC_RESULT,
  AUTO_SYNC_STORAGE,
  AUTO_SYNC_ERROR,
} from 'constants/autoSyncConstant';
import { DataElements } from 'constants/dataElement';
import { LOGGER, MAX_DOCUMENT_SIZE } from 'constants/lumin-common';
import { SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';

export default function useSyncAction({
  currentDocumentRef,
  changeQueueRef,
  showForceSyncModal,
  sync,
  setQueue,
  showErrorModal,
  setIsSyncing,
  canUseAutoSavePageToolsRef,
  setIsFileContentChanged,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { authentication, handleCheckError } = useAuthenticateService();
  const [getCurrentDocumentSize] = useMakeCancelable(documentServices.getCurrentDocumentSize);
  const { startOperation, completeOperation, OPERATION_TYPES } = useSaveOperation();

  function updateChangeQueue(action, storage) {
    setQueue((queue) => {
      switch (storage) {
        case AUTO_SYNC_STORAGE.S3: {
          return queue;
        }
        case AUTO_SYNC_STORAGE.DRIVE: {
          if (
            action.includes(AUTO_SYNC_CHANGE_TYPE.RESTORE_ORIGINAL_VERSION) ||
            action.includes(AUTO_SYNC_CHANGE_TYPE.EDIT_PDF) ||
            action.includes(AUTO_SYNC_CHANGE_TYPE.TOGGLE_AUTO_SYNC)
          ) {
            return [];
          }
          const index = queue.indexOf(action);
          return queue.slice(index + 1);
        }
        default: {
          return [];
        }
      }
    });
  }

  const handleUploadToS3Temporary = async (action) => {
    const { _id, name } = currentDocumentRef.current;
    const operationId = startOperation(OPERATION_TYPES.AUTO_SYNC, {
      action,
      documentId: _id,
      metadata: {
        storage: AUTO_SYNC_STORAGE.S3,
      },
    });

    try {
      if (!canUseAutoSavePageToolsRef.current) {
        dispatch(actions.openElement(DataElements.LOADING_MODAL));
      }
      await retryOnUnavailableService(() =>
        documentServices.uploadDriveDocumentTemporary({
          _id,
          name,
        })
      );
      setIsFileContentChanged(false);
      updateChangeQueue(action, AUTO_SYNC_STORAGE.S3);
      dispatch(actions.closeElement(DataElements.LOADING_MODAL));
      fireEvent('finishSyncDrive', {
        action,
        hasBackupToS3: true,
        status: SYNC_RESULT.SUCCESS,
        documentId: _id,
        dataSync: {},
      });
      const lastModify = dateUtil.convertToRelativeTime(Date.now(), t);
      const message = t('viewer.lastUpdateWas', { lastModify });
      const annotationIds = core.getAnnotationsList().map((annotation) => annotation.Id);
      dispatch(actions.setInternalAnnotationIds(annotationIds));

      completeOperation(operationId, { status: SAVE_OPERATION_STATUS.SUCCESS, message });
    } catch (error) {
      dispatch(actions.closeElement(DataElements.LOADING_MODAL));
      completeOperation(operationId, { status: SAVE_OPERATION_STATUS.ERROR });
      throw error;
    }
  };

  const onAutoSyncOff = async (action) => {
    if (action.includes(AUTO_SYNC_CHANGE_TYPE.RESTORE_ORIGINAL_VERSION)) {
      sync(action, { forceSync: true });
      return;
    }
    dispatch(actions.setAutoSyncStatus(AUTO_SYNC_STATUS.NOT_SYNCED));

    const isValidAction =
      action.includes(AUTO_SYNC_CHANGE_TYPE.CONTENT_CHANGE) ||
      action.includes(AUTO_SYNC_CHANGE_TYPE.EDIT_PDF) ||
      action.includes(AUTO_SYNC_CHANGE_TYPE.REDACTION);

    const includeContentChangeAction = changeQueueRef.current.some((change) =>
      change.includes(AUTO_SYNC_CHANGE_TYPE.CONTENT_CHANGE)
    );
    if (!isValidAction && !includeContentChangeAction) {
      return;
    }
    const fileSize = await getCurrentDocumentSize(currentDocumentRef.current);
    // eslint-disable-next-line no-magic-numbers
    const maxSize = MAX_DOCUMENT_SIZE * 1024 * 1024;
    if (fileSize < maxSize) {
      dispatch(actions.updateCurrentDocument({ size: fileSize }));
      await handleUploadToS3Temporary(action);
    } else {
      showForceSyncModal(sync);
    }
  };

  const onAutoSyncOn = async (action) => {
    if (currentDocumentRef.current?.enableGoogleSync) {
      sync(action);
    } else {
      onAutoSyncOff(action);
    }
  };

  const handleSyncFile = useCallback((actionId) => {
    const action = actionId ?? last(changeQueueRef.current);
    if (isOversizeToAutoSync(currentDocumentRef.current?.size)) {
      onAutoSyncOff(action);
    } else {
      onAutoSyncOn(action);
    }
  }, []);

  const startSyncing = async ({ document, dataSync, onSuccess }) => {
    const operationId = startOperation(OPERATION_TYPES.AUTO_SYNC, {
      action: dataSync.action,
      documentId: document._id,
      metadata: {
        storage: AUTO_SYNC_STORAGE.DRIVE,
      },
    });

    try {
      await authentication.drive([document]);
      setIsSyncing(true);
      const result = await syncFile({
        document,
        dataSync,
      });
      if (result.status === SYNC_RESULT.FAIL) {
        dispatch(actions.closeElement('loadingModal'));
        showErrorModal(result);
        if (result.reason === AUTO_SYNC_ERROR.CANCEL_SYNC_REQUEST) {
          dispatch(actions.setAutoSyncStatus(''));
          completeOperation(operationId, { status: SAVE_OPERATION_STATUS.CANCELLED });
        } else {
          dispatch(actions.setAutoSyncStatus(AUTO_SYNC_STATUS.FAILED));
          completeOperation(operationId, { status: SAVE_OPERATION_STATUS.ERROR });
        }

        if (result.hasBackupToS3) {
          updateChangeQueue(dataSync.action, AUTO_SYNC_STORAGE.S3);
        }
      }
      if (result.status === SYNC_RESULT.SUCCESS) {
        const lastModify = dateUtil.convertToRelativeTime(Date.now(), t);
        const message = t('viewer.lastUpdateWas', { lastModify });
        const annotationIds = core.getAnnotationsList().map((annotation) => annotation.Id);
        dispatch(actions.setInternalAnnotationIds(annotationIds));

        completeOperation(operationId, { status: SAVE_OPERATION_STATUS.SUCCESS, message });

        if (dataSync.action) {
          updateChangeQueue(dataSync.action, AUTO_SYNC_STORAGE.DRIVE);
        }
        if (currentDocumentRef.current.signedUrl) {
          dispatch(actions.updateCurrentDocument({ signedUrl: '' }));
        }
        const size = await documentServices.getCurrentDocumentSize(document);
        dispatch(
          actions.updateCurrentDocument({
            size,
            ...(currentDocumentRef.current.metadata && {
              metadata: {
                ...currentDocumentRef.current.metadata,
                hasOutlines: false,
              },
            }),
          })
        );
        onSuccess();
      }
      fireEvent('finishSyncDrive', { ...result, action: dataSync.action });
    } catch (error) {
      completeOperation(operationId, { status: SAVE_OPERATION_STATUS.ERROR });
      logger.logError({
        reason: LOGGER.EVENT.AUTO_SYNC_ERROR,
        error,
      });
      const executer = (documents, onVerifySuccess) =>
        startSyncing({
          document: documents[0],
          dataSync,
          onSuccess: onVerifySuccess,
        });
      handleCheckError(error, {
        documents: [document],
        onSuccess,
        executer,
        setLoading: () => {},
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return { handleSyncFile, startSyncing };
}
