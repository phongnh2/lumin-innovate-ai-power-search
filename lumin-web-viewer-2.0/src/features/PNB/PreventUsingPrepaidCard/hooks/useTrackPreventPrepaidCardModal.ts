import { useTrackingModalEvent } from 'hooks/useTrackingModalEvent';

import { PNBModalName, PNBModalPurpose } from '../../constants/events/modal';

const useTrackPreventPrepaidCardModal = () => {
  const { trackModalViewed, trackModalConfirmation } = useTrackingModalEvent({
    modalName: PNBModalName.PREVENT_USING_PREPAID_CARD,
    modalPurpose: PNBModalPurpose[PNBModalName.PREVENT_USING_PREPAID_CARD],
  });

  return {
    trackModalViewed,
    trackModalConfirmation,
  };
};

export { useTrackPreventPrepaidCardModal };
