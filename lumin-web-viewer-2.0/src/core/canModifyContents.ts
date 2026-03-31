/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#canModifyContents__anchor
 */
export default (docViewer: Core.DocumentViewer, annotation: Core.Annotations.Annotation): boolean => docViewer.getAnnotationManager().canModifyContents(annotation);
