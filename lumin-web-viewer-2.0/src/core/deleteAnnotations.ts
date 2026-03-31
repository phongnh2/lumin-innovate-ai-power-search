/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#deleteAnnotations__anchor
 * @fires annotationSelected on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:annotationSelected__anchor
 * @fires deleteReply on AnnotationManager if the annotation deleted is a reply
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:deleteReply__anchor
 * @fires annotationChanged on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:annotationChanged__anchor
 * @fires notify on DocumentViewer if requires delete notification
 */
export default (
  docViewer: Core.DocumentViewer,
  annotations: Core.Annotations.Annotation[],
  options?: {
    imported?: boolean;
    isUndoRedo?: boolean;
    autoFocus?: boolean;
    source?: string;
  }
): void => {
  docViewer.getAnnotationManager().deleteAnnotations(annotations, options);
};
