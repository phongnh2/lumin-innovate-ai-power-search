import { omit } from 'lodash';
import React from 'react';
import { matchPath, Navigate } from 'react-router';

import { PERIOD, PLAN_URL } from 'constants/plan';
import { Routers, ROUTE_MATCH } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

const oldPaymentParams = ['circle_id', UrlSearchParam.OLD_PAYMENT_ORG_TARGET];

export const getNewPaymentRedirector = (props) => {
  const { location } = props;
  const { search } = location;
  const searchParams = new URLSearchParams(search);
  const matched = matchPath(
    {
      path: ROUTE_MATCH.PAYMENT,
      end: false,
    },
    location.pathname
  );
  const { planName, period } = matched.params;

  const isInvalidPlan = () => !Object.values(omit(PLAN_URL, 'BUSINESS')).includes(planName?.toLowerCase());

  const isInvalidPeriod = () => !Object.values(PERIOD).includes(period?.toUpperCase());

  if (isInvalidPlan() || isInvalidPeriod()) {
    return <Navigate to={Routers.NOT_FOUND} />;
  }

  if (planName) {
    searchParams.append(UrlSearchParam.PDF_PLAN, planName);
  }

  if (period) {
    searchParams.append(UrlSearchParam.PAYMENT_PERIOD, period);
  }

  const matchedOldParam = oldPaymentParams.find((param) => searchParams.has(param));
  if (matchedOldParam) {
    const value = searchParams.get(matchedOldParam);
    oldPaymentParams.forEach((param) => searchParams.delete(param));
    searchParams.append(UrlSearchParam.PAYMENT_ORG_TARGET, value);
  }

  return <Navigate to={`${[Routers.PAYMENT, searchParams].join('?')}`} />;
};
