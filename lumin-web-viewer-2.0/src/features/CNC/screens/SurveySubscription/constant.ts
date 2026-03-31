export enum PDF_USAGE_FREQUENCY {
  Daily = 'surveySubscription.frequency.daily',
  Weekly = 'surveySubscription.frequency.weekly',
  Monthly = 'surveySubscription.frequency.monthly',
  Quarterly = 'surveySubscription.frequency.quarterly',
  JustOnce = 'surveySubscription.frequency.justOnce',
  Other = 'surveySubscription.frequency.other',
}

export enum FOLLOW_UP_QUESTIONS_ID {
  TOO_EXPENSIVE = 'Too_expensive',
  NEED_MORE_FEATURES = 'Need_more_features',
  FOUND_ALTERNATIVE = 'Found_alternative',
  NO_LONGER_NEEDED = 'No_longer_needed',
  BAD_CUSTOMER_SERVICE = 'Bad_customer_service',
  LOW_QUALITY = 'Low_quality',
  OTHER = 'Other',
}

export enum USING_TOOLS {
  Edit_PDF = 'annotation.contentEdit',
  Add_form_field = 'surveySubscription.formField',
  Signature = 'annotation.signature',
  Security = 'common.security',
  Type_tool = 'surveySubscription.typeTool',
  Shape_tool = 'documentPage.shape',
}

export interface FollowUpQuestionItem {
  value: FOLLOW_UP_QUESTIONS_ID;
  label: string;
  subQuestion: string;
  followUpDescription: string;
}

export const FOLLOW_UP_QUESTIONS = [
  {
    value: FOLLOW_UP_QUESTIONS_ID.TOO_EXPENSIVE,
    label: 'surveySubscription.followUpQuestionOptions.tooExpensive.reason',
    subQuestion: 'surveySubscription.followUpQuestionOptions.tooExpensive.followUpQuestion',
    followUpDescription: 'surveySubscription.followUpQuestionOptions.tooExpensive.followUpDescription',
  },
  {
    value: FOLLOW_UP_QUESTIONS_ID.NEED_MORE_FEATURES,
    label: 'surveySubscription.followUpQuestionOptions.needMoreFeatures.reason',
    subQuestion: 'surveySubscription.followUpQuestionOptions.needMoreFeatures.followUpQuestion',
    followUpDescription: 'surveySubscription.followUpQuestionOptions.needMoreFeatures.followUpDescription',
  },
  {
    value: FOLLOW_UP_QUESTIONS_ID.FOUND_ALTERNATIVE,
    label: 'surveySubscription.followUpQuestionOptions.foundAlternative.reason',
    subQuestion: 'surveySubscription.followUpQuestionOptions.foundAlternative.followUpQuestion',
    followUpDescription: 'surveySubscription.followUpQuestionOptions.foundAlternative.followUpDescription',
  },
  {
    value: FOLLOW_UP_QUESTIONS_ID.NO_LONGER_NEEDED,
    label: 'surveySubscription.followUpQuestionOptions.noLongerNeeded.reason',
    subQuestion: 'surveySubscription.followUpQuestionOptions.noLongerNeeded.followUpQuestion',
    followUpDescription: 'surveySubscription.followUpQuestionOptions.noLongerNeeded.followUpDescription',
  },
  {
    value: FOLLOW_UP_QUESTIONS_ID.BAD_CUSTOMER_SERVICE,
    label: 'surveySubscription.followUpQuestionOptions.badCustomerService.reason',
    subQuestion: 'surveySubscription.followUpQuestionOptions.badCustomerService.followUpQuestion',
    followUpDescription: 'surveySubscription.followUpQuestionOptions.badCustomerService.followUpDescription',
  },
  {
    value: FOLLOW_UP_QUESTIONS_ID.LOW_QUALITY,
    label: 'surveySubscription.followUpQuestionOptions.lowQuality.reason',
    subQuestion: 'surveySubscription.followUpQuestionOptions.lowQuality.followUpQuestion',
    followUpDescription: 'surveySubscription.followUpQuestionOptions.lowQuality.followUpDescription',
  },
  {
    value: FOLLOW_UP_QUESTIONS_ID.OTHER,
    label: 'surveySubscription.followUpQuestionOptions.other.reason',
    subQuestion: 'surveySubscription.followUpQuestionOptions.other.followUpQuestion',
    followUpDescription: 'surveySubscription.followUpQuestionOptions.other.followUpDescription',
  },
];
