import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

import { socket } from 'src/socket';

import actions from 'actions';
import selectors from 'selectors';

import { useAutoSavePageTools } from 'hooks/useAutoSavePageTools';
import { useAutoSync } from 'hooks/useAutoSync';
import { useCleanup } from 'hooks/useCleanup';
import { useTrackingDocumentSync } from 'hooks/useTrackingDocumentSync';

import { isSyncableFile, isReadyToSync } from 'helpers/autoSync';

import { DocumentCategory } from 'utils/Factory/DocumentCategory';

import { documentSyncSelectors } from 'features/Document/slices';
import { useSyncedQueueContext } from 'features/FileSync';

import {
  AUTO_SYNC_STATUS,
  AUTO_SYNC_CHANGE_TYPE,
  AUTO_SYNC_DEBOUNCE,
  SHOW_AUTO_SYNC_STATUS_TIME,
  SYNCING_TIMEOUT,
  AUTO_SAVE_PAGE_TOOLS_TIME,
} from 'constants/autoSyncConstant';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { AutoSyncContext } from './AutoSyncContext';
import {
  useAnnotationChanged,
  useAutoSyncRef,
  useEndContentEditMode,
  useOpenModal,
  usePagesUpdated,
  useSyncAction,
  useFinishSyncDrive,
  useGoogleAutoSyncStatus,
  useOutlineUpdated,
} from './hooks';

let timeoutSyncing;

