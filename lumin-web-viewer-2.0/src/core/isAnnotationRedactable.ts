/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#isAnnotationRedactable__anchor
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:isAnnotationRedactable__anchor
 */
export default (docViewer: Core.DocumentViewer, annotation: Core.Annotations.Annotation): boolean =>
  docViewer.getAnnotationManager().isAnnotationRedactable(annotation);
