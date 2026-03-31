/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#setReadOnly__anchor
 * @fires updateAnnotationPermission on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:updateAnnotationPermission__anchor
 */
export default (docViewer: Core.DocumentViewer, isReadOnly: boolean): void => {
  if (isReadOnly) {
    docViewer.getAnnotationManager().enableReadOnlyMode();
  } else {
    docViewer.getAnnotationManager().disableReadOnlyMode();
  }
};
