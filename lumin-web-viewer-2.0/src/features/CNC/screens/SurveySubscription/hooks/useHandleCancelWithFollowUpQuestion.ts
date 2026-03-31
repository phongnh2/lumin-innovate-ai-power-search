import { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import selectors from 'selectors';

import { SurveyName } from 'features/CNC/constants/events/common';

import { ORG_TEXT } from 'constants/organizationConstants';

import { IOrganization } from 'interfaces/organization/organization.interface';

import useTrackEventCancelWithFollowUpQuestion from './useTrackEventCancelWithFollowUpQuestion';
import { FOLLOW_UP_QUESTIONS_ID, FollowUpQuestionItem, USING_TOOLS } from '../constant';

const useHandleCancelWithFollowUpQuestion = () => {
  const [pdfUsageFrequency, setPdfUsageFrequency] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<FollowUpQuestionItem | null>(null);
  const [feedback, setFeedback] = useState('');
  const [usingTools, setUsingTools] = useState<USING_TOOLS[]>([]);
  const [sliderValue, setSliderValue] = useState<number | null>(null);
  const { search } = useLocation();

  useEffect(() => {
    setUsingTools([]);
    if (followUpQuestion?.value === FOLLOW_UP_QUESTIONS_ID.TOO_EXPENSIVE) {
      setSliderValue(0.5);
    }
  }, [followUpQuestion?.value]);

  const { data: currentOrganization } = useSelector<unknown, { data: IOrganization }>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const navigate = useNavigate();

  const { trackPageViewed, trackCancelWithFollowUpQuestion } = useTrackEventCancelWithFollowUpQuestion();

  const onSubmit = () => {
    const attributes = {
      survey: SurveyName.CANCEL_SUBSCRIPTION_WITH_FOLLOW_UP_QUESTION,
      pdfUsageFrequency,
      answer: followUpQuestion.value,
      feedback,
      usingTools,
      suggestedPrice: sliderValue,
    };
    trackCancelWithFollowUpQuestion(attributes);
    navigate(`/${ORG_TEXT}/${currentOrganization.url}/subscription/cancel${search}`, { replace: true });
  };

  return {
    pdfUsageFrequency,
    setPdfUsageFrequency,
    followUpQuestion,
    setFollowUpQuestion,
    feedback,
    setFeedback,
    usingTools,
    setUsingTools,
    setSliderValue,
    onSubmitWithFollowUpQuestion: onSubmit,
    trackPageFollowUpQuestionViewed: trackPageViewed,
  };
};

export default useHandleCancelWithFollowUpQuestion;
