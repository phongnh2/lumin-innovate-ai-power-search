/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#deselectAnnotation__anchor
 * @fires annotationSelected on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:annotationSelected__anchor
 */
export default (docViewer: Core.DocumentViewer, annotation: Core.Annotations.Annotation): void => {
  docViewer.getAnnotationManager().deselectAnnotation(annotation);
};
