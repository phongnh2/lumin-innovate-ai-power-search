import { AWS_EVENTS } from 'constants/awsEvents';

import { EventCollection } from './EventCollection';

export class FormFieldDetectionEventCollection extends EventCollection {
  surveyResponse(attributes: { answer: number; feedback: string }) {
    const scoreMapping = ['veryDissatisfied', 'dissatisfied', 'neutral', 'satisfied', 'verySatisfied'];
    return this.record({
      name: AWS_EVENTS.FORM_FIELD_DETECTION.SURVEY_RESPONSE,
      attributes: {
        survey: 'formBuilderExperience',
        answer: scoreMapping[attributes.answer - 1],
        feedback: attributes.feedback,
      },
    });
  }
}
export default new FormFieldDetectionEventCollection();
