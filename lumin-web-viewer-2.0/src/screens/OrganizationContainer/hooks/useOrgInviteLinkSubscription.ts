import { useSubscription } from '@apollo/client';
import { useDispatch } from 'react-redux';

import { SUB_UPDATE_ORGANIZATION_INVITE_LINK } from 'graphQL/InviteLinkGraph';

import { useGetCurrentOrganization } from 'hooks';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { IOrganizationInviteLink } from 'features/InviteLink/interfaces/inviteLink.interface';
import { setCurrentInviteLink } from 'features/InviteLink/reducer/InviteLink.reducer';

interface OrganizationInviteLinkSubscriptionPayload {
  inviteLink: IOrganizationInviteLink;
  orgId: string;
  actorId: string;
}

export function useOrgInviteLinkSubscription() {
  const currentOrganization = useGetCurrentOrganization();
  const currentUser = useGetCurrentUser();
  const dispatch = useDispatch();

  useSubscription<{
    updateOrganizationInviteLink: OrganizationInviteLinkSubscriptionPayload;
  }>(SUB_UPDATE_ORGANIZATION_INVITE_LINK, {
    variables: {
      orgId: currentOrganization?._id,
    },
    onData: ({
      data: {
        data: { updateOrganizationInviteLink },
      },
    }) => {
      if (!updateOrganizationInviteLink) {
        return;
      }
      const { inviteLink, actorId } = updateOrganizationInviteLink;
      if (actorId === currentUser?._id) {
        return;
      }
      dispatch(setCurrentInviteLink(inviteLink));
    },
  });
}
