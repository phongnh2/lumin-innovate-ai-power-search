export default (
  docViewer: Core.DocumentViewer,
  primaryAnnotation: Core.Annotations.Annotation,
  annotations: Core.Annotations.Annotation[]
): void => docViewer.getAnnotationManager().groupAnnotations(primaryAnnotation, annotations);
