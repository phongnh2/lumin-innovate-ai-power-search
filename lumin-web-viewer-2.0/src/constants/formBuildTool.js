import { CUSTOM_FONTS_V2 } from '@new-ui/general-components/TextStylePalette/constants';

import core from 'core';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import toolsName from 'constants/toolsName';

export function getLastIndexByFormType({ annotation, formType }) {
  /*
    WebViewer UI create temporary Rectangle annotations
    Then converting them to actual widget when you apply fields ( exit the form editing tab )
    You can get index from other temp annotation and exist annotation

   Get all the same FORM_TYPE annotation including applied and unapplied */

  const annotationManager = core.getAnnotationManager();
  const annotationList = annotationManager.getAnnotationsList();
  // eslint-disable-next-line no-use-before-define
  const extractTextFromFieldNameReg = new RegExp(`${getFieldNameMapping(formType).CUSTOM_NAME}|${formType}`, 'g');

  const isNotTargetAnnotation = (annot) =>
    !annotation || annot.fieldName !== annotation.fieldName;

  const formBuildAnnotationList = annotationList.filter(
    (annot) =>
      isNotTargetAnnotation(annot) &&
      annot.getCustomData('trn-form-field-type') &&
      annot.fieldName
  );

  /** Get all the index number of the same FORM_TYPE annotations including applied and unapplied  */
  /** Filter NaN values that are unsatisfying Regex */
  const fieldNameIndexArrByFormType = formBuildAnnotationList
    .map((annot) => parseInt(annot.fieldName.replace(extractTextFromFieldNameReg, '')))
    .filter(Boolean);

  return Math.max(0, ...fieldNameIndexArrByFormType);
}

export const FORM_FIELD_TYPE = {
  TEXT: 'TextFormField',
  CHECKBOX: 'CheckBoxFormField',
  RADIO: 'RadioButtonFormField',
  SIGNATURE: 'SignatureFormField',
  COMBO_BOX: 'ComboBoxFormField',
  LIST_BOX: 'ListBoxFormField',
};

export const WIDGET_TYPE = {
  TEXT: 'Tx',
  BUTTON: 'Btn',
  SIGNATURE: 'Sig',
};

export const CUSTOM_FONTS = CUSTOM_FONTS_V2.map((font) => ({
  value: font.value,
  name: font.label,
}));

export const FORM_BUILD_TABS = [
  {
    id: FORM_FIELD_TYPE.TEXT,
    label: 'viewer.formBuildPanel.textField',
    icon: 'form-build-text',
    tooltipLabel: 'viewer.formBuildPanel.addTextField',
    toolName: toolsName.TEXT_FIELD,
    'data-lumin-btn-name': ButtonName.FORM_BUILDER_TEXT_FIELD,
    'data-lumin-btn-purpose': ButtonPurpose[ButtonName.FORM_BUILDER_TEXT_FIELD],

    // NOTE: for new layout
    newIcon: 'md_text_box',
  },
  {
    id: FORM_FIELD_TYPE.CHECKBOX,
    label: 'viewer.formBuildPanel.checkbox',
    icon: 'form-build-checkbox',
    tooltipLabel: 'viewer.formBuildPanel.addCheckbox',
    toolName: toolsName.CHECK_BOX,
    'data-lumin-btn-name': ButtonName.FORM_BUILDER_CHECKBOX,
    'data-lumin-btn-purpose': ButtonPurpose[ButtonName.FORM_BUILDER_CHECKBOX],

    // NOTE: for new layout
    newIcon: 'md_checkbox',
  },
  {
    id: FORM_FIELD_TYPE.RADIO,
    label: 'viewer.formBuildPanel.radioButton',
    icon: 'form-build-radio',
    tooltipLabel: 'viewer.formBuildPanel.addRadioButton',
    toolName: toolsName.RADIO,
    'data-lumin-btn-name': ButtonName.FORM_BUILDER_RADIO_BUTTON,
    'data-lumin-btn-purpose': ButtonPurpose[ButtonName.FORM_BUILDER_RADIO_BUTTON],

    // NOTE: for new layout
    newIcon: 'md_radio_box',
  },
  {
    id: FORM_FIELD_TYPE.SIGNATURE,
    label: 'viewer.formBuildPanel.signatureButton',
    icon: 'tool-signature',
    tooltipLabel: 'viewer.formBuildPanel.addSignatureField',
    toolName: toolsName.SIGNATURE_FIELD,
    'data-lumin-btn-name': ButtonName.FORM_BUILDER_SIGNATURE_FIELD,
    'data-lumin-btn-purpose': ButtonPurpose[ButtonName.FORM_BUILDER_SIGNATURE_FIELD],

    // NOTE: for new layout
    newIcon: 'md_signature',
  },
];

export const FORM_BUILD_LABEL_MAPPING = {
  [FORM_FIELD_TYPE.TEXT]: {
    label: 'viewer.formBuildPanel.textField',
    icon: 'form-build-text',
    // NOTE: for new layout
    newIcon: 'md_text_box',
  },
  [FORM_FIELD_TYPE.CHECKBOX]: {
    label: 'viewer.formBuildPanel.checkbox',
    icon: 'form-build-checkbox',

    // NOTE: for new layout
    newIcon: 'md_checkbox',
  },
  [FORM_FIELD_TYPE.RADIO]: {
    label: 'viewer.formBuildPanel.radioButton',
    icon: 'form-build-radio',
    // NOTE: for new layout
    newIcon: 'md_radio_box',
  },
  [FORM_FIELD_TYPE.SIGNATURE]: {
    label: 'viewer.formBuildPanel.signatureButton',
    icon: 'tool-signature',
    // NOTE: for new layout
    newIcon: 'md_signature',
  },
};

