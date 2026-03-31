/**
 * Custom method to get the list of detected field placeholder annotations
 */
export default (docViewer: Core.DocumentViewer): Core.Annotations.Annotation[] =>
  docViewer.getAnnotationManager().getDetectedFieldPlaceholderAnnotations();
