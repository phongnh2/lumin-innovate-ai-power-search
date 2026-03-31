import CheckboxCursor from 'assets/lumin-svgs/checkbox_cursor.svg';

import { FormFieldDetectionType } from '../types/detectionField.type';

export const TOTAL_PAGES_LIMIT = 40;

export const FORM_FIELD_INDICATORS = [
  'agreement',
  'contract',
  'application',
  'form',
  'signature',
  'sign',
  'signed',
  'signed by',
  'guarantor',
  'signatory',
  'lease',
];

export const FORM_FIELD_INDICATORS_REGEX = new RegExp(`\\b(${FORM_FIELD_INDICATORS.join('|')})\\b`);

export const FormFieldDetection = {
  SIGNATURE: 'signature',
  TEXT_BOX: 'text_box',
  CHECK_BOX: 'check_box',
  RADIO_BOX: 'radio_box',
} as const;

export const TriggerAction = {
  AUTOMATIC: 'automatic',
  USER_INITIATED: 'user_initiated',
} as const;

export const FormFieldDetectionFeedbackUrl =
  'https://feedback.luminpdf.com/feature-requests?selectedCategory=form-field-detection';

export const FORM_FIELD_DETECTION_TIMEOUT = 1000 * 60 * 2; // 2 minutes in millisecond

export const TEXT_WIDGETS_FIELD_FLAGS = {
  IS_MULTILINE: 2 ** 12,
  IS_PASSWORD: 2 ** 13,
  IS_FILE_SELECT: 2 ** 20,
  IS_DO_NOT_SPELL_CHECK: 2 ** 22,
  IS_DO_NOT_SCROLL: 2 ** 23,
  IS_COMB: 2 ** 24,
  IS_RICH_TEXT: 2 ** 25,
};

export const CURSOR_TYPE_MAPPER: Record<string, string> = {
  [FormFieldDetection.CHECK_BOX]: `url(${CheckboxCursor}) 10 10, default`,
  [FormFieldDetection.SIGNATURE]: 'pointer',
  [FormFieldDetection.TEXT_BOX]: 'text',
};

export const AUTO_DETECT_ALLOW_FIELD_TYPES = [
  FormFieldDetection.TEXT_BOX,
  FormFieldDetection.CHECK_BOX,
  FormFieldDetection.SIGNATURE,
] as FormFieldDetectionType[];
