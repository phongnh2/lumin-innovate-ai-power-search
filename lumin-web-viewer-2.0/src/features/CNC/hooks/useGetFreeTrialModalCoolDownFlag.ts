import { useGetFeatureValue } from 'hooks/growthBook/useGetFeatureValue';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export enum CNC_SHOW_FREE_TRIAL_MODAL_VARIANT {
  ONLY_VIEWER = 'onlyViewer',
  EXPLORE_OTHER_PRODUCTS = 'exploreOtherProducts',
}

const useGetFreeTrialModalCoolDownFlag = () => {
  const { value } = useGetFeatureValue<{ variant: CNC_SHOW_FREE_TRIAL_MODAL_VARIANT } | null>({
    key: FeatureFlags.FREE_TRIAL_MODAL_COOL_DOWN,
    fallback: null,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });
  const isOnlyShowInViewer = [
    CNC_SHOW_FREE_TRIAL_MODAL_VARIANT.ONLY_VIEWER,
    CNC_SHOW_FREE_TRIAL_MODAL_VARIANT.EXPLORE_OTHER_PRODUCTS,
  ].includes(value?.variant);
  const isOnlyViewerVariant = value?.variant === CNC_SHOW_FREE_TRIAL_MODAL_VARIANT.ONLY_VIEWER;
  const isExploreOtherProductsVariant = value?.variant === CNC_SHOW_FREE_TRIAL_MODAL_VARIANT.EXPLORE_OTHER_PRODUCTS;

  return {
    isFreeTrialModalCoolDown: Boolean(value),
    isOnlyShowInViewer,
    isOnlyViewerVariant,
    isExploreOtherProductsVariant,
  };
};

export { useGetFreeTrialModalCoolDownFlag };
