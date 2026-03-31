import { useEffect } from 'react';

import { useTrackingModalEvent } from 'hooks';

import { hotjarUtils } from 'utils';
import { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';

const useTrackEventExtendFreeTrialModal = () => {
  const { trackModalViewed, trackModalConfirmation, trackModalDismiss } = useTrackingModalEvent({
    modalName: ModalName.EXTEND_FREE_TRIAL_MODAL,
    modalPurpose: ModalPurpose[ModalName.EXTEND_FREE_TRIAL_MODAL],
  });

  useEffect(() => {
    trackModalViewed().catch(() => {});
    hotjarUtils.trackEvent(HOTJAR_EVENT.EXTEND_FREE_TRIAL_MODAL_VIEWED);
  }, []);

  return { trackModalConfirmation, trackModalDismiss };
};

export default useTrackEventExtendFreeTrialModal;
