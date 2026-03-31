import React, { useCallback } from 'react';

import AddMemberOrganizationModal from 'luminComponents/AddMemberOrganizationModal';

import { ModalTypes } from '../LeftSidebarDrawer.constants';

type UseRenderToggledModalProps = {
  onClose: () => void;
};

type UseRenderToggledModalData = {
  renderModalByType: (modalType: ModalTypes) => React.JSX.Element;
};

const useRenderToggledModal = ({ onClose }: UseRenderToggledModalProps): UseRenderToggledModalData => {
  const renderModalByType = useCallback((modalType: ModalTypes) => {
    if (!modalType) return null;

    // eslint-disable-next-line sonarjs/no-small-switch
    switch (modalType) {
      case ModalTypes.Invite_Members: {
        return (
          <AddMemberOrganizationModal
            open
            onClose={onClose}
            onSaved={onClose}
            openFailedModal={() => {}}
            updateCurrentOrganization={() => {}}
            updateOrganizationInList={() => {}}
            openBlockedByUpgradingModal={() => {}}
          />
        );
      }
      default:
        return null;
    }
  }, []);

  return { renderModalByType };
};

export default useRenderToggledModal;
