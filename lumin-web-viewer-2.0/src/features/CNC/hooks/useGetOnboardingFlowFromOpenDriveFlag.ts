import { useGetFeatureValue } from 'hooks/growthBook/useGetFeatureValue';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export enum CNC_ONBOARDING_FLOW_VARIANT {
  VARIANT_A = 'control',
  VARIANT_B = 'suggestedIpAddress',
}

const useGetOnboardingFlowFromOpenDriveFlag = () => {
  const { value } = useGetFeatureValue<{ variant: CNC_ONBOARDING_FLOW_VARIANT } | null>({
    key: FeatureFlags.ONBOARDING_FLOW_FROM_OPEN_DRIVE,
    fallback: null,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    isUseOnboardingFLow: Boolean(value),
    variant: value?.variant,
  };
};

export { useGetOnboardingFlowFromOpenDriveFlag };
