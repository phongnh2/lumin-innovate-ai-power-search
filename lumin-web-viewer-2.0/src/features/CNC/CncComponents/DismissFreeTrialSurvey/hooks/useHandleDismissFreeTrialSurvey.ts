import { find, findIndex, lowerCase } from 'lodash';
import { useEffect, useState } from 'react';

import toastUtils from '@new-ui/utils/toastUtils';

import { SurveyName } from 'features/CNC/constants/events/common';
import {
  VARIANT_DISMISS_FREE_TRIAL_SURVEY,
  useGetDismissFreeTrialSurveyFlag,
} from 'features/CNC/hooks/useGetDismissFreeTrialSurveyFlag';

import useGetDismissReasonList from './useGetDismissReasonList';
import useGetHasShownDismissFreeTrialSurvey from './useGetHasShownDismissFreeTrialSurvey';
import useTrackEventDismissFreeTrialSurvey from './useTrackEventDismissFreeTrialSurvey';

type Params = {
  onClose: () => void;
};

const useHandleDismissFreeTrialSurvey = ({ onClose }: Params) => {
  const [itemChecked, setItemChecked] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const { setOrgHasShownDismissFreeTrialSurvey } = useGetHasShownDismissFreeTrialSurvey();
  const { isVariantModal } = useGetDismissFreeTrialSurveyFlag();

  const dismissReasonList = useGetDismissReasonList();
  const { trackModalViewed, trackModalConfirmation, trackModalDismiss, trackDismissReason } =
    useTrackEventDismissFreeTrialSurvey();

  const onCheckRadio = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setItemChecked(value);
  };

  const onChangeTextarea = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(event.target.value);
  };

  const showToastSucces = () => {
    toastUtils.success({
      title: 'Feedback is submitted',
      message: 'We appreciate your feedback.',
    });
  };

  const onCloseModal = () => {
    onClose();
    setOrgHasShownDismissFreeTrialSurvey();
    trackModalDismiss().catch(() => {});
  };

  const onSubmit = () => {
    const attributes = {
      survey: SurveyName.DISMISS_FREE_TRIAL_MODAL,
      answer: find(dismissReasonList, { value: itemChecked }).label,
      answerPosition: findIndex(dismissReasonList, { value: itemChecked }) + 1,
      feedback: textareaValue,
      surveyPlacementType: isVariantModal
        ? lowerCase(VARIANT_DISMISS_FREE_TRIAL_SURVEY.MODAL)
        : lowerCase(VARIANT_DISMISS_FREE_TRIAL_SURVEY.POPOVER),
    };

    onClose();
    showToastSucces();
    setOrgHasShownDismissFreeTrialSurvey();
    trackDismissReason(attributes);
    trackModalConfirmation().catch(() => {});
  };

  useEffect(() => {
    trackModalViewed();
  }, []);

  return {
    dismissReasonList,
    itemChecked,
    onCheckRadio,
    textareaValue,
    onChangeTextarea,
    onSubmit,
    onCloseModal,
  };
};

export default useHandleDismissFreeTrialSurvey;
