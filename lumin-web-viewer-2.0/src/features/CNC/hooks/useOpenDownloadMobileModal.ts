import { useState } from 'react';

import { useGetPromoteDownloadMobileAppFlag } from './useGetPromoteDownloadMobileAppFlag';
import useGetHasShownDownloadMobileModal from '../CncComponents/DownloadMobileModal/hooks/useGetHasShownDownloadMobileModal';

const useOpenDownloadMobileModal = () => {
  const [open, setOpen] = useState(true);
  const { canShowDownloadMobileModal: isShowDownloadMobileModal } = useGetPromoteDownloadMobileAppFlag();
  const { hasShownDownloadMobileModal } = useGetHasShownDownloadMobileModal();

  const onClose = () => setOpen(false);

  return {
    open: open && isShowDownloadMobileModal && !hasShownDownloadMobileModal,
    onClose,
  };
};

export { useOpenDownloadMobileModal };
