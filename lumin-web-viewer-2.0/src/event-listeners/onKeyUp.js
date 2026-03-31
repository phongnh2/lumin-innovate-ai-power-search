import core from 'core';
import { AnnotationSubjectMapping } from 'constants/documentConstants';

export default () => (e) => {
  const selectedAnnotations = core.getSelectedAnnotations();
  if (e.keyCode === 16 && selectedAnnotations.length > 0) {
    selectedAnnotations.forEach((selectedAnnotation) => {
      if (selectedAnnotation.Subject !== AnnotationSubjectMapping.stickyNote) {
        selectedAnnotation.MaintainAspectRatio = false;
      }
    });
  }
};
