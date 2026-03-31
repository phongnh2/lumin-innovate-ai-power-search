import { matchPath, useMatch } from 'react-router';

import { ROUTE_MATCH } from 'constants/Routers';

export const useTemplateViewerMatch = () => ({
  isTemplateViewer: Boolean(useMatch({ path: ROUTE_MATCH.TEMPLATE_VIEWER, end: false })),
});

/**
 * @param pathname get from react-router
 */
export const isTemplateViewerRouteMatch = (pathname: string) =>
  matchPath(
    {
      path: ROUTE_MATCH.TEMPLATE_VIEWER,
      end: false,
    },
    pathname
  );
