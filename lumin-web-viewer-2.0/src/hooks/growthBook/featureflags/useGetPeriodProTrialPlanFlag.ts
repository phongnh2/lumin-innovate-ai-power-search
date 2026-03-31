import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';
import { PaymentPeriod } from 'constants/plan.enum';

import { useGetFeatureValue } from '../useGetFeatureValue';

type Payload = {
  isOn: boolean;
  period: PaymentPeriod;
  fromParam: string;
};

const FROM_PARAMS = {
  [PaymentPeriod.MONTHLY]: 'ftm1',
  [PaymentPeriod.ANNUAL]: 'fta1',
};

const useGetPeriodProTrialPlanFlag = (): Payload => {
  const { value } = useGetFeatureValue({
    key: FeatureFlags.PERIOD_PRO_TRIAL_PLAN,
    fallback: '',
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });

  return {
    isOn: Boolean(value),
    period: PaymentPeriod[value as keyof typeof PaymentPeriod],
    fromParam: FROM_PARAMS[value as keyof typeof PaymentPeriod] || '',
  };
};

export default useGetPeriodProTrialPlanFlag;
