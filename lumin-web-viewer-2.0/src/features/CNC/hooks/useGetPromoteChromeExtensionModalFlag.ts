import { useGetFeatureValue } from 'hooks/growthBook/useGetFeatureValue';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export enum PROMOTE_CHROME_EXTENSION_MODAL_VARIANT {
  VARIANT_A = 'variantA',
  VARIANT_B = 'variantB',
}

const useGetPromoteChromeExtensionModalFlag = () => {
  const { value } = useGetFeatureValue<{ variant: PROMOTE_CHROME_EXTENSION_MODAL_VARIANT } | null>({
    key: FeatureFlags.PROMOTE_CHROME_EXTENSION_MODAL,
    fallback: null,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
  });

  return {
    isShowPromoteChromeExtensionModal: Boolean(value),
    variant: value?.variant,
  };
};

export { useGetPromoteChromeExtensionModalFlag };
