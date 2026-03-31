/**
 * @see displayModeObjects.js for more information
 */
export default (docViewer: Core.DocumentViewer): boolean => (docViewer.getDisplayModeManager().getDisplayMode() as Core.DisplayMode).isContinuous();
