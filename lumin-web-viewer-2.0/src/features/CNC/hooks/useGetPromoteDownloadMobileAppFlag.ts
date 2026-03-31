import { useGetFeatureValue } from 'hooks/growthBook/useGetFeatureValue';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export enum VARIANT_PROMOTE_DOWNLOAD_MOBILE_APP {
  VARIANT_A = 'variantA',
  VARIANT_B = 'variantB',
}

const useGetPromoteDownloadMobileAppFlag = () => {
  const { value } = useGetFeatureValue<{ variant: VARIANT_PROMOTE_DOWNLOAD_MOBILE_APP } | null>({
    key: FeatureFlags.PROMOTE_DOWNLOAD_MOBILE_APP,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
    fallback: null,
  });

  return {
    canShowDownloadMobileModal: Boolean(value),
    variant: value?.variant,
  };
};

export { useGetPromoteDownloadMobileAppFlag };
