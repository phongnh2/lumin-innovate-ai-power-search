import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

const usePersonalDocPathMatch = (): boolean => {
  const location = useLocation();
  return Boolean(
    matchPaths(
      [ROUTE_MATCH.PERSONAL_DOCUMENTS, ROUTE_MATCH.PREMIUM_USER_PATHS.PERSONAL_DOCUMENTS].map((path) => ({
        path,
        end: false,
      })),
      location.pathname
    )
  );
};

export default usePersonalDocPathMatch;
