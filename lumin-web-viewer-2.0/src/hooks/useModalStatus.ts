import { useState, useEffect, useCallback } from 'react';

export const useModalStatus = (): [boolean, () => void] => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [observer, setObserver] = useState<MutationObserver | null>(null);

  useEffect(() => {
    const checkForModals = () => {
      const mantineModals = document.querySelectorAll('.mantine-Modal-content');
      const muiDialogs = document.querySelectorAll('.MuiDialog-paper');
      const inviteModal = document.querySelectorAll('[class^="InviteCollaboratorsModal-module__"]');
      const isAnyModalOpen = mantineModals.length > 0 || muiDialogs.length > 0 || inviteModal.length > 0;
      setIsModalOpen(isAnyModalOpen);
    };

    checkForModals();
    const mutationObserver = new MutationObserver(checkForModals);
    setObserver(mutationObserver);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => mutationObserver.disconnect();
  }, []);

  const detachObserver = useCallback(() => {
    if (observer) {
      observer.disconnect();
      setObserver(null);
    }
  }, [observer]);

  return [isModalOpen, detachObserver];
};
