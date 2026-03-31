import { toUpper } from 'lodash';
import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSearchParam } from 'react-use';

import { matchPaths } from 'helpers/matchPaths';

import { PaymentUrlSerializer } from 'utils/payment';

import { PLAN_URL } from 'constants/plan';
import { PaymentPeriod, PaymentPlans } from 'constants/plan.enum';
import { ROUTE_MATCH } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

const SignAuthRedirector = (): JSX.Element => {
  const location = useLocation();
  const planNameParam = useSearchParam(UrlSearchParam.PLAN)?.toLowerCase();
  const period = useSearchParam(UrlSearchParam.PLAN_PERIOD)?.toLowerCase() as PaymentPeriod;

  const trialRouteMatched = matchPaths(
    [
      { path: ROUTE_MATCH.AUTHENTICATION.TRIAL_SIGNIN, end: false },
      { path: ROUTE_MATCH.AUTHENTICATION.TRIAL_SIGNUP, end: false },
    ],
    location.pathname
  );
  const plan = Object.keys(PLAN_URL).find(
    (key) => (PLAN_URL as Record<string, string>)[key] === planNameParam
  ) as PaymentPlans;

  const isValidPlan = (): boolean =>
    [PaymentPlans.ORG_STARTER, PaymentPlans.ORG_PRO, PaymentPlans.ORG_BUSINESS].includes(plan);

  const getValidPeriod = (): PaymentPeriod =>
    [PaymentPeriod.MONTHLY, PaymentPeriod.ANNUAL].includes(toUpper(period) as PaymentPeriod)
      ? (toUpper(period) as PaymentPeriod)
      : PaymentPeriod.ANNUAL;

  if (isValidPlan()) {
    const serializer = new PaymentUrlSerializer().trial(Boolean(trialRouteMatched)).plan(plan).period(getValidPeriod());
    return <Navigate to={serializer.get()} />;
  }
  return <Navigate to="/" />;
};

export default SignAuthRedirector;
