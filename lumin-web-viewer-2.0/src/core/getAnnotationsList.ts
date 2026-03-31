/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#getAnnotationsList__anchor
 */
export default (docViewer: Core.DocumentViewer): Core.Annotations.Annotation[] =>
  docViewer.getAnnotationManager().getAnnotationsList();
