import { matchPath, useLocation } from 'react-router';

import { Routers } from 'constants/Routers';

const usePaymentRouteMatch = (): boolean => {
  const location = useLocation();
  return Boolean(
    matchPath(
      {
        path: Routers.PAYMENT,
        end: false,
      },
      location.pathname
    )
  );
};

export default usePaymentRouteMatch;
