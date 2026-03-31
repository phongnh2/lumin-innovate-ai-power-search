import { useGetFeatureValue } from 'hooks/growthBook/useGetFeatureValue';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export enum NEW_PRICING_MODELS_VARIANT {
  VARIANT_A = 'VariantA',
  VARIANT_B = 'VariantB',
  VARIANT_C = 'VariantC',
  VARIANT_D = 'VariantD',
  VARIANT_E = 'VariantE',
}

const useGetValueNewPricesModel = (): { variant: NEW_PRICING_MODELS_VARIANT } => {
  const { value } = useGetFeatureValue<NEW_PRICING_MODELS_VARIANT | null>({
    key: FeatureFlags.NEW_PRICING_MODELS,
    fallback: null,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });

  return {
    variant: value,
  };
};

export { useGetValueNewPricesModel };
