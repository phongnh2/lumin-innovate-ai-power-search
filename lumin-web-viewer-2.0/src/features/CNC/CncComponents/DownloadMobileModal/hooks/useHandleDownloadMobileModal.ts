import { CNCModalName } from 'features/CNC/constants/events/modal';
import useTrackingABTestModalEvent from 'features/CNC/hooks/useTrackingABTestModalEvent';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { APPLE_STORE_APP_URL, GOOGLE_PLAY_APP_URL } from 'constants/mobileApp';

import useGetHasShownDownloadMobileModal from './useGetHasShownDownloadMobileModal';

type Params = {
  onClose: () => void;
};

export enum DOWNLOAD_PAGE {
  GOOGLE_PLAY = 'GOOGLE_PLAY',
  APPLE_STORE = 'APPLE_STORE',
}

const APP_URL = {
  [DOWNLOAD_PAGE.GOOGLE_PLAY]: GOOGLE_PLAY_APP_URL,
  [DOWNLOAD_PAGE.APPLE_STORE]: APPLE_STORE_APP_URL,
};

const useHandleDownloadMobileModal = ({ onClose }: Params) => {
  const { trackModalConfirmation, trackModalDismiss } = useTrackingABTestModalEvent({
    modalName: CNCModalName.DOWNLOAD_MOBILE_MODAL,
    hotjarEvent: HOTJAR_EVENT.DOWNLOAD_MOBILE_MODAL,
  });
  const { setOrgHasShownDownloadMobileModal } = useGetHasShownDownloadMobileModal();

  const goToDownloadPage = (page: DOWNLOAD_PAGE): void => {
    trackModalConfirmation().catch(() => {});
    window.open(APP_URL[page], '_blank');
  };

  const onCloseModal = () => {
    setOrgHasShownDownloadMobileModal();
    trackModalDismiss().catch(() => {});
    onClose();
  };

  return { goToDownloadPage, onCloseModal };
};

export default useHandleDownloadMobileModal;
