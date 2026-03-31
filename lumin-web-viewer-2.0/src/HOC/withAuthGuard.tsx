/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { RouterProps, useLocation, matchPath } from 'react-router';

import selectors from 'selectors';

import Loading from 'luminComponents/Loading';

import { kratosService } from 'services/oryServices';

import { commonUtils, LocalStorageUtils } from 'utils';

import { Routers } from 'constants/Routers';
import { BASEURL } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { IUser } from 'interfaces/user/user.interface';

function withAuthGuard<T extends RouterProps>(Component: React.ComponentType<T>): (props: T) => JSX.Element {
  function HOC(props: T): JSX.Element {
    const isAuthenticating = useSelector<unknown, boolean>(selectors.isAuthenticating);
    const isCompletedGettingUserData = useSelector(selectors.getIsCompletedGettingUserData);
    const location = useLocation();

    const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
    const searchParams = new URLSearchParams(window.location.search);
    const isPaymentPage = matchPath({
      path: Routers.PAYMENT,
      end: false,
    }, location.pathname);
    const isTrialPage = matchPath({
      path: Routers.PAYMENT_FREE_TRIAL,
      end: false,
    }, location.pathname);
    if (isAuthenticating || !isCompletedGettingUserData) {
      return <Loading fullscreen />;
    }

    const handleRedirect = (): void => {
      if (searchParams.get(UrlSearchParam.REDIRECT) === 'sign-up') {
        return kratosService.signUp(true);
      }
      if (isPaymentPage || isTrialPage) {
        return kratosService.signIn({ url: `${BASEURL}${location.pathname}${location.search}` });
      }
      return kratosService.signIn(true);
    };

    if (!currentUser) {
      LocalStorageUtils.clear();
      handleRedirect();
      return null;
    }

    return <Component {...props} location={location} />;
  }

  HOC.displayName = commonUtils.getHOCDisplayName('withAuthGuard', Component);

  return HOC;
}

export default withAuthGuard;
