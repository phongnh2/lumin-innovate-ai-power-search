import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import OrganizationCheckout from 'features/CNC/CncComponents/OrganizationCheckout';

import { Routers } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

const OrganizationCheckoutPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasWorkspaceId = searchParams.has(UrlSearchParam.PAYMENT_ORG_TARGET);
  return !hasWorkspaceId ? <Navigate to={Routers.NOT_FOUND} /> : <OrganizationCheckout />;
};

export default OrganizationCheckoutPage;
