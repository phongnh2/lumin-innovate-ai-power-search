import { ScrollArea } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useLocation } from 'react-router';

import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';

import { matchPaths } from 'helpers/matchPaths';

import { ORG_TEXT } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';

import { DashboardSubSidebar } from './components/DashboardSubSidebar';
import { DocumentSubSidebar } from './components/DocumentSubSidebar';
import { OrganizationSubSidebar } from './components/OrganizationSubSidebar';
import { SubMenuTypes } from '../LeftSidebarDrawer/LeftSidebarDrawer.constants';

import styles from './LeftSubSidebar.module.scss';

const LeftSubSidebar = () => {
  const location = useLocation();
  const documentRouteMatch = matchPaths(
    [ROUTE_MATCH.ORGANIZATION_DOCUMENTS, ROUTE_MATCH.DOCUMENTS].map((path) => ({ path, end: false })),
    location.pathname
  );
  const dashboardRouteMatch = matchPaths([{ path: `/${ORG_TEXT}/:orgUrl/dashboard`, end: false }], location.pathname);
  const { isTemplatesPage } = useTemplatesPageMatch();
  if (!(documentRouteMatch || dashboardRouteMatch || isTemplatesPage)) {
    return null;
  }

  const getSubSidebar = () => {
    if (documentRouteMatch) {
      return <DocumentSubSidebar />;
    }
    if (dashboardRouteMatch) {
      return <DashboardSubSidebar />;
    }
    return <OrganizationSubSidebar type={SubMenuTypes.Templates} />;
  };

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return (
    <div className={styles.container}>
      <ScrollArea classNames={{ root: styles.scrollArea, viewport: styles.scrollViewport }} scrollbars="y">
        <div className={styles.wrapper}>{getSubSidebar()}</div>
      </ScrollArea>
    </div>
  );
};

export default LeftSubSidebar;
