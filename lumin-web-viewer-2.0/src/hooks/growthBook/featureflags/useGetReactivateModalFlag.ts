import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { useGetFeatureIsOn } from '../useGetFeatureIsOn';

const useGetReactivateModalFlag = () => {
  const { isOn, loading } = useGetFeatureIsOn({
    key: FeatureFlags.USE_REACTIVATE_LUMIN_CIRCLE_SUBSCRIPTION_MODAL,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });

  return {
    canShowModal: isOn,
    loading,
  };
};

export default useGetReactivateModalFlag;
