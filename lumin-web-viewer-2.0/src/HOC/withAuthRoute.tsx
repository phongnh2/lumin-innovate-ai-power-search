import React from 'react';
import { RouterProps } from 'react-router';

import useErrorSubscriber from 'navigation/AuthenRoute/hooks/useErrorSubscriber';

import { useRedirectToFreePlanFlow, useRefetchDataAfterPaymentChanged, useUpdateUserSubscription } from 'hooks';

import { commonUtils } from 'utils';

export const AuthRouteContext = React.createContext({
  isCheckingMigrationModal: true,
  isMigrationModalClosed: false,
  shouldShowMigrationModal: false,
});

function withAuthRoute<T extends RouterProps>(Component: React.ComponentType<T>): (props: T) => JSX.Element {
  function HOC(props: T): JSX.Element {
    useRefetchDataAfterPaymentChanged();
    useUpdateUserSubscription();
    useErrorSubscriber();
    useRedirectToFreePlanFlow();

    return <Component {...props} />;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  HOC.displayName = commonUtils.getHOCDisplayName('withAuthRoute', Component);

  return HOC;
}

export default withAuthRoute;
