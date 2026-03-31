/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#getCompleteRotation__anchor
 */
export default (docViewer: Core.DocumentViewer, pageNumber: number): Core.PageRotation =>
  docViewer.getCompleteRotation(pageNumber);
