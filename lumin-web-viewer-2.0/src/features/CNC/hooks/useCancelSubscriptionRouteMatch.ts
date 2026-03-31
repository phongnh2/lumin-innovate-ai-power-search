import { matchPath, useLocation } from 'react-router';

import { ROUTE_MATCH } from 'constants/Routers';

const useCancelSubscriptionRouteMatch = () => {
  const location = useLocation();
  return Boolean(matchPath({ path: ROUTE_MATCH.SUBSCRIPTION, end: false }, location.pathname));
};

export default useCancelSubscriptionRouteMatch;
