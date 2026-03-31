import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ORGANIZATION_ROUTERS } from 'constants/organizationConstants';

function usePersonalWorkspaceLocation(): boolean {
  const location = useLocation();
  return !matchPaths(
    ORGANIZATION_ROUTERS.map((path) => ({ path, end: false })),
    location.pathname
  );
}

export default usePersonalWorkspaceLocation;
