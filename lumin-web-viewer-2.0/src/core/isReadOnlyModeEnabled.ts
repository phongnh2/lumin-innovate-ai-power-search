/**
 * https://www.pdftron.com/api/web/Core.AnnotationManager.html#isReadOnlyModeEnabled__anchor
 */
export default (docViewer: Core.DocumentViewer): boolean => docViewer.getAnnotationManager().isReadOnlyModeEnabled();
