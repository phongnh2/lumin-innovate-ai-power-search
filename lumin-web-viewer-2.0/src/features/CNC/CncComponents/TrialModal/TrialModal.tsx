import React from 'react';

import { useEnableWebReskin } from 'hooks';

import PricingModal from 'features/Pricing/components/PricingModal';
import { useEnableNewPricing } from 'features/Pricing/hooks/useEnableNewPricing';

import StartTrialModalWrapper from '../StartTrialModalWrapper';

const TrialModal = ({
  openTrialModal,
  onClose,
  onClickStartTrial,
  trackModalConfirmation,
}: {
  openTrialModal: boolean;
  onClose: ({ skip }: { skip: boolean }) => void;
  onClickStartTrial: (params: { skip: boolean; isPricingModal?: boolean; plan?: string }) => void;
  trackModalConfirmation: () => Promise<void>;
}) => {
  const { enabled: enabledPricingModal } = useEnableNewPricing();
  const { isEnableReskin } = useEnableWebReskin();

  if (enabledPricingModal && isEnableReskin) {
    return (
      <PricingModal
        onClose={onClose}
        trackModalConfirmation={trackModalConfirmation}
        onClickStartTrial={onClickStartTrial}
      />
    );
  }

  return (
    <StartTrialModalWrapper openTrialModal={openTrialModal} onClose={onClose} onClickStartTrial={onClickStartTrial} />
  );
};

export default TrialModal;
