/**
 * https://www.pdftron.com/api/web/Core.AnnotationManager.html#enableReadOnlyMode__anchor
 */
export default (docViewer: Core.DocumentViewer): void => {
  docViewer.getAnnotationManager().enableReadOnlyMode();
};
