import { useCallback, useMemo } from 'react';

import { TriggerDownloadDocumentSource } from 'luminComponents/SaveAsModal/constant';

import useDocumentTools from 'hooks/useDocumentTools';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { usePasswordManagerPermission } from 'features/PasswordProtection';

import { TOOLS_NAME } from 'constants/toolsName';

export const useOpenRemovePasswordModal = () => {
  const { handleDownloadDocument } = useDocumentTools();
  const { canDelete, isValidating } = usePasswordManagerPermission();
  const openDownloadModal = handlePromptCallback({
    callback: handleDownloadDocument({
      source: TriggerDownloadDocumentSource.LANDING_PAGE,
    }),
    applyForTool: TOOLS_NAME.PASSWORD_PROTECTION,
  });
  const openRemovePasswordModal = useCallback(() => {
    if (isValidating) {
      return;
    }
    if (!canDelete) {
      openDownloadModal();
    }
  }, [isValidating, canDelete]);

  return useMemo(
    () => ({
      openRemovePasswordModal,
    }),
    [openRemovePasswordModal]
  );
};
