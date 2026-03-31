import { useNavigate } from 'react-router';

import { getTrendingUrl } from 'utils/orgUrlUtils';

import { NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';

import {
  IUser,
  UserInvitationStatus,
  UserInvitationType,
  VerifyInvitationTokenPayload,
} from 'interfaces/user/user.interface';

type TReturn = {
  canRedirect: (status: UserInvitationStatus) => boolean;
  redirect: (user: IUser, invitation: VerifyInvitationTokenPayload) => void;
  isCircleInvitation: (type: UserInvitationType) => boolean;
};

function useRedirectUserInvitation(): TReturn {
  const navigate = useNavigate();
  const canRedirect = (status: UserInvitationStatus): boolean => status !== 'invitation_invalid';
  const isCircleInvitation = (type: UserInvitationType): boolean => type === 'circle_invitation';

  const getNextUrl = (invitation: VerifyInvitationTokenPayload): string => {
    switch (invitation.type) {
      case 'circle_invitation':
        return getTrendingUrl({ orgUrl: invitation.metadata.orgUrl });
      case 'share_document':
        return `/viewer/${invitation.metadata.documentId}`;
      default:
        return '/';
    }
  };

  const redirect = (user: IUser, invitation: VerifyInvitationTokenPayload): void => {
    const { newAuthProcessing, metadata, status, type } = invitation;
    const isOrgInvitation = type === 'circle_invitation';
    // If document invitation => redirect to viewer.
    const isOrgDeleted = isOrgInvitation && status === 'invitation_removed' && !metadata.orgUrl;
    if (newAuthProcessing && isOrgInvitation) {
      if (isOrgDeleted) {
        navigate(NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION, { replace: true });
        return;
      }
      navigate(NEW_AUTH_FLOW_ROUTE.JOIN_YOUR_ORGANIZATION, {
        state: {
          fromNonLuminFlow: true,
          hasJoinedOrg: user.hasJoinedOrg,
          organization: status === 'invitation_valid' && {
            url: metadata.orgUrl,
            name: metadata.orgName,
          },
        },
        replace: true,
      });
      return;
    }
    if (!newAuthProcessing && isOrgDeleted) {
      navigate('/notFound', { replace: true });
      return;
    }
    navigate(getNextUrl(invitation), { replace: true });
  };

  return {
    redirect,
    canRedirect,
    isCircleInvitation,
  };
}

export default useRedirectUserInvitation;
