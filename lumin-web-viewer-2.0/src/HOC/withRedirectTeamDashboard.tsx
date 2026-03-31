import React from 'react';
import { Navigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';

import { matchPaths } from 'helpers/matchPaths';

import { ORG_TEXT } from 'constants/organizationConstants';
import { TEAMS_TEXT, OLD_TEAM_DASHBOARD_PATHS } from 'constants/teamConstant';

const withRedirectTeamDashboard = (Component: React.ElementType) => (props: Record<string, unknown>) => {
  const location = useLocation();
  const { orgName, id, tab } = useParams();

  const matchOldTeamDashboardPath = matchPaths(
    OLD_TEAM_DASHBOARD_PATHS.map((route) => ({ path: route, end: false })),
    location.pathname
  );

  if (matchOldTeamDashboardPath) {
    const redirectPath = `/${ORG_TEXT}/${orgName}/${TEAMS_TEXT}/${id}/${tab}${location.search}`;
    return <Navigate to={redirectPath} replace />;
  }
  return <Component {...props} />;
};

export default withRedirectTeamDashboard;
