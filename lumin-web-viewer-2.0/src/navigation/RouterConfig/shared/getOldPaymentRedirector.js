import React from 'react';
import { matchPath, Navigate } from 'react-router-dom';

import { PLAN_URL } from 'constants/plan';

export const getOldPaymentRedirector = ({ location, targetKey }) => {
  const { search, pathname } = location;
  const matchLocation = matchPath({
    path: `/payment/${targetKey}/:period`,
    end: false,
  }, pathname);
  if (matchLocation) {
    const { params } = matchLocation;
    return <Navigate to={`/payment/${PLAN_URL.ORG_PRO}/${params.period}${search}`} />;
  }
  return <Navigate to={`/payment/${PLAN_URL.ORG_PRO}/monthly${search}`} />;
};
