import React, { useEffect, useRef } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import selectors from 'selectors';

import withPreventCreateOrganization from 'HOC/withPreventCreateOrganization';

import { isUserInNewAuthenTestingScope } from 'utils/newAuthenTesting';

import SetUpOrganization from './SetUpOrganization';

const SetUpOrganizationWrapper = (props) => {
  const isFirstRender = useRef(false);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const { state, search } = useLocation();
  const { fromPayment } = state || {};

  useEffect(() => {
    isFirstRender.current = true;
  }, []);

  if (!isUserInNewAuthenTestingScope(currentUser) && !fromPayment && !isFirstRender.current) {
    return <Navigate to={`/${search}`} />;
  }

  return <SetUpOrganization {...props} />;
};

export default withPreventCreateOrganization(SetUpOrganizationWrapper);
