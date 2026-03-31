/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#getSelectedAnnotations__anchor
 */
export default (docViewer: Core.DocumentViewer): Core.Annotations.Annotation[] =>
  docViewer.getAnnotationManager().getSelectedAnnotations();
