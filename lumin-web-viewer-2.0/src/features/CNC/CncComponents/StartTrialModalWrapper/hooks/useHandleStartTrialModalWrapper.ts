import { useGetDismissFreeTrialSurveyFlag, useOpenDismissFreeTrialSurvey } from 'features/CNC/hooks';

const useHandleStartTrialModalWrapper = ({ onClose }: { onClose: ({ skip }: { skip: boolean }) => void }) => {
  const {
    canOpenSurvey: canOpenDismissFreeTrialSurvey,
    openPopover: openDismissFreeTrialSurveyPopover,
    openModal: openDismissFreeTrialSurveyModal,
    onOpen: onOpenDismissFreeTrialSurvey,
    onClose: onCloseDismissFreeTrialSurvey,
  } = useOpenDismissFreeTrialSurvey();
  const { isVariantModal, isVariantPopover } = useGetDismissFreeTrialSurveyFlag();

  const onCloseTrialModal = ({ skip }: { skip: boolean }) => {
    if (!canOpenDismissFreeTrialSurvey) {
      onClose({ skip });
      return;
    }

    if (isVariantPopover) {
      onClose({ skip });
      onOpenDismissFreeTrialSurvey();
      return;
    }

    if (isVariantModal) {
      onOpenDismissFreeTrialSurvey();
    }
  };

  const onCloseDismissFreeTrialSurveyVariantModal = ({ skip }: { skip: boolean }) => {
    onClose({ skip });
    onCloseDismissFreeTrialSurvey();
  };

  return {
    onCloseTrialModal,
    openDismissFreeTrialSurveyModal,
    openDismissFreeTrialSurveyPopover,
    onCloseDismissFreeTrialSurvey,
    onCloseDismissFreeTrialSurveyVariantModal,
  };
};

export default useHandleStartTrialModalWrapper;
