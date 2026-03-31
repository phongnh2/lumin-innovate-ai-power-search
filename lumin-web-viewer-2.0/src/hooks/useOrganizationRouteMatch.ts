import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ORGANIZATION_ROUTERS } from 'constants/organizationConstants';

const useOrganizationRouteMatch = () => {
  const location = useLocation();
  const orgRouteMatch = matchPaths(
    ORGANIZATION_ROUTERS.map((path) => ({ path, end: false })),
    location.pathname
  );
  return { orgRouteMatch };
};

export default useOrganizationRouteMatch;
