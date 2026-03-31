import { useEffect } from 'react';

import { modalEvent, TModalEvent } from '@/lib/factory/modal.event';

type TUseTrackingModalEventProps = TModalEvent & { isOpen?: boolean };

export const useTrackingModalEvent = ({ modalName, modalPurpose, isOpen = false }: TUseTrackingModalEventProps): unknown => {
  useEffect(() => {
    if (isOpen) {
      modalEvent.modalViewed({ modalName, modalPurpose });
    }
  }, [isOpen, modalName, modalPurpose]);

  const trackModalViewed = () => modalEvent.modalViewed({ modalName, modalPurpose });
  const trackModalDismiss = () => modalEvent.modalDismiss({ modalName, modalPurpose });
  const trackModalConfirmation = () => modalEvent.modalConfirmation({ modalName, modalPurpose });
  const trackModalHidden = () => modalEvent.modalHidden({ modalName, modalPurpose });
  return {
    trackModalViewed,
    trackModalConfirmation,
    trackModalDismiss,
    trackModalHidden
  };
};

export default useTrackingModalEvent;
