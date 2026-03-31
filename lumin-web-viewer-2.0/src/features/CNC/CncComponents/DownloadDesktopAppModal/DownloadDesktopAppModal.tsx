import React from 'react';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { useOpenDownloadDesktopAppModal } from 'features/CNC/hooks/useOpenDownloadDesktopAppModal';

const DownloadDesktopAppModalVariantA = lazyWithRetry(() => import('./components/VariantA'));

const DownloadDesktopAppModal = () => {
  const { open, onClose } = useOpenDownloadDesktopAppModal();

  return open && <DownloadDesktopAppModalVariantA onClose={onClose} />;
};

export default DownloadDesktopAppModal;
