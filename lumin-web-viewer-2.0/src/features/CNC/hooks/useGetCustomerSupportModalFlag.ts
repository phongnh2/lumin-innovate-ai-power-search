import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

const useGetCustomerSupportModalFlag = () => {
  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.SHOW_CUSTOMER_SUPPORT_MODAL,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    enabled: isOn,
  };
};

export { useGetCustomerSupportModalFlag };
