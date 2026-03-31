import { hotjarUtils } from 'utils';

import CommonEventTracking from 'features/CNC/tracking/event';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';

import { USING_TOOLS } from '../constant';

type TrackCancelWithFollowUpQuestionAttrs = {
  survey: string;
  pdfUsageFrequency: string;
  answer: string;
  feedback?: string;
  usingTools?: USING_TOOLS[];
  suggestedPrice?: number;
};

const useTrackEventCancelWithFollowUpQuestion = () => {
  const trackPageViewed = () => {
    hotjarUtils.trackEvent(HOTJAR_EVENT.CANCEL_SUBSCRIPTION_WITH_FOLLOW_UP_QUESTION);
  };

  const trackCancelWithFollowUpQuestion = (attributes: TrackCancelWithFollowUpQuestionAttrs) => {
    CommonEventTracking.surveyResponseWithFollowUpQuestion(attributes).catch(() => {});
  };

  return {
    trackPageViewed,
    trackCancelWithFollowUpQuestion,
  };
};

export default useTrackEventCancelWithFollowUpQuestion;
