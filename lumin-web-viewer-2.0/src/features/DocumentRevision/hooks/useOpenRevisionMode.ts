import { useContext } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import ViewerContext from 'screens/Viewer/Context';

import useAutoSync from 'hooks/useAutoSync';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { isSyncableFile } from 'helpers/autoSync';
import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';
import { withExitFormBuildChecking } from 'helpers/toggleFormFieldCreationMode';

import { documentSyncSelectors } from 'features/Document/document-sync.slice';
import { useIsTempEditMode } from 'features/OpenForm';

import { DOCUMENT_RESTORE_ORIGINAL_PERMISSION } from 'constants/documentConstants';
import { SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';

import { useEnabledRevision } from './useEnabledRevision';

export const useOpenRevisionMode = () => {
  const isOffline = useSelector(selectors.isOffline);
  const globalSaveStatus = useSelector(documentSyncSelectors.getSaveOperationsGlobalStatus);
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);
  const canModifyDriveContent = useSelector(selectors.canModifyDriveContent);
  const isWaitingForEditBoxes = useSelector(selectors.isWaitingForEditBoxes);

  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  const { isTempEditMode } = useIsTempEditMode();
  const { isSyncing, hasChangeToSync } = useAutoSync();
  const { enabled: enabledRevision } = useEnabledRevision();

  const { openDocumentRevision, openPreviewOriginalVersion } = useContext(ViewerContext);

  const hasRestorePermission = [
    DOCUMENT_RESTORE_ORIGINAL_PERMISSION.VIEW,
    DOCUMENT_RESTORE_ORIGINAL_PERMISSION.RESTORE,
  ].includes(currentDocument.backupInfo?.restoreOriginalPermission);

  const getShouldShowPreviewRevisionLink = () => {
    const shouldShowLink =
      currentUser &&
      !isOffline &&
      !isLoadingDocument &&
      !isSyncing &&
      globalSaveStatus !== SAVE_OPERATION_STATUS.SAVING &&
      (enabledRevision || hasRestorePermission) &&
      !isWaitingForEditBoxes;
    if (isSyncableFile(currentDocument)) {
      return shouldShowLink && !hasChangeToSync && canModifyDriveContent;
    }
    return shouldShowLink;
  };

  const shouldShowPreviewRevisionLink = getShouldShowPreviewRevisionLink();

  const openPreviewRevision = enabledRevision ? openDocumentRevision : openPreviewOriginalVersion;

  const onOpenDocumentRevisionMode = withExitFormBuildChecking(
    handlePromptCallback({
      callback: openPreviewRevision,
      forceReload: false,
    })
  );

  const shouldHideVersionHistoryInViewerMenu = isTempEditMode || !shouldShowPreviewRevisionLink;

  return {
    onOpenDocumentRevisionMode,
    isOffline,
    globalSaveStatus,
    isTempEditMode,
    currentDocument,
    enabledRevision,
    shouldShowPreviewRevisionLink,
    shouldHideVersionHistoryInViewerMenu,
  };
};
