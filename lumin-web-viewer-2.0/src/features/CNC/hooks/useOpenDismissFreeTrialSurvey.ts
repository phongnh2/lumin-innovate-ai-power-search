import { useState } from 'react';

import { useGetDismissFreeTrialSurveyFlag } from './useGetDismissFreeTrialSurveyFlag';
import useGetHasShownDismissFreeTrialSurvey from '../CncComponents/DismissFreeTrialSurvey/hooks/useGetHasShownDismissFreeTrialSurvey';

const useOpenDismissFreeTrialSurvey = () => {
  const [open, setOpen] = useState(false);
  const { canShowSurvey, isVariantModal, isVariantPopover } = useGetDismissFreeTrialSurveyFlag();
  const { hasShownDismissFreeTrialSurvey } = useGetHasShownDismissFreeTrialSurvey();
  const canOpenSurvey = canShowSurvey && !hasShownDismissFreeTrialSurvey;

  const onOpen = () => setOpen(true);

  const onClose = () => setOpen(false);

  return {
    canOpenSurvey,
    openModal: open && canOpenSurvey && isVariantModal,
    openPopover: open && canOpenSurvey && isVariantPopover,
    onOpen,
    onClose,
  };
};

export { useOpenDismissFreeTrialSurvey };
