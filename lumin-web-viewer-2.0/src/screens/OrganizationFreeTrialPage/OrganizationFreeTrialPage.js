import React, { useMemo } from 'react';
import { Navigate, useLocation, matchPath } from 'react-router-dom';

import OrganizationFreeTrial from 'lumin-components/OrganizationFreeTrial';

import { PaymentUrlSerializer } from 'utils/payment';

import { Routers } from 'constants/Routers';

const OrganizationFreeTrialPage = () => {
  const location = useLocation();
  const match = matchPath({ path: Routers.PAYMENT_FREE_TRIAL, end: true }, location.pathname);
  const paymentUrlSerializer = useMemo(() => new PaymentUrlSerializer(), []);
  return match ? <Navigate to={paymentUrlSerializer.defaultTrial} /> : <OrganizationFreeTrial />;
};

OrganizationFreeTrialPage.propTypes = {};

export default OrganizationFreeTrialPage;
