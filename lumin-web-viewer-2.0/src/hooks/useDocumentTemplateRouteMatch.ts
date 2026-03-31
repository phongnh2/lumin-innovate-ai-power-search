import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH, Routers } from 'constants/Routers';

export const useDocumentTemplateRouteMatch = () => {
  const location = useLocation();
  return Boolean(
    matchPaths(
      [
        ROUTE_MATCH.TEMPLATES,
        ROUTE_MATCH.ORGANIZATION_TEMPLATES,
        ROUTE_MATCH.ORGANIZATION_TEAM_TEMPLATES,
        ROUTE_MATCH.PERSONAL_TEMPLATES,
        Routers.PERSONAL_TEMPLATES,
      ].map((route) => ({ path: route, end: false })),
      location.pathname
    )
  );
};

export default useDocumentTemplateRouteMatch;
