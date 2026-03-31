import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useLocation, Navigate } from 'react-router';

import selectors from 'selectors';

import { isUserInNewAuthenTestingScope } from 'utils/newAuthenTesting';

import { ORG_TEXT } from 'constants/organizationConstants';
import { NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';

const JoinOrganizationContainer = ({ children }) => {
  const location = useLocation();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const suggestedOrganizations = useSelector(selectors.getSuggestedOrganizations, shallowEqual).data || [];
  const fromNonLuminFlow = Boolean(location.state?.fromNonLuminFlow);
  const selectedOrg = location.state?.organization;
  const hasJoinedOrg = Boolean(location.state?.hasJoinedOrg);

  const { search } = location;
  const getDirectUrl = useCallback((url) => `${url}${search}`, [search]);

  if (fromNonLuminFlow && !hasJoinedOrg && !suggestedOrganizations.length) {
    return <Navigate to={getDirectUrl(NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION)} replace />;
  }

  if (fromNonLuminFlow) {
    return children;
  }

  if (!isUserInNewAuthenTestingScope(currentUser)) {
    return <Navigate to={selectedOrg ? `/${ORG_TEXT}/${selectedOrg.url}/documents` : '/'} />;
  }

  if (!suggestedOrganizations.length) {
    return <Navigate to={getDirectUrl(NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION)} replace />;
  }

  return children;
};

JoinOrganizationContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default JoinOrganizationContainer;
