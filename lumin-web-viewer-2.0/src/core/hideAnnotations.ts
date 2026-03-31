/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#hideAnnotations__anchor
 */
export default (docViewer: Core.DocumentViewer, annotations: Core.Annotations.Annotation[]): void =>
  docViewer.getAnnotationManager().hideAnnotations(annotations);
