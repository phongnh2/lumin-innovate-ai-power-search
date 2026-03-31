import { useMatch } from 'react-router-dom';

import { ROUTE_MATCH } from 'constants/Routers';

import useEnableWebReskin from './useEnableWebReskin';

type UsePaymentFreeTrialPageReskinData = {
  isEnableReskinUI: boolean;
};

const usePaymentFreeTrialPageReskin = (): UsePaymentFreeTrialPageReskinData => {
  const { isEnableReskin } = useEnableWebReskin();
  const isPaymentFreeTrialRouteMatch = Boolean(
    useMatch({
      path: ROUTE_MATCH.PAYMENT_FREE_TRIAL,
      end: false,
    })
  );
  return { isEnableReskinUI: isPaymentFreeTrialRouteMatch && isEnableReskin };
};

export default usePaymentFreeTrialPageReskin;
