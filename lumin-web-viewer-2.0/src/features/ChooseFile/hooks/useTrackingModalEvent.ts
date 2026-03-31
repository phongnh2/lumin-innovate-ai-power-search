import { useEffect } from 'react';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

const useTrackingModalEvent = () => {
  useEffect(() => {
    const trackingData = {
      modalName: ModalName.CHOOSE_A_FILE_TO_EDIT,
      modalPurpose: ModalPurpose[ModalName.CHOOSE_A_FILE_TO_EDIT],
    };
    modalEvent.modalViewed(trackingData).catch(() => {});
  }, []);
};

export default useTrackingModalEvent;
