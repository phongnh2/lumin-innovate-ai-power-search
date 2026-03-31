/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#selectAnnotation__anchor
 * @fires annotationSelected on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:annotationSelected__anchor
 */
export default (docViewer: Core.DocumentViewer, annotation: Core.Annotations.Annotation): void => {
  docViewer.getAnnotationManager().selectAnnotation(annotation);
};