import { useLocation } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

const useTemplatesPageMatch = () => {
  const location = useLocation();

  const isTemplatesPage = Boolean(
    matchPaths(
      [ROUTE_MATCH.TEMPLATES].map((path) => ({ path, end: false })),
      location.pathname
    )
  );

  const isPersonalTemplatePage = Boolean(
    matchPaths(
      [ROUTE_MATCH.PERSONAL_TEMPLATES].map((path) => ({ path, end: false })),
      location.pathname
    )
  );

  return { isTemplatesPage, isPersonalTemplatePage };
};

export default useTemplatesPageMatch;
