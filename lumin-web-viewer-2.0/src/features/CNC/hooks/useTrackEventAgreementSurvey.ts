import { useTrackingModalEvent } from 'hooks';

import { hotjarUtils } from 'utils';

import { SurveyName } from 'features/CNC/constants/events/common';
import { CNCModalName, CNCModalPurpose } from 'features/CNC/constants/events/modal';
import CommonEventTracking from 'features/CNC/tracking/event';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';

const useTrackEventAgreementSurvey = () => {
  const { trackModalViewed: _trackModalViewed, trackModalDismiss } = useTrackingModalEvent({
    modalName: CNCModalName.WORK_WITH_AGREEMENTS_SURVEY_POPOVER,
    modalPurpose: CNCModalPurpose[CNCModalName.WORK_WITH_AGREEMENTS_SURVEY_POPOVER],
  });

  const trackModalViewed = () => {
    _trackModalViewed().catch(() => {});
    hotjarUtils.trackEvent(HOTJAR_EVENT.WORK_WITH_AGREEMENTS_SURVEY_POPOVER);
  };

  const trackSurveyResponse = (answer: string) => {
    const attributes = {
      survey: SurveyName.WORK_WITH_AGREEMENTS,
      answer,
    };
    CommonEventTracking.surveyResponse(attributes).catch(() => {});
  };

  return {
    trackModalViewed,
    trackModalDismiss,
    trackSurveyResponse,
  };
};

export { useTrackEventAgreementSurvey };
