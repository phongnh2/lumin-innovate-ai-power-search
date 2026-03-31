import React from 'react';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { useGetPromoteDownloadMobileAppFlag, useOpenDownloadMobileModal } from 'features/CNC/hooks';
import { VARIANT_PROMOTE_DOWNLOAD_MOBILE_APP } from 'features/CNC/hooks/useGetPromoteDownloadMobileAppFlag';

const DownloadMobileModalVariantA = lazyWithRetry(() => import('./components/VariantA'));
const DownloadMobileModalVariantB = lazyWithRetry(() => import('./components/VariantB'));

const DownloadMobileModal = () => {
  const { open, onClose } = useOpenDownloadMobileModal();
  const { variant } = useGetPromoteDownloadMobileAppFlag();

  switch (variant) {
    case VARIANT_PROMOTE_DOWNLOAD_MOBILE_APP.VARIANT_A:
      return open && <DownloadMobileModalVariantA onClose={onClose} />;

    case VARIANT_PROMOTE_DOWNLOAD_MOBILE_APP.VARIANT_B:
      return open && <DownloadMobileModalVariantB onClose={onClose} />;

    default:
      return null;
  }
};

export default DownloadMobileModal;
