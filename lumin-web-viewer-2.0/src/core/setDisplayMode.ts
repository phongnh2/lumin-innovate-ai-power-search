/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#setDisplayMode__anchor
 * @fires displayModeUpdated on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:displayModeUpdated__anchor
 * @fires zoomUpdated on AnnotationManager
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#event:zoomUpdated__anchor
 */
export default (docViewer: Core.DocumentViewer, mode: Core.DisplayModes): void => {
  const displayModeManager = docViewer.getDisplayModeManager();
  const displayMode = displayModeManager.isVirtualDisplayEnabled()
    ? new window.Core.VirtualDisplayMode(docViewer, mode)
    : new window.Core.DisplayMode(docViewer, mode);
  docViewer.getDisplayModeManager().setDisplayMode(displayMode);
};
