/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#addAnnotations__anchor
 * @fires annotationChanged on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:annotationChanged__anchor
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
  docViewer.getAnnotationManager().addAnnotations(annotations, options);
};
