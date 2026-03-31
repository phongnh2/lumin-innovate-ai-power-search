import { useSelector } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';

import core from 'core';
import selectors from 'selectors';

import { documentSyncSelectors } from 'features/Document/document-sync.slice';
import { documentUploadExternalSelectors } from 'features/DocumentUploadExternal/slices';

import { AUTO_SYNC_STATUS } from 'constants/autoSyncConstant';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';
import toolsName from 'constants/toolsName';

const useShowPromptUserInViewer = () => {
  const isFormBuildPanelOpen = useSelector(
    (state) =>
      selectors.isToolPropertiesOpen(state) && selectors.toolPropertiesValue(state) === TOOL_PROPERTIES_VALUE.FORM_BUILD
  );
  const autoSyncStatus = useSelector((state) => selectors.getAutoSyncStatus(state));
  const globalSaveStatus = useSelector(documentSyncSelectors.getSaveOperationsGlobalStatus);
  const activeToolName = useSelector((state) => selectors.getActiveToolName(state));
  const hasAppliedRedaction = useSelector((state) => selectors.hasAppliedRedaction(state));
  const isInContentEditMode = useSelector((state) => selectors.isInContentEditMode(state));
  const isConvertingBase64ToSignedUrl = useSelector(selectors.isConvertingBase64ToSignedUrl);
  const isSyncingExternalStorage = useSelector(documentUploadExternalSelectors.isSyncing);
  const shouldPromptUserExitRedactionMode =
    activeToolName === toolsName.REDACTION &&
    core.getAnnotationsList().some((annot) => annot.Subject === AnnotationSubjectMapping.redact);

  return (
    globalSaveStatus === SAVE_OPERATION_STATUS.SAVING ||
    autoSyncStatus === AUTO_SYNC_STATUS.SYNCING ||
    Boolean(isFormBuildPanelOpen) ||
    Boolean(shouldPromptUserExitRedactionMode) ||
    Boolean(isInContentEditMode) ||
    Boolean(hasAppliedRedaction) ||
    Boolean(isConvertingBase64ToSignedUrl) ||
    isSyncingExternalStorage
  );
};

export default useShowPromptUserInViewer;
