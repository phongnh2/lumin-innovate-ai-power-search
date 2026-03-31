/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#getCurrentUser__anchor
 */
export default (docViewer: Core.DocumentViewer): string => docViewer.getAnnotationManager().getCurrentUser();
