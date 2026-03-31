import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useHandleDefaultTab = () => {
  const { isOn: isFillAndSignDefaultTab, loading } = useGetFeatureIsOn({
    key: FeatureFlags.FILL_AND_SIGN_DEFAULT_TAB,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    isFillAndSignDefaultTab,
    loading,
  };
};
