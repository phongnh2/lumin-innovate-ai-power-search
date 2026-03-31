import { useEffect, useRef, useState, MutableRefObject } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useTrackingModalEvent, useAutoSync } from 'hooks';
import useShowPromptUserInViewer from 'hooks/useShowPromptUserInViewer';

import { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';

import { useSyncAnnotationsStore } from 'features/Annotation/hooks/useSyncAnnotationsStore';

import { STORAGE_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

type TUseTrackingModalEvent = {
  trackModalViewed: () => Promise<void>;
  trackModalConfirmation: () => Promise<void>;
  trackModalDismiss: () => Promise<void>;
  trackModalHidden: () => Promise<void>;
};

type TUseCheckPromptConditionResponse = {
  shouldPrompWhenUnloadWindowRef: MutableRefObject<boolean>;
  trackModalRef: MutableRefObject<TUseTrackingModalEvent>;
  shouldBlock: boolean;
  hasChangeToSync: boolean;
};

type TAutoSyncResponse = {
  isFileContentChanged: boolean;
  hasChangeToSync: boolean;
};

const useCheckPromptCondition = (currentDocument: IDocumentBase): TUseCheckPromptConditionResponse => {
  const isShowPromptUserInViewer = useShowPromptUserInViewer();
  const forceReload = useSelector<unknown, boolean>(selectors.isForceReload);
  const isNotFoundDocument = useSelector<unknown, boolean>(selectors.isNotFoundDocument);
  const isConvertingBase64ToSignedUrl = useSelector<unknown, boolean>(selectors.isConvertingBase64ToSignedUrl);
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);
  const { isSystemFile, unsaved, service } = currentDocument || {};

  const { isFileContentChanged, hasChangeToSync } = useAutoSync() as TAutoSyncResponse;
  const isSyncingAnnotations = useSyncAnnotationsStore((state) => state.isSyncing);

  const [shouldBlock, setShouldBlock] = useState<boolean>(false);

  const shouldPrompWhenUnloadWindowRef = useRef<boolean>(false);

  const trackLeaveWithoutSync = useTrackingModalEvent({
    modalName: ModalName.LEAVE_WITHOUT_SYNCING,
  });

  const trackPromptUserToSync = useTrackingModalEvent({
    modalName: ModalName.PROMPT_USER_TO_SYNC_CHANGES,
  });

  const trackLeaveEditMode = useTrackingModalEvent({
    modalName: ModalName.LEAVE_EDIT_MODE_AND_SAVE_CHANGES,
  });

  const trackModalRef = useRef(trackPromptUserToSync);

  useEffect(() => {
    if (isInContentEditMode) {
      trackModalRef.current = trackLeaveEditMode;
    } else {
      trackModalRef.current = trackPromptUserToSync;
    }
    const isUnsavedSystemFile: boolean = (isSystemFile && unsaved) || false;
    shouldPrompWhenUnloadWindowRef.current =
      (isShowPromptUserInViewer && !forceReload) || isUnsavedSystemFile || isSyncingAnnotations;

    if (service === STORAGE_TYPE.GOOGLE) {
      const driveFileChanged = isFileContentChanged && !isNotFoundDocument && !forceReload;
      shouldPrompWhenUnloadWindowRef.current ||= driveFileChanged;
      if (driveFileChanged && !isInContentEditMode) {
        trackModalRef.current = trackLeaveWithoutSync;
      }
    }
    setShouldBlock(shouldPrompWhenUnloadWindowRef.current);
  }, [
    isNotFoundDocument,
    isInContentEditMode,
    isShowPromptUserInViewer,
    isConvertingBase64ToSignedUrl,
    isFileContentChanged,
    unsaved,
    forceReload,
    isSystemFile,
    service,
    isSyncingAnnotations,
  ]);

  return {
    shouldPrompWhenUnloadWindowRef,
    trackModalRef,
    shouldBlock,
    hasChangeToSync,
  };
};

export default useCheckPromptCondition;
