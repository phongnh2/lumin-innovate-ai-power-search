import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnableAutoDetect = () => {
  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.AUTO_DETECT_FORM_FIELDS,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    enabled: isOn,
  };
};
