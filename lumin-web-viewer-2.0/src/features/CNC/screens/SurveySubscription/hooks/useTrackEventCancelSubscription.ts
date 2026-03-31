import { hotjarUtils } from 'utils';

import CommonEventTracking from 'features/CNC/tracking/event';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';

type TrackCancelReasonAttrs = {
  survey: string;
  answer: string;
  answerPosition: number;
  feedback: string;
};

const useTrackEventCancelSubscription = () => {
  const trackPageViewed = () => {
    hotjarUtils.trackEvent(HOTJAR_EVENT.CANCEL_SUBSCRIPTION);
  };

  const trackCancelReason = (attributes: TrackCancelReasonAttrs) => {
    CommonEventTracking.surveyResponse(attributes).catch(() => {});
  };

  return {
    trackPageViewed,
    trackCancelReason,
  };
};

export default useTrackEventCancelSubscription;
