import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router';

import selectors from 'selectors';

import { DiscoverLumin } from 'luminComponents/ReskinLayout/components/DiscoverLumin';

import { useEnableWebReskin, useExtraSmallMatch } from 'hooks';

import { isMobileDevice } from 'helpers/device';
import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

import { IUser } from 'interfaces/user/user.interface';

import SignAuthRedirector from './SignAuthRedirector';
import withRouteNavigation from '../HOC/withRouteNavigation';

interface IRouteProps {
  condition: (props: any) => boolean;
  pageTitle: string;
  component: React.FunctionComponent<{
    route: IRouteProps;
  }>;
  guestOnly: boolean;
  noIndex: boolean;
}

interface ICommonRouteProps {
  route: IRouteProps;
}

const CommonRoute = (props: ICommonRouteProps): JSX.Element => {
  const location = useLocation();
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { isEnableReskin } = useEnableWebReskin();
  const isExtraSmallMatch = useExtraSmallMatch();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const signAuthRoutesMatched = matchPaths(
    Object.values(ROUTE_MATCH.AUTHENTICATION).map((route) => ({ path: route, end: false })),
    location.pathname
  );

  const { route } = props;

  if (route?.condition && !route.condition(props)) {
    return <Navigate to="/notfound" />;
  }

  if (isEnableReskin && isMobileDevice && isExtraSmallMatch) {
    return <DiscoverLumin />;
  }
  if (currentUser && route?.guestOnly) {
    if (signAuthRoutesMatched) {
      return <SignAuthRedirector />;
    }
    return (
      <Navigate
        to={{
          pathname: '/',
        }}
      />
    );
  }

  return <route.component {...props} />;
};

export default withRouteNavigation(CommonRoute);
