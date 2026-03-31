import core from 'core';

import setFitFreeText from 'helpers/setFitFreeText';

import { ANNOTATION_ACTION, ANNOTATION_CHANGE_SOURCE } from 'constants/documentConstants';

export default (annotation) => {
  if (annotation.isAutoSized() && core.canModify(annotation)) {
    annotation.setModified = true;
    setFitFreeText(annotation);
    core
      .getAnnotationManager()
      .trigger('annotationChanged', [
        [annotation],
        ANNOTATION_ACTION.MODIFY,
        { source: ANNOTATION_CHANGE_SOURCE.AUTO_RESIZED },
      ]);
  }
};
