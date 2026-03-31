/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#setNoteContents__anchor
 * @fires annotationChanged(Modify) on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:annotationChanged__anchor
 */
export default (docViewer: Core.DocumentViewer, annotation: Core.Annotations.Annotation, content: string): void => {
  docViewer.getAnnotationManager().setNoteContents(annotation, content);
};
