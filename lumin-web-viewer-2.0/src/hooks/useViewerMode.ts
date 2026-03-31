import { useSelector } from 'react-redux';
import { useMatch } from 'react-router';

import selectors from 'selectors';

import { ROUTE_MATCH } from 'constants/Routers';

import useShallowSelector from './useShallowSelector';

export const useViewerMode = () => {
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isGuestPath = Boolean(useMatch({ path: ROUTE_MATCH.GUEST_VIEW }));
  const isOffline = useSelector(selectors.isOffline);

  return {
    isAnonymousMode: !currentUser,
    isDriveGuestMode: !currentUser && isGuestPath,
    isOffline,
  };
};
