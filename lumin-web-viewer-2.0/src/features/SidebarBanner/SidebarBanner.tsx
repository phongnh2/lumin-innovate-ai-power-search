import React, { useState } from 'react';

import { useGetCurrentOrganization } from 'hooks';

import { organizationServices } from 'services';

import useGetInviteLinkData from 'features/InviteLink/hooks/useGetInviteLinkData';
import { useInviteLinkAvailable } from 'features/InviteLink/hooks/useInviteLinkAvailable';
import { inviteLinkSidebarLocalStorage } from 'features/InviteLink/utils/localStorage';

import PromptInviteLinkBanner from './PromptInviteLinkBanner';

import styles from './SidebarBanner.module.scss';

const SidebarBanner = () => {
  const currentOrganization = useGetCurrentOrganization();
  const { _id: orgId, userRole } = currentOrganization;

  const isManager = organizationServices.isManager(userRole);

  const [isShowInviteLinkBanner, setIsShowInviteLinkBanner] = useState(true);

  const { currentInviteLink, isCurrentInviteLinkLoading } = useGetInviteLinkData();
  const isInviteLinkAvailable = useInviteLinkAvailable(currentOrganization);

  const allowShowInviteLinkBanner =
    !isCurrentInviteLinkLoading &&
    !currentInviteLink &&
    !inviteLinkSidebarLocalStorage.getHasCloseStatus(orgId) &&
    isShowInviteLinkBanner &&
    isInviteLinkAvailable &&
    isManager;

  if (!allowShowInviteLinkBanner) {
    return null;
  }

  return (
    <div className={styles.container}>
      <PromptInviteLinkBanner setIsShowBanner={setIsShowInviteLinkBanner} orgId={orgId} />
    </div>
  );
};

export default SidebarBanner;
