import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useDocumentViewerLoaded } from 'hooks/useDocumentViewerLoaded';
import { useShallowSelector } from 'hooks/useShallowSelector';

import getCurrentRole from 'helpers/getCurrentRole';

import { useSyncDocumentChecker } from 'features/Document/hooks/useSyncDocumentChecker';

import { DOCUMENT_ROLES } from 'constants/lumin-common';
import { TOOLS_NAME } from 'constants/toolsName';

import { useCheckFormFieldsInDocument } from './useCheckFormFieldsInDocument';
import { useEnableAutoDetect } from './useEnableAutoDetect';

export const useAutoDetectFormFieldsEnabled = () => {
  const { hasFormFieldsInDocument } = useCheckFormFieldsInDocument();
  const { loaded } = useDocumentViewerLoaded();
  const { enabled } = useEnableAutoDetect();
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);
  const { canSync } = useSyncDocumentChecker();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const currentRole = getCurrentRole(currentDocument);
  const canEditDocument = [DOCUMENT_ROLES.EDITOR, DOCUMENT_ROLES.SHARER, DOCUMENT_ROLES.OWNER].includes(currentRole);
  const isOffline = useSelector(selectors.isOffline);
  const activeToolName = useSelector(selectors.getActiveToolName) as string;
  const isTypeToolActive = activeToolName === TOOLS_NAME.FREETEXT;

  const canUseAutoDetectFormFields =
    !!currentUser &&
    canEditDocument &&
    enabled &&
    !isPreviewOriginalVersionMode &&
    !isOffline &&
    !currentDocument?.isSystemFile &&
    loaded &&
    canSync;

  const shouldAutoDetectFormFields = canUseAutoDetectFormFields && !hasFormFieldsInDocument && isTypeToolActive;

  return {
    isViewerLoaded: loaded,
    canUseAutoDetectFormFields,
    shouldAutoDetectFormFields,
  };
};
