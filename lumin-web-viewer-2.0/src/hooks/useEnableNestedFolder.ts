import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { useGetFeatureIsOn } from './growthBook/useGetFeatureIsOn';

export const useEnableNestedFolder = (): {
  isEnableNestedFolder: boolean;
  loading: boolean;
} => {
  const { isOn, loading } = useGetFeatureIsOn({
    key: FeatureFlags.ENABLE_NESTED_FOLDERS,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    isEnableNestedFolder: isOn,
    loading,
  };
};
