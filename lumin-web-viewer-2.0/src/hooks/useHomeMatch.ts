import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

const useHomeMatch = () => {
  const location = useLocation();

  const isHomePage = Boolean(
    matchPaths(
      [ROUTE_MATCH.HOME].map((path) => ({ path, end: false })),
      location.pathname
    )
  );

  const isRecentTab = Boolean(
    matchPaths(
      [ROUTE_MATCH.RECENT_DOCUMENTS].map((path) => ({
        path,
        end: false,
      })),
      location.pathname
    )
  );

  const isTrendingTab = Boolean(
    matchPaths(
      [ROUTE_MATCH.TRENDING_DOCUMENTS].map((path) => ({
        path,
        end: false,
      })),
      location.pathname
    )
  );

  return { isHomePage, isRecentTab, isTrendingTab };
};

export default useHomeMatch;
