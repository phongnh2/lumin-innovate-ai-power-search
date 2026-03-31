import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

const folderRoutes = [
  ...Object.values(ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT),
  ROUTE_MATCH.PREMIUM_USER_PATHS.FOLDER_DOCUMENTS,
];

export function useFolderPathMatch() {
  const location = useLocation();
  const folderMatch = matchPaths(
    folderRoutes.map((route) => ({ path: route, end: false })),
    location.pathname
  );
  return Boolean(folderMatch);
}
