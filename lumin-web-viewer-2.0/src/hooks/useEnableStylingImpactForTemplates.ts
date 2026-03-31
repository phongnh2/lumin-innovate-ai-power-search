import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnableStylingImpactForTemplates = () => {
  const { isOn, loading } = useGetFeatureIsOn({
    key: FeatureFlags.STYLING_IMPACT_FOR_TEMPLATES,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ANONYMOUS_USER_ID,
  });

  return {
    enabled: isOn,
    loading,
  };
};
