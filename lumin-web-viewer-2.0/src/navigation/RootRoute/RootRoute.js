import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import selectors from 'selectors';

import useAvailablePersonalWorkspace from 'hooks/useAvailablePersonalWorkspace';
import useLastAccessOrg from 'hooks/useLastAccessOrg';

import authServices from 'services/authServices';

import { isUserInNewAuthenTestingScope } from 'utils/newAuthenTesting';
import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import { Routers } from 'constants/Routers';

function RootRoute() {
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const isAvailablePersonal = useAvailablePersonalWorkspace();
  const lastAccessedOrgUrl = useLastAccessOrg();
  const { search } = useLocation();
  const isSatisfiedUser = isUserInNewAuthenTestingScope(currentUser);

  if (isSatisfiedUser) {
    const { url } = authServices.getNewAuthenRedirectUrl(currentUser);
    return <Navigate to={url + search} />;
  }

  if (isAvailablePersonal && !lastAccessedOrgUrl) {
    return <Navigate to={Routers.DOCUMENTS + search} />;
  }

  return <Navigate to={getDefaultOrgUrl({ orgUrl: lastAccessedOrgUrl, search })} />;
}

export default RootRoute;
