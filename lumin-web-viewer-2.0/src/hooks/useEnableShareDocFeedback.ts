import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { useGetFeatureIsOn } from './growthBook/useGetFeatureIsOn';

export const useEnableShareDocFeedback = (): {
  isEnableShareDocFeedback: boolean;
  loading: boolean;
} => {
  const { isOn, loading } = useGetFeatureIsOn({
    key: FeatureFlags.COLLECT_NON_SHARING_FEEDBACK,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    isEnableShareDocFeedback: isOn,
    loading,
  };
};

export default useEnableShareDocFeedback;
