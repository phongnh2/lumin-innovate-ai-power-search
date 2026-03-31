import core from 'core';

import setFitFreeText from 'helpers/setFitFreeText';

import { CUSTOM_DATA_DIMENSION, CUSTOM_DATA_COORDINATE } from 'constants/customDataConstant';
import {
  DEFAULT_FREE_TEXT_MIN_WIDTH,
  ANNOTATION_SUBJECT_NEED_TO_TRANSFORM,
  AnnotationSubjectMapping,
} from 'constants/documentConstants';

const STAMP_ANNOTATION_MIN_DIMENSION = 25;

const ICON_STAMP_ANNOTATION_MIN_DIMENSION = 7;

const transformAnnotationDimension = (annotations) => {
  const annotationsNeedTransform = annotations.filter((annot) =>
    ANNOTATION_SUBJECT_NEED_TO_TRANSFORM.includes(annot.Subject)
  );
  if (annotationsNeedTransform.length > 0) {
    annotationsNeedTransform.forEach((annot) => {
      const prevDimension = JSON.parse(annot.getCustomData(CUSTOM_DATA_DIMENSION.key) || '{}');
      const prevCoordinate = JSON.parse(annot.getCustomData(CUSTOM_DATA_COORDINATE.key) || '{}');

      // NOTE: sometime Apryse return NaN as Width
      const width = annot.Width || 0;
      const height = annot.Height || 0;

      const X = annot.X || prevCoordinate.X || 0;
      const Y = annot.Y || prevCoordinate.Y || 0;

      if (prevDimension.width !== width || prevDimension.height !== height) {
        switch (annot.Subject) {
          case AnnotationSubjectMapping.freetext: {
            const fontSize = parseInt(annot.FontSize.split('pt')[0]);
            const maxLineWidth = annot.maxLineWidth ?? annot.Width;
            const minWidth = Math.min(maxLineWidth, DEFAULT_FREE_TEXT_MIN_WIDTH);
            const minHeight = fontSize;
            if (height < minHeight || width < minWidth) {
              setFitFreeText(annot);
            }
            break;
          }
          case AnnotationSubjectMapping.draft:
          case AnnotationSubjectMapping.stamp:
          case AnnotationSubjectMapping.signature: {
            updateStampAnnotationDimensions({
              height,
              width,
              prevDimension,
              annot,
              X,
              Y,
              minDimensionSize: STAMP_ANNOTATION_MIN_DIMENSION,
            });
            break;
          }
          case AnnotationSubjectMapping.tickStamp:
          case AnnotationSubjectMapping.dotStamp:
          case AnnotationSubjectMapping.crossStamp: {
            updateStampAnnotationDimensions({
              height,
              width,
              prevDimension,
              annot,
              X,
              Y,
              minDimensionSize: ICON_STAMP_ANNOTATION_MIN_DIMENSION,
            });
            break;
          }
          default:
            break;
        }
        const data = JSON.stringify({
          height: annot.Height,
          width: annot.Width,
        });

        const dataCoordinate = JSON.stringify({
          X: annot.X,
          Y: annot.Y,
        });

        annot.setCustomData(CUSTOM_DATA_DIMENSION.key, data);
        annot.setCustomData(CUSTOM_DATA_COORDINATE.key, dataCoordinate);
      }
    });
    core.drawAnnotationsFromList(annotationsNeedTransform);
  }
};

export default transformAnnotationDimension;

function updateStampAnnotationDimensions({ height, width, prevDimension, annot, X, Y, minDimensionSize }) {
  if (height < minDimensionSize || width < minDimensionSize) {
    const hwRatio = prevDimension.height / prevDimension.width;
    const _width = Math.max(width, minDimensionSize);
    annot.Width = _width;
    annot.Height = _width * hwRatio;

    annot.X = X;
    annot.Y = Y;
  }
}
