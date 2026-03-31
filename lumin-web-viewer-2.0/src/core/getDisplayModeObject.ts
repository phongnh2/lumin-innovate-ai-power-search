/**
 * https://www.pdftron.com/api/web/CoreControls.DisplayModeManager.html#getDisplayMode__anchor
 */
export default (docViewer: Core.DocumentViewer): Core.DisplayMode =>
  docViewer.getDisplayModeManager().getDisplayMode() as Core.DisplayMode;
