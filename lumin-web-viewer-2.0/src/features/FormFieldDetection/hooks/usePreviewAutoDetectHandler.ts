import rafSchd from 'raf-schd';
import { useEffect, useState } from 'react';

import core from 'core';

import { useLatestRef } from 'hooks/useLatestRef';

import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';

import { CUSTOM_ANNOTATION } from 'constants/documentConstants';

import { useAddAnnotationFromDetectedPlaceholder } from './useAddAnnotationFromDetectedPlaceholder';
import { CURSOR_TYPE_MAPPER } from '../constants/detectionField.constant';

export const usePreviewAutoDetectHandler = ({
  canUseAutoDetectFormFields,
  documentId,
}: {
  canUseAutoDetectFormFields: boolean;
  documentId: string;
}) => {
  const [annotation, setAnnotation] = useState<DetectedFieldPlaceholder>(null);
  const annotationRef = useLatestRef(annotation);
  const canUseAutoDetectFormFieldsRef = useLatestRef(canUseAutoDetectFormFields);

  const changeCursor = (cursorType: string) => {
    const viewerElement = core.docViewer.getViewerElement();
    if (!viewerElement || !cursorType) {
      return;
    }

    (viewerElement as HTMLElement).style.cursor = cursorType;
  };

  useAddAnnotationFromDetectedPlaceholder({ annotationRef, setAnnotation, documentId });

  useEffect(() => {
    const onMouseMove = (element: MouseEvent) => {
      const viewElement = core.getViewerElement();
      const annotationByMouse = core
        .getAnnotationManager()
        .getAnnotationByMouseEvent(element) as DetectedFieldPlaceholder;
      if (
        !canUseAutoDetectFormFieldsRef.current ||
        !annotationByMouse ||
        !(annotationByMouse instanceof window.Core.Annotations.CustomAnnotation) ||
        annotationByMouse.Subject !== CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject ||
        !viewElement.contains(element.target as Node)
      ) {
        if (annotationRef.current) {
          annotationRef.current.CustomIsHoveringPlaceholder = false;
          core.getAnnotationManager().redrawAnnotation(annotationRef.current);
          setAnnotation(null);
        }

        return;
      }

      if (annotationRef.current && annotationByMouse.CustomFieldId !== annotationRef.current.CustomFieldId) {
        annotationRef.current.CustomIsHoveringPlaceholder = false;
        core.getAnnotationManager().redrawAnnotation(annotationRef.current);
      }

      if (!annotationRef.current || annotationRef.current.Id !== annotationByMouse.Id) {
        setAnnotation(annotationByMouse);
        annotationByMouse.CustomIsHoveringPlaceholder = true;
        core.getAnnotationManager().redrawAnnotation(annotationByMouse);
      }
    };

    const onMouseMoveThrottle = rafSchd(onMouseMove);

    core.addEventListener('mouseMove', onMouseMoveThrottle);
    return () => {
      core.removeEventListener('mouseMove', onMouseMoveThrottle);
    };
  }, []);

  useEffect(() => {
    if (!annotation) {
      changeCursor('default');
      return;
    }

    if (!canUseAutoDetectFormFields) {
      return;
    }

    const cursorType = CURSOR_TYPE_MAPPER[annotation.CustomFieldType];
    changeCursor(cursorType);
  }, [annotation, canUseAutoDetectFormFields]);
};
