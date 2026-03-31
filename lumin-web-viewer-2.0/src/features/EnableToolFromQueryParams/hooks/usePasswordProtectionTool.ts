import { useEffect, useRef } from 'react';

import { usePasswordHandler, usePasswordManagerPermission } from 'features/PasswordProtection';

import { PdfAction } from '../constants';

interface UsePasswordProtectionToolProps {
  actionQuery?: string;
}

export const usePasswordProtectionTool = ({ actionQuery }: UsePasswordProtectionToolProps) => {
  const { openSetPasswordModal, openRemovePasswordModal, canSet, canDelete } = usePasswordHandler();
  const { isValidating } = usePasswordManagerPermission();

  const isPasswordToolTriggeredRef = useRef<boolean>(false);

  const executePasswordProtectionLogic = () => {
    if (actionQuery === PdfAction.UNLOCK && canDelete) {
      openRemovePasswordModal();
      return;
    }

    if (actionQuery === PdfAction.PROTECT_PDF && canSet) {
      openSetPasswordModal();
      return;
    }

    if (canDelete) {
      openRemovePasswordModal();
      return;
    }
    console.warn('Password protection tool triggered but no permissions available');
  };

  useEffect(() => {
    if (!isValidating && isPasswordToolTriggeredRef.current) {
      executePasswordProtectionLogic();
      isPasswordToolTriggeredRef.current = false;
    }
  }, [isValidating, canSet, canDelete, actionQuery]);

  const handlePasswordProtection = () => {
    if (isValidating) {
      isPasswordToolTriggeredRef.current = true;
      return;
    }

    executePasswordProtectionLogic();
  };

  return {
    handlePasswordProtection,
    isValidating,
    canSet,
    canDelete,
  };
};
