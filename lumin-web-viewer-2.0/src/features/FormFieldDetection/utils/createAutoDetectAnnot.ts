import { ToolName } from 'core/type';

import core from 'core';
import { store } from 'store';

import onLocationSelected from 'event-listeners/onLocationSelected';

import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';
import logger from 'helpers/logger';
import { getParsedToolStyles } from 'helpers/setDefaultToolStyles';

import { getToolStyles } from 'features/Annotation/utils/getToolStyles';
import { IconStampCreateTool } from 'features/CustomRubberStamp/tool/IconStampCreateTool';

import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';
import { TOOLS_NAME } from 'constants/toolsName';

import { FormFieldDetection } from '../constants/detectionField.constant';
import { useAutoDetectionStore } from '../hooks/useAutoDetectionStore';

type AddAnnotationResult = {
  annotation: Core.Annotations.Annotation | null;
  field?: Core.Annotations.Forms.Field;
};

export const handleAddCheckBoxAnnotation = async (): Promise<AddAnnotationResult> => {
  const tool = core.getTool(TOOLS_NAME.TICK_STAMP) as IconStampCreateTool;
  const checkboxAnnot = new window.Core.Annotations.StampAnnotation({
    Subject: AnnotationSubjectMapping.tickStamp,
    ToolName: TOOLS_NAME.TICK_STAMP,
  });
  await tool.setAnnotImageData(checkboxAnnot);
  return {
    annotation: checkboxAnnot,
  };
};

export const handleAddTextAnnotation = (): Promise<AddAnnotationResult> => {
  const toolStyles = getToolStyles(TOOLS_NAME.FREETEXT);
  const parsedToolStyles = toolStyles ? getParsedToolStyles(toolStyles) : null;
  const textboxAnnot = new window.Core.Annotations.FreeTextAnnotation(
    window.Core.Annotations.FreeTextAnnotation.Intent.FreeText,
    parsedToolStyles
  );
  textboxAnnot.setContents('');
  return Promise.resolve({
    annotation: textboxAnnot,
  });
};

// eslint-disable-next-line arrow-body-style
export const handleAddSignatureAnnotation = async (
  annotation: DetectedFieldPlaceholder
): Promise<AddAnnotationResult> => {
  const signatureTool = core.getTool(TOOLS_NAME.SIGNATURE as ToolName) as Core.Tools.SignatureCreateTool & {
    location: Core.Tools.PageCoordinate;
  };
  signatureTool.location = {
    pageNumber: annotation.PageNumber,
    x: annotation.X + annotation.Width / 2,
    y: annotation.Y + annotation.Height / 2,
  };
  try {
    await onLocationSelected(store)(signatureTool.location);
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
      message: 'Error in trigger show signature popup',
      error: error as Error,
    });
  }

  useAutoDetectionStore.getState().setAutoDetectAnnotationId({ annotationId: annotation.CustomFieldId });
  return Promise.resolve({
    annotation: null,
  });
};

export const handleAddAnnotation = async (annotation: DetectedFieldPlaceholder) => {
  let detectedFieldData: AddAnnotationResult | null = null;
  switch (annotation.CustomFieldType) {
    case FormFieldDetection.CHECK_BOX:
      detectedFieldData = await handleAddCheckBoxAnnotation();
      break;
    case FormFieldDetection.TEXT_BOX:
      detectedFieldData = await handleAddTextAnnotation();
      break;
    case FormFieldDetection.SIGNATURE:
      detectedFieldData = await handleAddSignatureAnnotation(annotation);
      break;
    default:
      break;
  }

  return detectedFieldData;
};
