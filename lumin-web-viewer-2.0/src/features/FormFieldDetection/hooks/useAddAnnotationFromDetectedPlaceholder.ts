import { useWindowEvent } from '@mantine/hooks';
import { RefObject, useEffect } from 'react';

import core from 'core';

import indexedDBService from 'services/indexedDBService';

import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';
import logger from 'helpers/logger';

import { CUSTOM_DATA_AUTO_DETECTION } from 'constants/customDataConstant';
import { ANNOTATION_ACTION, AnnotationSubjectMapping } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';

import { AnnotationChangedAction } from 'interfaces/annotation/annotation.interface';

import { FormFieldDetection } from '../constants/detectionField.constant';
import { FormFieldDetectionType } from '../types/detectionField.type';
import { handleAddAnnotation } from '../utils/createAutoDetectAnnot';

export const useAddAnnotationFromDetectedPlaceholder = ({
  annotationRef,
  setAnnotation,
  documentId,
}: {
  annotationRef: RefObject<DetectedFieldPlaceholder>;
  setAnnotation: (annotation: DetectedFieldPlaceholder) => void;
  documentId: string;
}) => {
  useEffect(() => {
    const onAnnotationChanged = async (
      annotations: Core.Annotations.Annotation[],
      action: AnnotationChangedAction,
      objectInfo: Core.AnnotationManager.AnnotationChangedInfoObject
    ) => {
      try {
        if (
          annotations.length !== 1 ||
          action !== ANNOTATION_ACTION.ADD ||
          annotations[0].Subject !== AnnotationSubjectMapping.signature ||
          objectInfo.imported
        ) {
          return;
        }

        const autoDetectionAnnotationId = annotations[0].getCustomData(
          CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key
        );
        if (autoDetectionAnnotationId) {
          await indexedDBService.removeFieldsFromAutoDetectFormFields({
            documentId,
            deletedFields: [{ fieldId: autoDetectionAnnotationId, pageNumber: annotations[0].PageNumber }],
          });
          const annotManager = core.getAnnotationManager();
          const detectedFieldPlaceholderAnnotations = core.getDetectedFieldPlaceholderAnnotations();
          const associatedDetectedPlaceholder = detectedFieldPlaceholderAnnotations.find(
            (annotation) => (annotation as DetectedFieldPlaceholder).CustomFieldId === autoDetectionAnnotationId
          );
          if (associatedDetectedPlaceholder) {
            annotManager.deleteAnnotations([associatedDetectedPlaceholder]);
          }
        }
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
          message: 'Error when handle remove detected signature field',
          error: error as Error,
        });
      }
    };

    core.addEventListener('annotationChanged', onAnnotationChanged);

    return () => {
      core.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, [documentId]);

  useWindowEvent('click', async (event: PointerEvent) => {
    try {
      if (!event.isTrusted || !annotationRef.current?.CustomIsHoveringPlaceholder) {
        return;
      }

      const detectedFieldData = await handleAddAnnotation(annotationRef.current);
      if (!detectedFieldData?.annotation) {
        return;
      }

      const detectedFieldAnnotation = detectedFieldData.annotation;

      detectedFieldAnnotation.X = annotationRef.current.X;
      detectedFieldAnnotation.Y = annotationRef.current.Y;
      detectedFieldAnnotation.Width = annotationRef.current.Width;
      detectedFieldAnnotation.Height = annotationRef.current.Height;
      detectedFieldAnnotation.PageNumber = annotationRef.current.PageNumber;

      detectedFieldAnnotation.setCustomData(
        CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key,
        annotationRef.current.CustomFieldId
      );

      const annotManager = core.getAnnotationManager();
      annotManager.addAnnotation(detectedFieldAnnotation, { autoFocus: true });
      annotManager.deleteAnnotations([annotationRef.current]);
      const annotationFieldTypes: FormFieldDetectionType[] = [
        FormFieldDetection.CHECK_BOX,
        FormFieldDetection.TEXT_BOX,
      ];
      if (annotationFieldTypes.includes(annotationRef.current.CustomFieldType)) {
        annotManager.redrawAnnotation(detectedFieldAnnotation);
      }

      if (annotationRef.current.CustomFieldType === FormFieldDetection.CHECK_BOX) {
        annotManager.selectAnnotations([detectedFieldAnnotation]);
      }

      await indexedDBService.removeFieldsFromAutoDetectFormFields({
        documentId,
        deletedFields: [
          { fieldId: annotationRef.current.CustomFieldId, pageNumber: detectedFieldAnnotation.PageNumber },
        ],
      });
      setAnnotation(null);
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error in useAddAnnotationFromDetectedPlaceholder',
        error: error as Error,
      });
    }
  });
};
