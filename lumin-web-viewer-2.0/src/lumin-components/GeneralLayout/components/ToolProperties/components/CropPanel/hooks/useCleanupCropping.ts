import core from 'core';

import { useCleanup } from 'hooks/useCleanup';

import defaultTool from 'constants/defaultTool';

import { isCropAnnotation } from '../helpers/isCropAnnotation';

export const useCleanupCropping = () => {
  useCleanup(() => {
    const annotationManager = core.getAnnotationManager();

    const allAnnotations = annotationManager.getAnnotationsList();
    allAnnotations.forEach((annot) => {
      annot.ReadOnly = false;
      annotationManager.redrawAnnotation(annot);
    });

    const allCropAnnotations = allAnnotations.filter(isCropAnnotation);
    core.deleteAnnotations(allCropAnnotations, { force: true });
    core.refreshAll();
    core.updateView();
    core.setToolMode(defaultTool);
  }, []);
};
