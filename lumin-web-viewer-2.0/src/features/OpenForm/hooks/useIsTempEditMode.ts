import { matchPath, useMatch } from 'react-router-dom';

import { ROUTE_MATCH } from 'constants/Routers';

/**
 * @param pathname pathname get from react-router
 */
export const isTempEditMode = (pathname: string) =>
  !!(matchPath(
    {
      path: ROUTE_MATCH.VIEWER_TEMP_EDIT,
    },
    pathname
  ) ||
    matchPath(
      {
        path: ROUTE_MATCH.VIEWER_TEMP_EDIT_EXTERNAL_PDF,
      },
      pathname
    )
  );

export const useIsTempEditMode = () => {
  const formTempEdit = useMatch(ROUTE_MATCH.VIEWER_TEMP_EDIT);
  const externalPdfTempEdit = useMatch(ROUTE_MATCH.VIEWER_TEMP_EDIT_EXTERNAL_PDF);
  const match = formTempEdit || externalPdfTempEdit;
  return {
    match,
    isTempEditMode: !!match,
  };
};
