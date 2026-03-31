import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnableAITool = () => {
  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.EDIT_BY_AGREEMENT_GEN,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    enabled: isOn,
  };
};
