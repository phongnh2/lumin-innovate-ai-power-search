/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#setIsAdminUser__anchor
 * @fires updateAnnotationPermission on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:updateAnnotationPermission__anchor
 */
export default (docViewer: Core.DocumentViewer, isAdmin: boolean): void => {
  if (isAdmin) {
    docViewer.getAnnotationManager().promoteUserToAdmin();
  } else {
    docViewer.getAnnotationManager().demoteUserFromAdmin();
  }
};
