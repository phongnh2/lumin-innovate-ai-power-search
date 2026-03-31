/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#enableRedaction__anchor
 */
export default (docViewer: Core.DocumentViewer): void => {
  docViewer.getAnnotationManager().enableRedaction();
};
