/* eslint-disable @typescript-eslint/unbound-method */
import { useMemo } from 'react';

import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import usePromptInviteUsersHandler from './usePromptInviteUsersHandler';
import useTrackUserReAuthorize from './useTrackUserReAuthorize';
import useTrackUserSwitchDocumentPages from './useTrackUserSwitchDocumentPages';
import { CloseBannerReason, PromptInviteUsersBannerContainerProps } from '../PromptInviteUsersBanner.types';

function usePromptInviteUsersProps(): PromptInviteUsersBannerContainerProps {
  const {
    isFetching,
    isShowBanner,
    isShowAddMembersModal,
    canShowBanner,
    bannerContent,
    promptUsersData,
    getCurrentOrgId,
    setCurrentOrgId,
    setIsShowBanner,
    setPromptUsersData,
    getPromptGoogleUsersHandler,
    handleCloseBanner,
    handlePreviewBanner,
    handleToggleAddMembersModal,
    actionButtonText,
    isManager,
    inviteUserAvatars,
    currentOrganization,
    setIsFetching,
  } = usePromptInviteUsersHandler();

  useTrackUserReAuthorize({ canShowBanner, getCurrentOrgId, getPromptGoogleUsersHandler });
  useTrackUserSwitchDocumentPages({
    setCurrentOrgId,
    getPromptGoogleUsersHandler,
    setIsShowBanner,
    setPromptUsersData,
    setIsFetching,
  });

  const addMemberOrganizationModalProps = useMemo(
    () => ({
      selectedOrganization: currentOrganization,
      onClose: handleToggleAddMembersModal,
      onSaved: () => {
        handleCloseBanner(CloseBannerReason.FORCE_CLOSE);
        handleToggleAddMembersModal();
      },
      updateCurrentOrganization: () => {},
      updateOrganizationInList: () => {},
      openFailedModal: () => {},
      openBlockedByUpgradingModal: () => {},
      members: promptUsersData.inviteUsers.map((user) => ({
        ...user,
        role: isManager ? ORGANIZATION_ROLES.BILLING_MODERATOR : ORGANIZATION_ROLES.MEMBER,
      })),
    }),
    [promptUsersData, currentOrganization]
  );

  return {
    loading: isFetching,
    content: bannerContent,
    onClose: handleCloseBanner,
    onPreview: handlePreviewBanner,
    actionButtonText,
    inviteUserAvatars,
    isShowAddMembersModal,
    addMemberOrganizationModalProps,
    canShowBanner,
    isShowBanner,
    promptUsersData,
  };
}

export default usePromptInviteUsersProps;
