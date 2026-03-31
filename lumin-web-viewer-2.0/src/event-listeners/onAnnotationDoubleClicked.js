import core from 'core';

export default () => (annotation) => {
  if (annotation instanceof window.Core.Annotations.Link) {
    const annotationManager = core.getAnnotationManager();
    const groupedAnnotations = annotationManager.getGroupAnnotations(annotation);
    const otherAnnotation = groupedAnnotations.find(
      (groupedAnnot) => groupedAnnot.Id !== annotation.Id && !(groupedAnnot instanceof window.Core.Annotations.Link)
    );
    if (otherAnnotation) {
      annotationManager.trigger('annotationDoubleClicked', otherAnnotation);
    }
  }
};