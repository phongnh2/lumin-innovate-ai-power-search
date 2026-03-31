import { useSelector } from 'react-redux';

import { inviteLinkSelectors } from '../reducer/InviteLink.reducer';

const useGetInviteLinkData = () => {
  const selectedOrg = useSelector(inviteLinkSelectors.getSelectedOrg);
  const isCurrentInviteLinkLoading = useSelector(inviteLinkSelectors.getIsCurrentInviteLinkLoading);
  const inviteLink = useSelector(inviteLinkSelectors.getInviteLink);
  const currentInviteLink = useSelector(inviteLinkSelectors.getCurrentInviteLink);
  return {
    inviteLink: selectedOrg?._id === currentInviteLink?.orgId ? currentInviteLink : inviteLink,
    currentInviteLink,
    isCurrentInviteLinkLoading,
    selectedOrg,
  };
};

export default useGetInviteLinkData;
