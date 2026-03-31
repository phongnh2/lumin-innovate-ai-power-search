/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#showAnnotations__anchor
 */
export default (docViewer: Core.DocumentViewer, annotations: Core.Annotations.Annotation[]): void =>
  docViewer.getAnnotationManager().showAnnotations(annotations);
