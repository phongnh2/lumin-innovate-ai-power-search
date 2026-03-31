import { useEffect, useCallback } from 'react';

import core from 'core';

import { ANNOTATION_ACTION } from 'constants/documentConstants';

import { useCropDimensionHandlers } from './useCropDimensionHandlers';
import { isCropAnnotation } from '../helpers/isCropAnnotation';
import { CropDimensionType, CropTypeOption } from '../types';
import { hasAdjustedDimensions } from '../utils/hasAdjustedDimensions';

interface UseCropAnnotationChangedProps {
  cropType: CropTypeOption;
  cropDimension: CropDimensionType;
  setCropDimension: (dimension: CropDimensionType) => void;
}

export const useCropAnnotationChanged = (props: UseCropAnnotationChangedProps) => {
  const { cropType, cropDimension, setCropDimension } = props;
  const { docViewer } = core;
  const { validateDimensions, getRectByDimensions } = useCropDimensionHandlers({ cropType });

  const updateCropAnnotation = useCallback(
    ({ currentAnnotation }: { currentAnnotation: Core.Annotations.Annotation }): void => {
      const pageNumber = currentAnnotation.PageNumber;
      const pageInfo = docViewer.getDocument().getPageInfo(pageNumber);

      const validDimension = validateDimensions({ cropDimension, currentAnnotation, pageInfo });
      const cropRect = getRectByDimensions({ validDimension, currentAnnotation, pageInfo });

      currentAnnotation.X = cropRect.x1;
      currentAnnotation.Y = cropRect.y1;
      currentAnnotation.Width = cropRect.x2 - cropRect.x1;
      currentAnnotation.Height = cropRect.y2 - cropRect.y1;

      const newRect = new window.Core.Math.Rect(cropRect.x1, cropRect.y1, cropRect.x2, cropRect.y2);
      currentAnnotation.setRect(newRect);

      docViewer.getAnnotationManager().redrawAnnotation(currentAnnotation);

      const isAnnotationSelected = docViewer.getAnnotationManager().isAnnotationSelected(currentAnnotation);
      if (isAnnotationSelected && hasAdjustedDimensions(cropDimension, validDimension)) {
        setCropDimension(validDimension);
      }
    },
    [docViewer, cropDimension, setCropDimension, validateDimensions, getRectByDimensions]
  );

  useEffect(() => {
    const annotationManager = docViewer.getAnnotationManager();

    const onAnnotationChanged = (annotations: Core.Annotations.Annotation[], action: string) => {
      const cropAnnotation = annotations.find(isCropAnnotation);
      if (!cropAnnotation) {
        return;
      }

      if ([ANNOTATION_ACTION.ADD, ANNOTATION_ACTION.MODIFY].includes(action)) {
        annotationManager.getAnnotationsList().forEach((annotation) => {
          if (!isCropAnnotation(annotation)) {
            annotation.ReadOnly = true;
          }
        });
        const rect = cropAnnotation.getRect();
        const pageNumber = cropAnnotation.PageNumber;
        const pageInfo = docViewer.getDocument().getPageInfo(pageNumber);

        const dimension: CropDimensionType = {
          width: cropAnnotation.Width,
          height: cropAnnotation.Height,
          top: rect.getTop(),
          left: rect.getLeft(),
          right: pageInfo.width - cropAnnotation.Width - rect.getLeft(),
          bottom: pageInfo.height - cropAnnotation.Height - rect.getTop(),
        };
        setCropDimension(dimension);
      }
    };

    annotationManager.addEventListener('annotationChanged', onAnnotationChanged);

    return () => {
      annotationManager.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, [docViewer, setCropDimension]);

  useEffect(() => {
    const allCropAnnotations = docViewer.getAnnotationManager().getAnnotationsList().filter(isCropAnnotation);
    if (allCropAnnotations.length > 0 && cropDimension) {
      allCropAnnotations.forEach((annotation) => {
        updateCropAnnotation({ currentAnnotation: annotation });
      });
    }
  }, [docViewer, cropDimension, updateCropAnnotation]);
};
