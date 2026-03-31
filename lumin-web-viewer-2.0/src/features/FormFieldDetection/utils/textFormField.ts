import { getFitHeightFontSize } from '@new-ui/components/ToolProperties/components/FormBuilder/utils';
import { ToolName } from 'core/type';

import core from 'core';

import { TOOLS_NAME } from 'constants/toolsName';

import { FormFieldDetection, TEXT_WIDGETS_FIELD_FLAGS } from '../constants/detectionField.constant';
import { IFormFieldDetectionPrediction } from '../types/detectionField.type';

const isMultilineField = (fieldFlags: number | undefined): boolean => {
  if (!fieldFlags) {
    return false;
  }

  // eslint-disable-next-line no-bitwise
  return (fieldFlags & TEXT_WIDGETS_FIELD_FLAGS.IS_MULTILINE) === TEXT_WIDGETS_FIELD_FLAGS.IS_MULTILINE;
};

const getToolFontSize = (): number => {
  const tool = core.getTool(TOOLS_NAME.TEXT_FIELD as ToolName) as Core.Tools.TextFormFieldCreateTool;
  const toolStyles = tool.defaults as unknown as { FontSize?: string };
  const { FontSize: fontSizeValue } = toolStyles || {};

  if (!fontSizeValue) {
    return 0;
  }

  const rawFontSize = fontSizeValue.toString();
  const fontSize = rawFontSize.includes('pt') ? rawFontSize.split('pt')[0] : rawFontSize;
  return Number.isFinite(Number(fontSize)) ? Number(fontSize) : 0;
};

const calculateFontSize = (
  boundingRectangle: IFormFieldDetectionPrediction['boundingRectangle'],
  toolFontSize: number
): number => {
  const fitHeightFontSize = getFitHeightFontSize(boundingRectangle.y2 - boundingRectangle.y1);

  if (toolFontSize <= 0) {
    return fitHeightFontSize;
  }

  return Math.min(toolFontSize, fitHeightFontSize);
};

export const getTextFormFieldProperties = (prediction: IFormFieldDetectionPrediction) => {
  const { fieldFlags, fieldType, boundingRectangle } = prediction;

  if (fieldType !== FormFieldDetection.TEXT_BOX) {
    return {
      isMultiline: false,
      fontSize: 0,
    };
  }

  const isMultiline = isMultilineField(fieldFlags);
  const fontSize = calculateFontSize(boundingRectangle, getToolFontSize());

  return {
    isMultiline,
    fontSize,
  };
};
