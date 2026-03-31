import React from 'react';
import { Navigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';

import { matchPaths } from 'helpers/matchPaths';

import { ORG_TEXT, OLD_ORGANIZATION_DOCUMENT_PATHS } from 'constants/organizationConstants';

const withRedirectOrganizationDocument = (Component: React.ElementType) => (props: Record<string, unknown>) => {
  const location = useLocation();
  const { orgName, folderId } = useParams();

  const matchedPath = matchPaths(
    OLD_ORGANIZATION_DOCUMENT_PATHS.map((path) => ({ path: `/${ORG_TEXT}/${orgName}${path}`, end: false })),
    location.pathname
  );

  if (matchedPath) {
    const folderPath = folderId ? `/folder/${folderId}` : '';
    const redirectPath = `/${ORG_TEXT}/${orgName}/documents/${ORG_TEXT}${folderPath}${location.search}`;
    return <Navigate to={redirectPath} replace />;
  }

  return <Component {...props} />;
};

export default withRedirectOrganizationDocument;
