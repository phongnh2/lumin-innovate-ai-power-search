import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { OutlineEvent } from '../types';

const trackingMap = {
  [OutlineEvent.ADD]: ModalName.ADD_OUTLINE,
  [OutlineEvent.ADD_SUB]: ModalName.ADD_OUTLINE,
  [OutlineEvent.EDIT]: ModalName.EDIT_OUTLINE,
  [OutlineEvent.DELETE]: ModalName.DELETE_OUTLINE,
};

export const useModalTracking = (type: OutlineEvent) => {
  const modalName = trackingMap[type];
  const modalPurpose = ModalPurpose[modalName];

  const trackModalViewed = () => {
    modalEvent.modalViewed({ modalName, modalPurpose }).catch((error) => console.error(error));
  };

  const trackModalDismiss = () => {
    modalEvent.modalDismiss({ modalName, modalPurpose }).catch((error) => console.error(error));
  };

  const trackModalConfirm = () => {
    modalEvent.modalConfirmation({ modalName, modalPurpose }).catch((error) => console.error(error));
  };

  return {
    trackModalViewed,
    trackModalDismiss,
    trackModalConfirm,
  };
};
