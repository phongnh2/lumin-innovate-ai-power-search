import { useState } from 'react';

import { useGetFeatureValue } from 'hooks/growthBook/useGetFeatureValue';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export enum CHECKOUT_ON_VIEWER_VARIANT {
  MODAL = 'MODAL',
  POPOVER = 'POPOVER',
}

const useOpenCheckoutOnViewer = () => {
  const [open, setOpen] = useState(false);
  const { value } = useGetFeatureValue<{ variant: CHECKOUT_ON_VIEWER_VARIANT } | null>({
    key: FeatureFlags.CHECKOUT_ON_VIEWER,
    fallback: null,
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
  });

  return {
    open: open && Boolean(value),
    shouldShowCheckoutOnViewerFlag: Boolean(value),
    isVariantModal: open && value?.variant === CHECKOUT_ON_VIEWER_VARIANT.MODAL,
    isVariantPopover: open && value?.variant === CHECKOUT_ON_VIEWER_VARIANT.POPOVER,
    setOpenBillingModal: setOpen,
  };
};

export { useOpenCheckoutOnViewer };
