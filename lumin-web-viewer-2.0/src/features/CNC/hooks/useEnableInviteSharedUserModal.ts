import { useMatch } from 'react-router';

import { ROUTE_MATCH } from 'constants/Routers';

import { useGetInviteSharedUserFlag } from './useGetInviteSharedUserFlag';

export const useEnableInviteSharedUserModal = () => {
  const isSharedTab = useMatch(ROUTE_MATCH.SHARED_DOCUMENTS);
  const isStarredTab = useMatch(ROUTE_MATCH.STARRED_DOCUMENTS);
  const { canShowInviteSharedUsersModal } = useGetInviteSharedUserFlag();

  return { enabled: canShowInviteSharedUsersModal && !isSharedTab && !isStarredTab };
};
