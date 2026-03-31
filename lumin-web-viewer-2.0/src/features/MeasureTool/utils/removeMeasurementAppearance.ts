import core from 'core';

import { isMeasurementExcludedCalibration } from './isMeasurementAnnotation';

/** LMV-5194: We need to remove the custom appearance from the measurement annotations
 * to prevent blurry rendering
 * */
export const removeMeasurementAppearance = () => {
  const annotations = core.getAnnotationsList();
  annotations.filter(isMeasurementExcludedCalibration).forEach((annot) => {
    annot.removeCustomAppearance();
    core.getAnnotationManager().redrawAnnotation(annot);
  });
};
