import React, { useCallback, useState } from 'react';

import AddMemberOrganizationModal from 'luminComponents/AddMemberOrganizationModal';

import WorkspaceSwitcher from '../WorkspaceSwitcher';

type UseRenderWorkspaceSwitcherData = {
  render: () => React.JSX.Element;
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
};

const useRenderWorkspaceSwitcher = ({
  onCloseDrawer,
}: {
  onCloseDrawer: () => void;
}): UseRenderWorkspaceSwitcherData => {
  const [opened, setOpened] = useState(false);
  const [openedInviteMembersModal, setOpenedInviteMembersModal] = useState(false);

  const onToggleWorkspaceSwitcher = useCallback(() => setOpened((prevState) => !prevState), []);

  const onToggleInviteMembersModal = useCallback(() => setOpenedInviteMembersModal((prevState) => !prevState), []);

  const render = useCallback(
    () => (
      <>
        <WorkspaceSwitcher
          onToggleSwitcher={onToggleWorkspaceSwitcher}
          onToggleInviteMembers={onToggleInviteMembersModal}
          onCloseDrawer={onCloseDrawer}
        />
        {openedInviteMembersModal && (
          <AddMemberOrganizationModal
            open
            onClose={onToggleInviteMembersModal}
            onSaved={onToggleInviteMembersModal}
            openFailedModal={() => {}}
            updateCurrentOrganization={() => {}}
            updateOrganizationInList={() => {}}
            openBlockedByUpgradingModal={() => {}}
          />
        )}
      </>
    ),
    [openedInviteMembersModal, onToggleInviteMembersModal, onToggleWorkspaceSwitcher]
  );

  return {
    render,
    opened,
    setOpened,
  };
};

export default useRenderWorkspaceSwitcher;
