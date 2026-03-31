/**
 * Annotations may set the author to a unique id which isn't suitable for display in the UI.
 * https://www.pdftron.com/api/web/Core.AnnotationManager.html#getDisplayAuthor__anchor
 * this function gets the author name of the annotation that should be displayed.
 */
export default (docViewer: Core.DocumentViewer, annotationUserId: string): string =>
  docViewer.getAnnotationManager().getDisplayAuthor(annotationUserId);
