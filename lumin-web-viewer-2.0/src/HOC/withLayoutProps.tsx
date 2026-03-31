import { isEmpty } from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { matchPath, useMatch } from 'react-router';

import selectors from 'selectors';

import { useGetCurrentTeam } from 'hooks';

import { matchPaths } from 'helpers/matchPaths';

import { commonUtils } from 'utils';

import { ORG_PATH } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';
import { TEAM_DOCUMENT_PATHS } from 'constants/teamConstant';

import { IRouteConfig } from 'interfaces/common';
import { ITeam } from 'interfaces/team/team.interface';

const fullscreenProps: Pick<IRouteConfig, 'header' | 'sidebar' | 'fullWidth'> = {
  header: false,
  sidebar: false,
  fullWidth: true,
};

type WithLayoutProps = IRouteConfig & { location: Location };

const CustomRoutes: Record<string, Pick<IRouteConfig, 'header' | 'sidebar' | 'exact' | 'fullWidth'>> = {
  [ROUTE_MATCH.ORGANIZATION_PLAN]: {
    ...fullscreenProps,
    exact: true,
  },
  [ROUTE_MATCH.ORGANIZATION_TRANSFER]: {
    ...fullscreenProps,
    exact: true,
  },
};

const CustomRouteKeys = Object.keys(CustomRoutes);

function withLayoutProps<T extends WithLayoutProps>(Component: React.ComponentType<T>): (props: T) => JSX.Element {
  function HOC(props: T): JSX.Element {
    const {
      location,
      component = null,
      pageTitle = '',
      header = true,
      sidebar = true,
      fullWidth = false,
      title = null,
    } = props;
    const isNoPermissionOrg = useSelector<unknown, boolean>(selectors.isNoPermissionOrg);
    const isOrgMatched = useMatch({ path: ORG_PATH, end: false });
    const currentTeam = useGetCurrentTeam() as ITeam;
    const matchTeamDocumentPath = matchPaths(
      TEAM_DOCUMENT_PATHS.map((route) => ({ path: route, end: false })),
      location.pathname
    );
    const isNoPermissionTeam = matchTeamDocumentPath && isEmpty(currentTeam);

    const key = CustomRouteKeys.find((_key) => matchPath(_key, location.pathname));
    const noPermissionProps = ((isOrgMatched && isNoPermissionOrg) || isNoPermissionTeam) && fullscreenProps;
    const specificPageProps = CustomRoutes[key];
    const layoutProps = noPermissionProps || specificPageProps || {};
    return (
      <Component
        {...props}
        component={component}
        pageTitle={pageTitle}
        header={header}
        sidebar={sidebar}
        fullWidth={fullWidth}
        title={title}
        location={location}
        {...layoutProps}
      />
    );
  }

  HOC.displayName = commonUtils.getHOCDisplayName('withLayoutProps', Component);

  return HOC;
}

export default withLayoutProps;
