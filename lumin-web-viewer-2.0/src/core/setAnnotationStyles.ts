/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#setAnnotationStyles__anchor
 * @fires annotationChanged on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:annotationChanged__anchor
 */
export default (docViewer: Core.DocumentViewer, annotation: Core.Annotations.Annotation, newStyles: unknown): void => {
  docViewer.getAnnotationManager().setAnnotationStyles(annotation, newStyles);
};
