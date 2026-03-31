/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#createAnnotationReply__anchor
 * @fires addReply on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:addReply__anchor
 */
export default (
  docViewer: Core.DocumentViewer,
  annotation: Core.Annotations.Annotation,
  reply: string
): Core.Annotations.StickyAnnotation => docViewer.getAnnotationManager().createAnnotationReply(annotation, reply);
