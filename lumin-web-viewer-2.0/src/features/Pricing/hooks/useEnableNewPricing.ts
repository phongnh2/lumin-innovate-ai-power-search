import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnableNewPricing = () => {
  const { isOn: enabled, loading } = useGetFeatureIsOn({
    key: FeatureFlags.NEW_PRICING,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });

  return {
    enabled,
    loading,
  };
};
