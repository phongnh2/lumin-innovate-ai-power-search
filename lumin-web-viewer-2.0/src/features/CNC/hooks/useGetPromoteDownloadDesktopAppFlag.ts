import { useGetFeatureValue } from 'hooks/growthBook/useGetFeatureValue';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export enum VARIANT_PROMOTE_DOWNLOAD_DESKTOP_APP {
  VARIANT_A = 'variantA',
}

const useGetPromoteDownloadDesktopAppFlag = () => {
  const { value } = useGetFeatureValue<{ variant: VARIANT_PROMOTE_DOWNLOAD_DESKTOP_APP } | null>({
    key: FeatureFlags.PROMOTE_DOWNLOAD_DESKTOP_APP,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
    fallback: null,
  });

  return {
    canShowDownloadDesktopModal: Boolean(value),
  };
};

export { useGetPromoteDownloadDesktopAppFlag };
