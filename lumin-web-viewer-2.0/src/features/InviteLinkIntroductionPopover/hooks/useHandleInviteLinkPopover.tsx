import React, { useCallback, useEffect, useState } from 'react';

import AddMemberOrganizationModal from 'luminComponents/AddMemberOrganizationModal';

import { useGetCurrentOrganization } from 'hooks';

import { organizationServices } from 'services';

import useGetInviteLinkData from 'features/InviteLink/hooks/useGetInviteLinkData';
import { useInviteLinkAvailable } from 'features/InviteLink/hooks/useInviteLinkAvailable';
import { inviteLinkIntroductionPopoverLocalStorage } from 'features/InviteLink/utils/localStorage';

const useHandleInviteLinkPopover = () => {
  const [isOpen, setOpen] = useState(true);
  const [isOpenAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const currentOrganization = useGetCurrentOrganization();

  const { currentInviteLink, isCurrentInviteLinkLoading } = useGetInviteLinkData();
  const isInviteLinkAvailable = useInviteLinkAvailable(currentOrganization);

  const handleClosePopover = useCallback(() => {
    if (currentOrganization?._id) {
      inviteLinkIntroductionPopoverLocalStorage.setCloseStatus(currentOrganization?._id);
    }
    setOpen(false);
  }, [currentOrganization?._id]);

  const isManager = organizationServices.isManager(currentOrganization?.userRole);
  const shouldOpenPopover =
    !isCurrentInviteLinkLoading &&
    isInviteLinkAvailable &&
    currentOrganization &&
    !currentInviteLink &&
    !inviteLinkIntroductionPopoverLocalStorage.getHasCloseStatus(currentOrganization._id) &&
    isManager;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOpen) {
      timeoutId = setTimeout(() => {
        handleClosePopover();
      }, 12000); // 12 seconds
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, isHovering, handleClosePopover]);

  const onClickTryItNow = () => {
    setOpenAddMemberModal(true);
    handleClosePopover();
  };

  const closeAddMemberModal = () => {
    setOpenAddMemberModal(false);
  };

  const renderAddMemberModal = () =>
    isOpenAddMemberModal && (
      <AddMemberOrganizationModal
        open
        onClose={closeAddMemberModal}
        onSaved={closeAddMemberModal}
        selectedOrganization={currentOrganization}
        updateCurrentOrganization={() => {}}
      />
    );

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return {
    isOpen: shouldOpenPopover && (isOpen || isHovering || isOpenAddMemberModal),
    setOpen,
    renderAddMemberModal,
    handleClosePopover,
    onClickTryItNow,
    handleMouseEnter,
    handleMouseLeave,
    setIsHovering,
  };
};

export default useHandleInviteLinkPopover;
