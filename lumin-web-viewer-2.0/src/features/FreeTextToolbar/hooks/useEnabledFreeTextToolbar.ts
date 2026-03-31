import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnabledFreeTextToolbar = () => {
  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.FREE_TEXT_TOOLBAR,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    enabled: isOn,
  };
};
