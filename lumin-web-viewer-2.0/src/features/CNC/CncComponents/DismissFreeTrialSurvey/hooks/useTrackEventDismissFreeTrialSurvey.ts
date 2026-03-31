import { useTrackingModalEvent } from 'hooks';

import { hotjarUtils } from 'utils';

import { CNCModalName, CNCModalPurpose } from 'features/CNC/constants/events/modal';
import CommonEventTracking from 'features/CNC/tracking/event';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';

type TrackDismissReasonAttrs = {
  survey: string;
  answer: string;
  answerPosition: number;
  feedback: string;
  surveyPlacementType: string;
};

const useTrackEventDismissFreeTrialSurvey = () => {
  const {
    trackModalViewed: _trackModalViewed,
    trackModalConfirmation,
    trackModalDismiss,
  } = useTrackingModalEvent({
    modalName: CNCModalName.DISMISS_FREE_TRIAL_SURVEY,
    modalPurpose: CNCModalPurpose[CNCModalName.DISMISS_FREE_TRIAL_SURVEY],
  });

  const trackModalViewed = () => {
    _trackModalViewed().catch(() => {});
    hotjarUtils.trackEvent(HOTJAR_EVENT.DISMISS_FREE_TRIAL_SURVEY);
  };

  const trackDismissReason = (attributes: TrackDismissReasonAttrs) => {
    CommonEventTracking.surveyResponse(attributes).catch(() => {});
  };

  return {
    trackModalViewed,
    trackModalConfirmation,
    trackModalDismiss,
    trackDismissReason,
  };
};

export default useTrackEventDismissFreeTrialSurvey;
