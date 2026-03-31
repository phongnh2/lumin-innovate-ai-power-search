import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

const usePremiumUserRouteMatch = () => {
  const location = useLocation();

  const isPremiumUserRoute = Boolean(
    matchPaths(
      Object.values(ROUTE_MATCH.PREMIUM_USER_PATHS).map((path) => ({ path, end: false })),
      location.pathname
    )
  );
  return { isPremiumUserRoute };
};

export default usePremiumUserRouteMatch;
