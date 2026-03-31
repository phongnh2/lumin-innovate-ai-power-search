/**
 * https://www.pdftron.com/api/web/Core.AnnotationManager.html#enableRedaction__anchor
 */
export default (docViewer: Core.DocumentViewer): void => {
  docViewer.getAnnotationManager().disableRedaction();
};
