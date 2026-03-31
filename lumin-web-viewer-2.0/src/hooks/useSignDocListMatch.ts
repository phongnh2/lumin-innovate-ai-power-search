import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

const useSignDocListMatch = () => {
  const location = useLocation();
  const isInSignDocListPage = Boolean(
    matchPaths(
      [ROUTE_MATCH.SIGN_DOC_LIST, ROUTE_MATCH.PREMIUM_USER_PATHS.SIGN_DOC_LIST].map((path) => ({
        path,
        end: false,
      })),
      location.pathname
    )
  );

  return { isInSignDocListPage };
};

export default useSignDocListMatch;
