/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#selectAnnotations__anchor
 * @fires annotationSelected on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:annotationSelected__anchor
 */
export default (docViewer: Core.DocumentViewer, annotations: Core.Annotations.Annotation[]): void => {
  docViewer.getAnnotationManager().selectAnnotations(annotations);
};
