import { matchPath, useMatch } from 'react-router';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import { ROUTE_MATCH } from 'constants/Routers';

/**
 * @param pathname get from react-router
 */
export const isViewerRouteMatch = (pathname: string) =>
  matchPath(
    {
      path: ROUTE_MATCH.VIEWER,
      end: false,
    },
    pathname
  );

export const useViewerMatch = () => {
  const { isTemplateViewer } = useTemplateViewerMatch();
  return {
    isViewer: Boolean(useMatch({ path: ROUTE_MATCH.VIEWER, end: false })) || isTemplateViewer,
  };
};
