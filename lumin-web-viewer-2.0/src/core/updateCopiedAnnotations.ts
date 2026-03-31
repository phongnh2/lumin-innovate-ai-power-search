/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#updateCopiedAnnotations__anchor
 */
export default (docViewer: Core.DocumentViewer): void => {
  docViewer.getAnnotationManager().updateCopiedAnnotations();
};
