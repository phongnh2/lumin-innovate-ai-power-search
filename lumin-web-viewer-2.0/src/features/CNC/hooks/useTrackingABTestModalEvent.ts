import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useTrackingModalEvent } from 'hooks';

import { hotjarUtils } from 'utils';
import { ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { CNCModalPurpose } from 'features/CNC/constants/events/modal';

const useTrackingABTestModalEvent = ({
  modalName,
  hotjarEvent,
  variationName,
}: {
  modalName: string;
  hotjarEvent: string;
  variationName?: string;
}) => {
  const { trackModalViewed, trackModalConfirmation, trackModalDismiss } = useTrackingModalEvent({
    modalName,
    modalPurpose: ModalPurpose[modalName] || CNCModalPurpose[modalName],
    variationName,
  });
  const isTrackedEvent = useRef(false);
  const hasGTMLoaded = useSelector(selectors.hasGTMLoaded);

  useEffect(() => {
    if (hasGTMLoaded && !isTrackedEvent.current) {
      isTrackedEvent.current = true;
      hotjarUtils.trackEvent(hotjarEvent);
    }
  }, [hasGTMLoaded]);

  useEffect(() => {
    trackModalViewed().catch(() => {});
  }, [modalName]);

  return {
    trackModalConfirmation,
    trackModalDismiss,
  };
};

export default useTrackingABTestModalEvent;
