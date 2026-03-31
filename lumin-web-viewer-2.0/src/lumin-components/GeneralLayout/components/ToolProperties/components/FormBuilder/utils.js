import isEmpty from 'lodash/isEmpty';

import core from 'core';

import { ANNOTATION_STYLE } from 'constants/documentConstants';
import { FORM_FIELD_TYPE, MIN_WIDTH_HEIGHT, SIGNATURE_MIN_HEIGHT, SIGNATURE_MIN_WIDTH } from 'constants/formBuildTool';

import { DIMENSION_TYPE } from './constants';

const FONT_SIZE_RATIO = 0.75;

export const getPageHeight = () => core.getPageHeight(core.getCurrentPage());

export const getPageWidth = () => core.getPageWidth(core.getCurrentPage());

export const validateWidth = (value, annot) => {
  const documentWidth = getPageWidth();
  const maxWidth = documentWidth - annot.X;
  if (value > maxWidth) {
    return Math.round(maxWidth);
  }
  return value;
};

export const validateHeight = (value, annot) => {
  const documentHeight = getPageHeight();
  const maxHeight = documentHeight - annot.Y;
  if (value > maxHeight) {
    return Math.round(maxHeight);
  }
  return value;
};

export const validateMinDimension = ({ value, type, dimension }) => {
  if (type === FORM_FIELD_TYPE.SIGNATURE) {
    if (dimension === DIMENSION_TYPE.HEIGHT && value <= SIGNATURE_MIN_HEIGHT) {
      return SIGNATURE_MIN_HEIGHT;
    }
    if (dimension === DIMENSION_TYPE.WIDTH && value <= SIGNATURE_MIN_WIDTH) {
      return SIGNATURE_MIN_WIDTH;
    }
  } else if (value <= MIN_WIDTH_HEIGHT) {
    return MIN_WIDTH_HEIGHT;
  }
  return value;
};

export const getFitHeightFontSize = (height) => Math.round(height * FONT_SIZE_RATIO);

export const getFontSize = ({ initialStyle, annotation, onStyleChange }) => {
  const fontSize = initialStyle.FontSize?.toString().includes('pt')
    ? initialStyle.FontSize.split('pt')[0]
    : initialStyle.FontSize;
  if (parseInt(fontSize) === 0) {
    const fitHeightSize = getFitHeightFontSize(annotation.Height);
    onStyleChange(ANNOTATION_STYLE.FONT_SIZE, `${fitHeightSize}pt`);
    return fitHeightSize;
  }
  return parseInt(fontSize);
};

export const convertFontSize = (inputValue) => Math.round(inputValue);

export const handleAddAssociatedField = (annotation) => {
  if (!(annotation instanceof window.Core.Annotations.WidgetAnnotation)) {
    return;
  }
  const annotManager = core.getAnnotationManager();
  const addedField = annotation.getField();
  const fieldManager = annotManager.getFieldManager();
  if (fieldManager.getFields().every((field) => field.name !== addedField.name)) {
    fieldManager.addField(addedField);
  }
  if (annotation instanceof window.Core.Annotations.RadioButtonWidgetAnnotation) {
    annotation.fieldFlags.set(window.Core.Annotations.WidgetFlags.NO_TOGGLE_TO_OFF, false);
    if (!addedField.widgets.length) {
      addedField.set({
        widgets: core
          .getAnnotationsList()
          .filter(
            (annot) => annot instanceof window.Core.Annotations.WidgetAnnotation && annot.fieldName === addedField.name
          ),
      });
    }
  }
  if (
    annotation instanceof window.Core.Annotations.TextWidgetAnnotation &&
    addedField.maxLen === -1 &&
    addedField.flags.get(window.Core.Annotations.WidgetFlags.COMB)
  ) {
    addedField.flags.set(window.Core.Annotations.WidgetFlags.COMB, false);
  }

  if (annotation instanceof window.Core.Annotations.CheckButtonWidgetAnnotation && isEmpty(annotation.appearances)) {
    annotation.set({
      appearances: {
        Off: {},
        Yes: {},
      },
      appearance: 'Off',
      border: {
        color: new window.Core.Annotations.Color(0, 0, 0, 0),
        style: 'solid',
        width: 1,
      },
    });
    annotation.MaintainAspectRatio = true;
  }
};
