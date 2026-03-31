import React from 'react';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { CNCModalName } from 'features/CNC/constants/events/modal';
import { useOpenPromoteChromeExtensionModal } from 'features/CNC/hooks';
import {
  PROMOTE_CHROME_EXTENSION_MODAL_VARIANT,
  useGetPromoteChromeExtensionModalFlag,
} from 'features/CNC/hooks/useGetPromoteChromeExtensionModalFlag';
import useTrackingABTestModalEvent from 'features/CNC/hooks/useTrackingABTestModalEvent';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { CHROME_EXTENSION_URL } from 'constants/urls';

const PromoteChromeExtensionModalVariantA = lazyWithRetry(() => import('./components/VariantA'));
const PromoteChromeExtensionModalVariantB = lazyWithRetry(() => import('./components/VariantB'));

const PromoteChromeExtensionModal = () => {
  const { open, onClose } = useOpenPromoteChromeExtensionModal();
  const { trackModalConfirmation, trackModalDismiss } = useTrackingABTestModalEvent({
    modalName: CNCModalName.DOWNLOAD_CHROME_EXTENSION,
    hotjarEvent: HOTJAR_EVENT.DOWNLOAD_CHROME_EXTENSION,
  });

  const { variant } = useGetPromoteChromeExtensionModalFlag();

  const handleCloseModal = () => {
    onClose();
    trackModalDismiss().catch(() => {});
  };

  const handleGoToExtensionPage = () => {
    window.open(CHROME_EXTENSION_URL, '_blank').focus();
    trackModalConfirmation().catch(() => {});
    onClose();
  };

  switch (variant) {
    case PROMOTE_CHROME_EXTENSION_MODAL_VARIANT.VARIANT_A:
      return (
        open && (
          <PromoteChromeExtensionModalVariantA
            handleGoToExtensionPage={handleGoToExtensionPage}
            handleCloseModal={handleCloseModal}
          />
        )
      );
    case PROMOTE_CHROME_EXTENSION_MODAL_VARIANT.VARIANT_B:
      return (
        open && (
          <PromoteChromeExtensionModalVariantB
            handleGoToExtensionPage={handleGoToExtensionPage}
            handleCloseModal={handleCloseModal}
          />
        )
      );
    default:
      return null;
  }
};
export default PromoteChromeExtensionModal;