const AutoSyncProvider = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasChangeToSync, setHasChangeToSync] = useState(false);
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const forceReload = useSelector(selectors.isForceReload);
  const isSyncingRef = useRef(isSyncing);
  const [isFileContentChanged, setIsFileContentChanged] = useState(false);
  const { changedQueue, setQueue } = useSyncedQueueContext();
  const canUseAutoSavePageTools = useAutoSavePageTools();
  const dispatch = useDispatch();
  const isLeftPanelOpen = useSelector(selectors.isLeftPanelOpen);
  const isDocumentSyncing = useSelector(documentSyncSelectors.isSyncing);
  const {
    hasAppliedRedactionRef,
    currentDocumentRef,
    isPageEditModeRef,
    changeQueueRef,
    canUseAutoSavePageToolsRef,
    isInContentEditModeRef,
    currentUserRef,
    isUsingPageToolsWithAIRef,
  } = useAutoSyncRef({ changeQueue: changedQueue, canUseAutoSavePageTools });
  const { showErrorModal, showForceSyncModal } = useOpenModal();
  const { handleTrackDocumentSync } = useTrackingDocumentSync();
  const isGoogleDriveFile = DocumentCategory.isGoogleDriveDocument({ type: currentDocument?.service });

  useAutoSync({
    onSyncSuccess: ({ hasBackupToS3: syncToS3 }) => {
      if (!syncToS3 && isGoogleDriveFile) {
        handleTrackDocumentSync();
      }
    },
    onError: () => {
      if (isGoogleDriveFile && currentDocument?.enableGoogleSync) {
        dispatch(actions.updateCurrentDocument({ enableGoogleSync: false }));
        dispatch(actions.setAutoSyncStatus(AUTO_SYNC_STATUS.FAILED));
      }
    },
  });

  useEffect(() => {
    if (forceReload && isGoogleDriveFile) {
      setQueue([]);
      setIsFileContentChanged(false);
    }
  }, [forceReload, isGoogleDriveFile]);

  const debouncedSync = useCallback(
    !isSyncingRef.current &&
      debounce((syncAction, { forceSync = false } = {}) => {
        // After exiting the viewer, unsaved changes to Drive will be saved to S3.
        // When reloading the document, we will attach this presignedUrl to the document.
        // At this point, we will not know what type the changes in the queue are,
        // so I defined SYNC_FROM_S3 to know that there are changes that need to be synced to the Drive.
        const hasChangesStoredInS3 = currentUserRef.current.signedUrl ? AUTO_SYNC_CHANGE_TYPE.SYNC_FROM_S3 : '';
        const action = syncAction || changeQueueRef.current[changeQueueRef.current.length - 1] || hasChangesStoredInS3;
        socket.emit(SOCKET_EMIT.REQUEST_AUTO_SYNC, {
          remoteId: currentDocumentRef.current.remoteId,
          documentId: currentDocumentRef.current._id,
          action,
          forceSync,
        });
      }, AUTO_SYNC_DEBOUNCE),
    []
  );

  const { handleSyncFile, startSyncing } = useSyncAction({
    currentDocumentRef,
    changeQueueRef,
    showForceSyncModal,
    sync: isGoogleDriveFile ? debouncedSync : () => {},
    setQueue,
    hasAppliedRedactionRef,
    showErrorModal,
    setIsSyncing,
    canUseAutoSavePageToolsRef,
    setIsFileContentChanged,
  });

  const debouncedHandleSyncFile = useDebouncedCallback(handleSyncFile, AUTO_SAVE_PAGE_TOOLS_TIME);

  const canUseAutoSync = isSyncableFile({
    service: currentDocument?.service,
    mimeType: currentDocument?.mimeType,
  });

  useEffect(() => {
    if (!isGoogleDriveFile) {
      return;
    }
    setIsFileContentChanged(changedQueue.some((action) => action.includes(AUTO_SYNC_CHANGE_TYPE.CONTENT_CHANGE)));
    const isUsingPageTools = isPageEditModeRef.current || isUsingPageToolsWithAIRef.current;
    const shouldAutoSave = (isUsingPageTools && canUseAutoSavePageTools) || isLeftPanelOpen;
    const hasContentChanges = changedQueue.some((action) => action.includes(AUTO_SYNC_CHANGE_TYPE.CONTENT_CHANGE));

    if (shouldAutoSave && canUseAutoSync && hasContentChanges && !isDocumentSyncing) {
      debouncedHandleSyncFile();
    }
    if (isReadyToSync(currentDocument)) {
      setHasChangeToSync(changedQueue.length > 0);
    }
  }, [changedQueue, canUseAutoSavePageTools, isGoogleDriveFile, isDocumentSyncing]);

  useCleanup(() => {
    debouncedHandleSyncFile.cancel();
  }, []);

  const resetAutoSyncStatus = useCallback(
    debounce(() => !isSyncingRef.current && dispatch(actions.setAutoSyncStatus('')), SHOW_AUTO_SYNC_STATUS_TIME),
    []
  );

  useEffect(() => {
    if (!isGoogleDriveFile) {
      return;
    }
    timeoutSyncing && clearTimeout(timeoutSyncing);
    if (isSyncing) {
      dispatch(actions.setAutoSyncStatus(AUTO_SYNC_STATUS.SYNCING));
      timeoutSyncing = setTimeout(() => setIsSyncing(false), SYNCING_TIMEOUT);
    }
    isSyncingRef.current = isSyncing;
  }, [isSyncing, isGoogleDriveFile]);

  useAnnotationChanged({
    currentDocument,
    setQueue,
    handleSyncFile,
    isPageEditModeRef,
  });

  usePagesUpdated({
    currentDocument,
    setQueue,
    isPageEditModeRef,
    handleSyncFile,
    isInContentEditModeRef,
    isUsingPageToolsWithAIRef,
  });

  useEndContentEditMode({
    currentDocument,
    handleSyncFile,
    changeQueueRef,
  });

  useOutlineUpdated({
    enabled: isGoogleDriveFile,
    setQueue,
    handleSyncFile,
  });

  useFinishSyncDrive({ currentDocument, currentUser: currentUserRef.current });

  useGoogleAutoSyncStatus({
    currentDocumentRef,
    isSyncing,
    resetAutoSyncStatus,
    debouncedSync,
    startSyncing,
  });

  const contextValue = useMemo(
    () =>
      isGoogleDriveFile
        ? {
            isSyncing,
            setIsSyncing,
            sync: debouncedSync,
            isFileContentChanged,
            handleSyncFile: debouncedHandleSyncFile,
            hasChangeToSync,
            showErrorModal,
          }
        : {},
    [isSyncing, isFileContentChanged, hasChangeToSync, isGoogleDriveFile]
  );

  return <AutoSyncContext.Provider value={contextValue}>{children}</AutoSyncContext.Provider>;
};

AutoSyncProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AutoSyncProvider;
