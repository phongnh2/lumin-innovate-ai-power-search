import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { useSignDocListMatch } from 'hooks';
import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';

import { matchPaths } from 'helpers/matchPaths';

import { ORG_TEXT } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';

import { SubMenuTypes, ActiveMenuItemTypes } from '../LeftSidebarDrawer.constants';

type UseGetActiveStateMenuItemData = {
  getIsActiveValue: (subMenu: SubMenuTypes) => boolean;
  getActiveTypeValue: (subMenu: SubMenuTypes) => ActiveMenuItemTypes;
};

const useGetActiveStateMenuItem = (): UseGetActiveStateMenuItemData => {
  const location = useLocation();
  const documentRouteMatch = matchPaths(
    [ROUTE_MATCH.ORGANIZATION_DOCUMENTS, ROUTE_MATCH.DOCUMENTS].map((path) => ({ path, end: false })),
    location.pathname
  );
  const dashboardRouteMatch = matchPaths([{ path: `/${ORG_TEXT}/:orgUrl/dashboard`, end: false }], location.pathname);
  const { isTemplatesPage } = useTemplatesPageMatch();

  const { isInSignDocListPage } = useSignDocListMatch();

  const getIsActiveValue = useCallback(
    (subMenu: SubMenuTypes) =>
      ({
        [SubMenuTypes.Documents]: Boolean(documentRouteMatch),
        [SubMenuTypes.Settings]: Boolean(dashboardRouteMatch),
        [SubMenuTypes.Signs]: Boolean(isInSignDocListPage),
        [SubMenuTypes.Templates]: Boolean(isTemplatesPage),
      }[subMenu]),
    [documentRouteMatch, dashboardRouteMatch, isInSignDocListPage, isTemplatesPage]
  );

  const getActiveTypeValue = useCallback(
    (subMenu: SubMenuTypes) =>
      ({
        [SubMenuTypes.Documents]: ActiveMenuItemTypes.Documents,
        [SubMenuTypes.Settings]: ActiveMenuItemTypes.Settings,
        [SubMenuTypes.Signs]: ActiveMenuItemTypes.Signs,
        [SubMenuTypes.Templates]: ActiveMenuItemTypes.Templates,
      }[subMenu]),
    []
  );

  return {
    getIsActiveValue,
    getActiveTypeValue,
  };
};

export default useGetActiveStateMenuItem;
