import { toLower } from 'lodash';
import { useParams } from 'react-router';
import { useMatch, useLocation } from 'react-router-dom';

import { PERIOD, PLAN_URL } from 'constants/plan';
import { Routers } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

type UseMatchPaymentRoutePayload = {
  plan: string;
  period: string;
  isFreeTrial: boolean;
  isMonthly: boolean;
  isAnnual: boolean;
  search: string;
  targetUrl: string;
  returnUrl: string;
  promotion: string;
  trial: string;
  isPaymentPage: boolean;
};

const useMatchPaymentRoute = (): UseMatchPaymentRoutePayload => {
  const { planName: planNameParam, period } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const matchedTrialRoute = useMatch({
    path: Routers.PAYMENT_FREE_TRIAL,
    end: false,
  });
  const paymentRouteMatch = useMatch({
    path: Routers.PAYMENT,
    end: false,
  });
  const plan = Object.keys(PLAN_URL).find(
    (key) => (PLAN_URL as Record<string, string>)[key] === toLower(planNameParam)
  );
  const periodResult = period?.toUpperCase();

  return {
    plan,
    period: periodResult,
    isFreeTrial: Boolean(matchedTrialRoute),
    isMonthly: periodResult === PERIOD.MONTHLY,
    isAnnual: periodResult === PERIOD.ANNUAL,
    targetUrl: searchParams.get(UrlSearchParam.PAYMENT_ORG_TARGET),
    search,
    returnUrl: searchParams.get(UrlSearchParam.RETURN_URL),
    promotion: searchParams.get(UrlSearchParam.PROMOTION) || '',
    trial: searchParams.get(UrlSearchParam.TRIAL),
    isPaymentPage: Boolean(paymentRouteMatch),
  };
};

export default useMatchPaymentRoute;
