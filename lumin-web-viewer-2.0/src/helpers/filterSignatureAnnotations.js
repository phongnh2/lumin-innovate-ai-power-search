import core from 'core';

export function filterSignatureAnnotations(annotationList, readOnly) {
  return annotationList.filter(
    (annotation) =>
      annotation instanceof window.Core.Annotations.SignatureWidgetAnnotation &&
      annotation.fieldFlags.get('ReadOnly') === readOnly &&
      annotation.getAssociatedSignatureAnnotation()
  );
}

export function setSignatureAnnotationsProp(annotationList, readOnly) {
  const annotationManager = core.getAnnotationManager();
  annotationList.forEach(
    (annotation) =>
      (annotationManager.getAnnotationById(annotation.getAssociatedSignatureAnnotation().Id).ReadOnly = readOnly)
  );
}
