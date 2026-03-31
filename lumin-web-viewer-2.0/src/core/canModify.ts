/**
 * Whether or not the current user can modify the annotation.
 */
export default (docViewer: Core.DocumentViewer, annotation: Core.Annotations.Annotation): boolean => docViewer.getAnnotationManager().canModify(annotation);
