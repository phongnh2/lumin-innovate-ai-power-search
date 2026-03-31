/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#setCurrentUser__anchor
 * @fires updateAnnotationPermission on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:updateAnnotationPermission__anchor
 */
export default (docViewer: Core.DocumentViewer, userName: string): void => {
  docViewer.getAnnotationManager().setCurrentUser(userName);
};
