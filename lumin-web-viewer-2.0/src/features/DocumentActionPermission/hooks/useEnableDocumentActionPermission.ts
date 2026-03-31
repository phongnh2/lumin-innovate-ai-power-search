import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnableDocumentActionPermission = () => {
  const { isOn } = useGetFeatureIsOn({
    key: FeatureFlags.DOCUMENT_ACTION_PERMISSION,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ANONYMOUS_USER_ID,
  });

  return {
    enabled: isOn,
  };
};
