import { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate, useLocation, useMatch } from 'react-router';

import selectors from 'selectors';

import { authServices } from 'services';

import { matchPaths } from 'helpers/matchPaths';

import { isUserInNewAuthenTestingScope } from 'utils/newAuthenTesting';

import { NEW_AUTH_FLOW_ROUTE, Routers } from 'constants/Routers';

export const useRedirectToFreePlanFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const isSatisfiedUser = Boolean(currentUser) && isUserInNewAuthenTestingScope(currentUser);
  const newAuthRoutesMatch = matchPaths(
    Object.values(NEW_AUTH_FLOW_ROUTE).map((route) => ({ path: route, end: false })),
    location.pathname
  );
  const isPaymentPage = useMatch({ path: Routers.PAYMENT, end: false });
  const isOpenFormPage = useMatch({ path: Routers.OPEN_FORM, end: false });

  useEffect(() => {
    if (isSatisfiedUser && !newAuthRoutesMatch && !isPaymentPage && !isOpenFormPage) {
      const { url } = authServices.getNewAuthenRedirectUrl(currentUser);
      navigate(url, { replace: true });
    }
  }, [currentUser, location.pathname]);
};
