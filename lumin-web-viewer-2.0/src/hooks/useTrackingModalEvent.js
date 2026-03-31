import { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import modalEvent, { ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

export function useTrackingModalEvent({ modalName, modalPurpose = '', isOpen = false, variationName = '' }) {
  const { data, loading } = useSelector(selectors.getOrganizationList, shallowEqual);
  const purpose = modalPurpose || ModalPurpose[modalName];

  useEffect(() => {
    if (isOpen && data && !loading) {
      modalName && modalEvent.modalViewed({ modalName, modalPurpose: purpose, variationName });
    }
  }, [isOpen, loading]);

  const trackModalViewed = async () => {
    if (modalName) {
      await modalEvent.modalViewed({ modalName, modalPurpose: purpose, variationName });
    }
  };
  const trackModalDismiss = async () => {
    if (modalName) {
      await modalEvent.modalDismiss({ modalName, modalPurpose: purpose, variationName });
    }
  };
  const trackModalConfirmation = async () => {
    if (modalName) {
      await modalEvent.modalConfirmation({ modalName, modalPurpose: purpose, variationName });
    }
  };
  const trackModalHidden = async () => {
    if (modalName) {
      await modalEvent.modalHidden({ modalName, modalPurpose: purpose, variationName });
    }
  };
  return {
    trackModalViewed,
    trackModalConfirmation,
    trackModalDismiss,
    trackModalHidden,
  };
}

export default useTrackingModalEvent;
