import { FORM_FIELD_TYPE, EventTrackingType } from 'constants/formBuildTool';
import { TOOLS_NAME } from 'constants/toolsName';

import { FormFieldDetection } from './detectionField.constant';
import { FormFieldDetectionType } from '../types/detectionField.type';

export const FORM_FIELD_DETECTION_TO_TYPE_MAPPER: Record<FormFieldDetectionType, string> = {
  [FormFieldDetection.TEXT_BOX]: FORM_FIELD_TYPE.TEXT,
  [FormFieldDetection.CHECK_BOX]: FORM_FIELD_TYPE.CHECKBOX,
  [FormFieldDetection.SIGNATURE]: FORM_FIELD_TYPE.SIGNATURE,
  [FormFieldDetection.RADIO_BOX]: FORM_FIELD_TYPE.RADIO,
};

export const TOOLS_NAME_TO_EVENT_TRACKING_NAME_MAPPER: Record<string, string> = {
  [TOOLS_NAME.TEXT_FIELD]: EventTrackingType.TEXT,
  [TOOLS_NAME.CHECK_BOX]: EventTrackingType.CHECK_BOX,
  [TOOLS_NAME.SIGNATURE_FIELD]: EventTrackingType.SIGNATURE,
  [TOOLS_NAME.RADIO]: EventTrackingType.RADIO_BUTTON,
  [TOOLS_NAME.LIST_BOX_FIELD]: EventTrackingType.LIST_BOX,
  [TOOLS_NAME.COMBO_BOX_FIELD]: EventTrackingType.COMBO_BOX,
};

export const FORM_FIELD_TYPE_TO_EVENT_TRACKING_NAME_MAPPER: Record<string, string> = {
  [FORM_FIELD_TYPE.TEXT]: EventTrackingType.TEXT,
  [FORM_FIELD_TYPE.CHECKBOX]: EventTrackingType.CHECK_BOX,
  [FORM_FIELD_TYPE.SIGNATURE]: EventTrackingType.SIGNATURE,
  [FORM_FIELD_TYPE.RADIO]: EventTrackingType.RADIO_BUTTON,
  [TOOLS_NAME.LIST_BOX_FIELD]: EventTrackingType.LIST_BOX,
  [TOOLS_NAME.COMBO_BOX_FIELD]: EventTrackingType.COMBO_BOX,
};

export const TOOLS_NAME_TO_DETECTION_TYPE_MAPPER: Record<string, FormFieldDetectionType> = {
  [TOOLS_NAME.TEXT_FIELD]: FormFieldDetection.TEXT_BOX,
  [TOOLS_NAME.CHECK_BOX]: FormFieldDetection.CHECK_BOX,
  [TOOLS_NAME.SIGNATURE_FIELD]: FormFieldDetection.SIGNATURE,
  [TOOLS_NAME.RADIO]: FormFieldDetection.RADIO_BOX,
};

export const FORM_FIELD_TYPE_TO_DETECTION_TYPE_MAPPER: Record<string, FormFieldDetectionType> = {
  [FORM_FIELD_TYPE.TEXT]: FormFieldDetection.TEXT_BOX,
  [FORM_FIELD_TYPE.CHECKBOX]: FormFieldDetection.CHECK_BOX,
  [FORM_FIELD_TYPE.SIGNATURE]: FormFieldDetection.SIGNATURE,
  [FORM_FIELD_TYPE.RADIO]: FormFieldDetection.RADIO_BOX,
};
