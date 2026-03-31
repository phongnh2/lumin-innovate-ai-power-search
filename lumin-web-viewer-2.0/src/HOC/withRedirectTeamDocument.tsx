import React from 'react';
import { Navigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';

import { matchPaths } from 'helpers/matchPaths';

import { ORG_TEXT } from 'constants/organizationConstants';
import { TEAM_TEXT, OLD_TEAM_DOCUMENT_PATHS } from 'constants/teamConstant';

const withRedirectTeamDocument = (Component: React.ElementType) => (props: Record<string, unknown>) => {
  const location = useLocation();
  const { orgName, teamId, folderId } = useParams();

  const matchedPath = matchPaths(
    OLD_TEAM_DOCUMENT_PATHS.map((path) => ({ path: `/${ORG_TEXT}/${orgName}${path}`, end: false })),
    location.pathname
  );

  if (matchedPath) {
    const folderPath = folderId ? `/folder/${folderId}` : '';
    const redirectPath = `/${ORG_TEXT}/${orgName}/documents/${TEAM_TEXT}/${teamId}${folderPath}${location.search}`;
    return <Navigate to={redirectPath} replace />;
  }

  return <Component {...props} />;
};

export default withRedirectTeamDocument;
