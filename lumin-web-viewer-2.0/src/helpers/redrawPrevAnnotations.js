import core from 'core';

import { PDF_ACTION_TYPE } from 'constants/documentConstants';

export default (prevAnnotations) => {
  const annotManager = core.getAnnotationManager();
  return Promise.all(
    prevAnnotations.map((annotation) =>
      annotManager.importAnnotationCommand(annotation.xfdf).then((annotations) => {
        annotations
          .filter((annot) => annot instanceof window.Core.Annotations.Link)
          .forEach((annot) => {
            const actions = annot.getActions();
            const prevAction = actions[PDF_ACTION_TYPE.MOUSE_RELEASED]?.find((action) => action.dest.page > 0);
            if (prevAction) {
              annot.addAction(PDF_ACTION_TYPE.MOUSE_RELEASED, prevAction, true);
            }
            annotManager.redrawAnnotation(annot);
          });
      })
    )
  );
};
