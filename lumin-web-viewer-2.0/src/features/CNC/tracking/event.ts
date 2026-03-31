import { EventCollection } from 'utils/Factory/EventCollection/EventCollection';

import { CNCCommonEvent } from '../constants/events/common';
import { USING_TOOLS } from '../screens/SurveySubscription/constant';

export interface CTADecisionPayload {
  slotId: string;
  triggerEvent: string;
  action: string;
}

export interface SurveyResponsePayload {
  survey: string;
  answer: string;
  answerPosition?: number;
  feedback?: string;
  surveyPlacementType?: string;
}

export interface SurveyFollowUpQuestionResponsePayload {
  survey: string;
  pdfUsageFrequency: string;
  answer: string;
  feedback?: string;
  usingTools?: USING_TOOLS[];
  suggestedPrice?: number;
}

type EventPayloadMap = {
  [CNCCommonEvent.CTA_DECISION]: CTADecisionPayload;
  [CNCCommonEvent.SURVEY_RESPONSE]: SurveyResponsePayload;
  [CNCCommonEvent.SURVEY_FOLLOW_UP_QUESTION_RESPONSE]: SurveyFollowUpQuestionResponsePayload;
};

class CommonEvent extends EventCollection {
  private emit<E extends keyof EventPayloadMap>(name: E, attributes: EventPayloadMap[E]) {
    return this.record({ name, attributes });
  }

  CTADecision(payload: CTADecisionPayload) {
    return this.emit(CNCCommonEvent.CTA_DECISION, payload);
  }

  surveyResponse(payload: SurveyResponsePayload) {
    return this.emit(CNCCommonEvent.SURVEY_RESPONSE, payload);
  }

  surveyResponseWithFollowUpQuestion(payload: SurveyFollowUpQuestionResponsePayload) {
    return this.emit(CNCCommonEvent.SURVEY_FOLLOW_UP_QUESTION_RESPONSE, payload);
  }
}

export default new CommonEvent();
