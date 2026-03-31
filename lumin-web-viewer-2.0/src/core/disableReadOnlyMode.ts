/**
 * https://www.pdftron.com/api/web/Core.AnnotationManager.html#disableReadOnlyMode__anchor
 */
export default (docViewer: Core.DocumentViewer): void => {
  docViewer.getAnnotationManager().disableReadOnlyMode();
};
