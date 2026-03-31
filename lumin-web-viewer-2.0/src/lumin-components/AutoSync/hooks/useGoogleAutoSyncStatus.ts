import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import useDocumentTools from 'hooks/useDocumentTools';
import { useLatestRef } from 'hooks/useLatestRef';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { socketService } from 'services/socketServices';

import { isSyncableFile } from 'helpers/autoSync';

import { DocumentCategory } from 'utils/Factory/DocumentCategory';

import { socket } from '@socket';

import {
  AUTO_SYNC_CHANGE_TYPE,
  AUTO_SYNC_STATUS,
  SYNC_RESULT,
  UPDATE_ENABLE_GOOGLE_SYNC_REASON,
} from 'constants/autoSyncConstant';
import { DocumentService } from 'constants/document.enum';
import { SOCKET_ON } from 'constants/socketConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';

type GoogleAutoSyncStatusData = {
  type: 'checkSyncPermission' | 'updateEnableGoogleSync' | string;
  allowSync?: boolean;
  dataSync?: {
    action?: string[];
    isFileContentChanged?: boolean;
    annotations?: { _id: string }[];
    fields?: { _id: string }[];
  };
  reason?: string;
  enableGoogleSync?: boolean;
};

type StartSyncingParams = {
  document: IDocumentBase;
  dataSync: unknown;
  onSuccess: () => void;
};

interface UseGoogleAutoSyncStatusProps {
  isSyncing: boolean;
  resetAutoSyncStatus: {
    (): void;
    cancel: () => void;
  };
  debouncedSync: {
    (): void;
    cancel: () => void;
  };
  startSyncing: (params: StartSyncingParams) => void;
}

const useGoogleAutoSyncStatus = ({
  isSyncing,
  resetAutoSyncStatus,
  debouncedSync,
  startSyncing,
}: UseGoogleAutoSyncStatusProps): void => {
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector<IDocumentBase | null>(selectors.getCurrentDocument);
  const currentDocumentRef = useLatestRef(currentDocument);
  const isGoogleDriveFile =
    !!currentDocument &&
    DocumentCategory.isGoogleDriveDocument({
      type: currentDocument.service as DocumentService,
    });
  const { openHitDocStackModal } = useDocumentTools();
  const { service, mimeType, remoteId, _id: documentId } = currentDocument || {};

  const onSyncSuccess = useCallback(() => {
    dispatch(actions.setAutoSyncStatus(AUTO_SYNC_STATUS.SAVED));
    resetAutoSyncStatus();
  }, [dispatch, resetAutoSyncStatus]);

  const handleSyncPermission = useCallback(
    (data: GoogleAutoSyncStatusData) => {
      const { allowSync, dataSync } = data;
      if (allowSync) {
        const isFileContentChanged = [
          AUTO_SYNC_CHANGE_TYPE.CONTENT_CHANGE,
          AUTO_SYNC_CHANGE_TYPE.EDIT_PDF,
          AUTO_SYNC_CHANGE_TYPE.REDACTION,
          AUTO_SYNC_CHANGE_TYPE.OCR,
          AUTO_SYNC_CHANGE_TYPE.TOGGLE_AUTO_SYNC,
          AUTO_SYNC_CHANGE_TYPE.RESTORE_ORIGINAL_VERSION,
        ].some((type) => dataSync?.action?.includes(type));
        socketService.modifyDocumentContent(currentDocumentRef.current._id, {
          status: 'syncing',
          increaseVersion: isFileContentChanged,
        });
        startSyncing({
          document: currentDocumentRef.current,
          dataSync: {
            ...dataSync,
            isFileContentChanged,
          },
          onSuccess: onSyncSuccess,
        });
      }
    },
    [currentDocumentRef, startSyncing, onSyncSuccess]
  );

  const handleUpdateEnableGoogleSync = useCallback(
    (data: GoogleAutoSyncStatusData) => {
      if (data.reason === UPDATE_ENABLE_GOOGLE_SYNC_REASON.HIT_DOC_STACK_LIMIT) {
        openHitDocStackModal('');
      }
      dispatch(
        actions.updateCurrentDocument({
          enableGoogleSync: data.enableGoogleSync,
        })
      );
      if (!data.enableGoogleSync) {
        dispatch(actions.setAutoSyncStatus(AUTO_SYNC_STATUS.NOT_SYNCED));
      }
    },
    [dispatch, openHitDocStackModal]
  );

  const handleSocketEvent = useCallback(
    (data: GoogleAutoSyncStatusData) => {
      switch (data?.type) {
        case 'checkSyncPermission':
          handleSyncPermission(data);
          break;
        case 'updateEnableGoogleSync':
          handleUpdateEnableGoogleSync(data);
          break;
        default:
          break;
      }
    },
    [handleSyncPermission, handleUpdateEnableGoogleSync]
  );

  const cleanup = useCallback(() => {
    if (documentId && isSyncableFile({ service, mimeType })) {
      socket.removeListener({ message: SOCKET_ON.GOOGLE_AUTO_SYNC_STATUS });
      if (isSyncing) {
        socketService.sendAutoSyncResult({
          remoteId,
          documentId,
          status: SYNC_RESULT.FAIL,
        });
      }
    }
    resetAutoSyncStatus.cancel();
    debouncedSync.cancel();
  }, [service, mimeType, resetAutoSyncStatus, debouncedSync, isSyncing, remoteId, documentId]);

  useEffect(() => {
    if (!isGoogleDriveFile) {
      return;
    }

    if (
      currentDocument &&
      isSyncableFile({
        service,
        mimeType,
      })
    ) {
      socket.on(SOCKET_ON.GOOGLE_AUTO_SYNC_STATUS, handleSocketEvent);
    }

    return cleanup;
  }, [isGoogleDriveFile, service, mimeType]);
};

export default useGoogleAutoSyncStatus;
