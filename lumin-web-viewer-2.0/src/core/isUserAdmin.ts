/**
 * https://www.pdftron.com/api/web/Core.AnnotationManager.html#isUserAdmin
 */
export default (docViewer: Core.DocumentViewer): boolean => docViewer.getAnnotationManager().isUserAdmin();
