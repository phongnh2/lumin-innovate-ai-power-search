import { PLAN_TYPE_LABEL } from 'constants/plan';

import useMatchPaymentRoute from './useMatchPaymentRoute';

const useGetPlanName = (): string => {
  const { plan } = useMatchPaymentRoute();
  return PLAN_TYPE_LABEL[plan as keyof typeof PLAN_TYPE_LABEL];
};

export default useGetPlanName;
