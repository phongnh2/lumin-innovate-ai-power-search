import React from 'react';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { MINIMUM_HEIGHT_TO_VIEW_LARGE_MODALS } from 'features/CNC/constants/customConstant';
import { useGetFreeTrialModalCoolDownFlag } from 'features/CNC/hooks/useGetFreeTrialModalCoolDownFlag';

import useHandleStartTrialModalWrapper from './hooks/useHandleStartTrialModalWrapper';
import DismissFreeTrialSurvey from '../DismissFreeTrialSurvey';
import ExploreOtherProductsModal from '../ExploreOtherProducts';

const StartTrialModal = lazyWithRetry(() => import('lumin-components/StartTrialModal'));

const StartTrialModalWrapper = ({
  openTrialModal,
  onClose,
  onClickStartTrial,
}: {
  openTrialModal: boolean;
  onClose: ({ skip }: { skip: boolean }) => void;
  onClickStartTrial: ({ skip }: { skip: boolean }) => void;
}) => {
  const {
    onCloseTrialModal,
    openDismissFreeTrialSurveyModal,
    openDismissFreeTrialSurveyPopover,
    onCloseDismissFreeTrialSurvey,
    onCloseDismissFreeTrialSurveyVariantModal,
  } = useHandleStartTrialModalWrapper({ onClose });
  const { isExploreOtherProductsVariant } = useGetFreeTrialModalCoolDownFlag();

  const canViewExploreOtherProductsModal = window.innerHeight > MINIMUM_HEIGHT_TO_VIEW_LARGE_MODALS;

  if (openTrialModal && isExploreOtherProductsVariant && canViewExploreOtherProductsModal) {
    return <ExploreOtherProductsModal onClose={onClose} onClickStartTrial={onClickStartTrial} />;
  }

  return (
    <>
      {openTrialModal && (
        <StartTrialModal
          onClose={onCloseTrialModal}
          onClickStartTrial={onClickStartTrial}
          openDismissFreeTrialSurvey={openDismissFreeTrialSurveyModal}
          onCloseDismissFreeTrialSurveyVariantModal={onCloseDismissFreeTrialSurveyVariantModal}
        />
      )}
      {openDismissFreeTrialSurveyPopover && (
        <DismissFreeTrialSurvey.VariantPopover onClose={onCloseDismissFreeTrialSurvey} />
      )}
    </>
  );
};

export default StartTrialModalWrapper;
