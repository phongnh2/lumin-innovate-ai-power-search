import core from 'core';

import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';

import { AUTO_DETECT_ALLOW_FIELD_TYPES } from '../constants/detectionField.constant';
import { IAutoDetectPredictionData } from '../types/detectionField.type';

export const createDetectedFieldPlaceholders = (predictions: IAutoDetectPredictionData['predictions']) => {
  const processedPages = Object.keys(predictions || {}).map(Number);
  processedPages.forEach((pageNumber) => {
    predictions[pageNumber].forEach((prediction) => {
      const { boundingRectangle, fieldType, fieldId, isDeleted } = prediction;
      if (!AUTO_DETECT_ALLOW_FIELD_TYPES.includes(fieldType) || isDeleted) {
        return;
      }

      const { x1, y1, x2, y2 } = boundingRectangle;
      const annotation = new DetectedFieldPlaceholder();
      annotation.PageNumber = pageNumber;
      annotation.X = x1;
      annotation.Y = y1;
      annotation.Width = x2 - x1;
      annotation.Height = y2 - y1;
      annotation.CustomFieldType = fieldType;
      annotation.CustomFieldId = fieldId;
      core.getAnnotationManager().addAnnotation(annotation);
      core.getAnnotationManager().redrawAnnotation(annotation);
    });
  });
  return processedPages;
};
