import { matchPath } from 'react-router';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

export class RouterUtil {
  /**
   * @param pathname pathname must be get from useLocation().pathname
   */
  static isViewerPath = (pathname: string) =>
    !!matchPath(
      {
        path: ROUTE_MATCH.VIEWER,
        end: false,
      },
      pathname
    );

  static isDocumentPath = (pathname: string) =>
    matchPaths(
      [ROUTE_MATCH.DOCUMENTS, ROUTE_MATCH.ORG_DOCUMENT].map((route) => ({ path: route, end: false })),
      pathname
    );
}
