import React, { ComponentType } from 'react';
import { Navigate } from 'react-router';

import { useAvailablePersonalWorkspace, usePremiumUserRouteMatch } from 'hooks';

import { Routers } from 'constants/Routers';

const withPremiumUserPathRedirect =
  <T,>(Component: ComponentType<T>) =>
  (props: T) => {
    const isAvailable = useAvailablePersonalWorkspace();
    const { isPremiumUserRoute } = usePremiumUserRouteMatch();

    if (!isAvailable && isPremiumUserRoute) {
      return <Navigate to={Routers.NOT_FOUND} />;
    }

    return <Component {...props} />;
  };

export default withPremiumUserPathRedirect;
