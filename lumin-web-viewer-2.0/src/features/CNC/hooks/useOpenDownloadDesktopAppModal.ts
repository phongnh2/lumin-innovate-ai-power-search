import { useContext, useEffect, useState } from 'react';

import { RouterContext } from 'navigation/Router/RouterContext';

import { isChrome } from 'helpers/device';
import isMobileOrTablet from 'helpers/isMobileOrTablet';

import { useGetPromoteDownloadDesktopAppFlag } from './useGetPromoteDownloadDesktopAppFlag';
import useGetHasShownDownloadDesktopModal from '../CncComponents/DownloadDesktopAppModal/hooks/useGeHasShownDownloadDesktopModal';

const useOpenDownloadDesktopAppModal = () => {
  const [open, setOpen] = useState(false);
  const { canShowDownloadDesktopModal: isShowDownloadDesktopModal } = useGetPromoteDownloadDesktopAppFlag();
  const { hasOrgShownDownloadDesktopModal } = useGetHasShownDownloadDesktopModal();
  const { hasInstalledPwa } = useContext(RouterContext) as { hasInstalledPwa: boolean };
  const shouldShowDownloadPwa = (!hasInstalledPwa || !isChrome) && !isMobileOrTablet();

  useEffect(() => {
    if (!hasInstalledPwa) {
      setOpen(true);
    }
  }, [hasInstalledPwa]);

  const onClose = () => setOpen(false);

  return {
    open: open && isShowDownloadDesktopModal && !hasOrgShownDownloadDesktopModal && shouldShowDownloadPwa,
    onClose,
  };
};

export { useOpenDownloadDesktopAppModal };
