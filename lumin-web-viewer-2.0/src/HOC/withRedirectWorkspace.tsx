import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';
import { useLocation } from 'react-router-dom';

import selectors from 'selectors';

import { useAvailablePersonalWorkspace, useLastAccessOrg } from 'hooks';

import { ORG_TEXT } from 'constants/organizationConstants';

const withRedirectWorkspace = (Component: React.ElementType) => (props: Record<string, unknown>) => {
  const location = useLocation();
  const isAvailable = useAvailablePersonalWorkspace();
  const isOffline = useSelector<unknown, boolean>(selectors.isOffline);
  const url = useLastAccessOrg();

  if (isAvailable || isOffline) {
    return <Component {...props} />;
  }

  if (!url) {
    return <Navigate to="/" />;
  }

  const orgUrl = `/${ORG_TEXT}/${url}/documents/personal${location.search}`;
  return <Navigate to={orgUrl} />;
};

export default withRedirectWorkspace;