export const getFieldNameMapping = (type) =>
  ({
    [FORM_FIELD_TYPE.TEXT]: {
      CUSTOM_NAME: 'Text',
      TYPE: WIDGET_TYPE.TEXT,
      GET_INDEX: (lastIndex) => lastIndex + 1,
      DEFAULT_HEIGHT: 18,
      DEFAULT_WIDTH: 150,
      ANNOTATION: (field, option) => new window.Core.Annotations.TextWidgetAnnotation(field, option),
      DEFAULT_VALUE: '',
      OPTION: {},
    },
    [FORM_FIELD_TYPE.CHECKBOX]: {
      CUSTOM_NAME: 'Checkbox',
      TYPE: WIDGET_TYPE.BUTTON,
      GET_INDEX: (lastIndex) => lastIndex + 1,
      DEFAULT_HEIGHT: 18,
      DEFAULT_WIDTH: 18,
      ANNOTATION: (field, option) => new window.Core.Annotations.CheckButtonWidgetAnnotation(field, option),
      DEFAULT_VALUE: 'Off',
      OPTION: {
        appearance: 'Off',
        appearances: {
          Off: {},
          Yes: {},
        },
        captions: {
          Normal: '', // Check
        },
      },
    },
    [FORM_FIELD_TYPE.RADIO]: {
      CUSTOM_NAME: 'Radio',
      TYPE: WIDGET_TYPE.BUTTON,
      GET_INDEX: (lastIndex) => lastIndex,
      DEFAULT_HEIGHT: 18,
      DEFAULT_WIDTH: 18,
      ANNOTATION: (field, option) => new window.Core.Annotations.RadioButtonWidgetAnnotation(field, option),
      DEFAULT_VALUE: 'Off',
      OPTION: {
        appearance: 'Off',
        appearances: {
          Off: {},
          Yes: {},
        },
      },
    },
    [FORM_FIELD_TYPE.SIGNATURE]: {
      CUSTOM_NAME: 'Signature',
      TYPE: WIDGET_TYPE.SIGNATURE,
      GET_INDEX: (lastIndex) => lastIndex + 1,
      DEFAULT_HEIGHT: 32,
      DEFAULT_WIDTH: 90,
      ANNOTATION: (field, option) => new window.Core.Annotations.SignatureWidgetAnnotation(field, option),
      DEFAULT_VALUE: '',
      OPTION: {},
    },
  }[type]);

export const STYLE_DEBOUNCE_TIME = 500;

export const ANNOTATION_DRAWN_DEBOUNCE_TIME = 100;

export const MIN_WIDTH_HEIGHT = 7;

export const SIGNATURE_MIN_WIDTH = 50;

export const SIGNATURE_MIN_HEIGHT = 16;

export const MIN_FONT_SIZE = 5;

export const MAX_FONT_SIZE = 45;

export const INPUT_DEBOUNCE_TIME = 700;

export const regexInputNumber = /^\d+$/;

export const MIN_THICKNESS = 0.1;

export const MAX_THICKNESS = 20;

export const IS_CHECKED = 'isChecked';

export const TRN_FORM_FIELD_TYPE = 'trn-form-field-type';

export const TRN_EDITING_RECTANGLE_ID = 'trn-editing-rectangle-id';

export const SIZE_AND_POSITION = 'sizeAndPosition';

export const AI_AUTO_ADDED = 'aiAutoAdded';

export const NEW_FORM_FIELD_IN_SESSION = 'newFormFieldInSession';

export const FIELD_ID = 'fieldId';

export const FIELD_SESSION_ID = 'fieldSessionId';

export const TRN_ANNOT_LISTABLE = 'trn-annot-listable';

export const CHECKBOX_DEFAULT_VALUE = 'checkboxDefaultValue';

export const MAINTAIN_ASPECT_RATIO = 'trn-annot-maintain-aspect-ratio';

export const EVENT_TRACKING_NAME = {
  [FORM_FIELD_TYPE.TEXT]: 'text',
  [FORM_FIELD_TYPE.CHECKBOX]: 'checkBox',
  [FORM_FIELD_TYPE.RADIO]: 'radioButton',
  [FORM_FIELD_TYPE.SIGNATURE]: 'signature',
  [FORM_FIELD_TYPE.LIST_BOX]: 'listBox',
  [FORM_FIELD_TYPE.COMBO_BOX]: 'comboBox',
};

export const CURSOR_MARGIN = 2;

export const DEFAULT_FONT_SIZE = '12pt';

export const MAX_INPUT_FORM_FIELD_NAME_LENGTH = 1024;

export const FIELD_VALUE_MAX_LENGTH = 10000;

export const EventTrackingType = {
  TEXT: 'text',
  CHECK_BOX: 'checkBox',
  SIGNATURE: 'signature',
  RADIO_BUTTON: 'radioButton',
  LIST_BOX: 'listBox',
  COMBO_BOX: 'comboBox',
};
