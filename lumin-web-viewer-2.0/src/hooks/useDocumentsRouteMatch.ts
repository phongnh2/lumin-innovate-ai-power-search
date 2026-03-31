import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

export const useDocumentsRouteMatch = () => {
  const location = useLocation();
  return Boolean(
    matchPaths(
      [ROUTE_MATCH.DOCUMENTS, ROUTE_MATCH.ORG_DOCUMENT].map((route) => ({ path: route, end: false })),
      location.pathname
    )
  );
};

export default useDocumentsRouteMatch;
