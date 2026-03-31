import core from 'core';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';

export const hideNonWidgetAnnotations = ({ annotations = [] }: { annotations: Core.Annotations.Annotation[] }) => {
  const annotManager = core.getAnnotationManager();

  annotations.forEach((annot) => {
    if (annot instanceof window.Core.Annotations.WidgetAnnotation) {
      annot.refresh();
      return;
    }
    if (annot instanceof window.Core.Annotations.StampAnnotation && annot.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key)) {
      annot.Listable = false;
      annotManager.redrawAnnotation(annot);
      return;
    }
    if (!annot.Hidden) {
      annot.Hidden = true;
      annot.TemporaryHidden = true;
      annotManager.redrawAnnotation(annot);
    }
  });
};
