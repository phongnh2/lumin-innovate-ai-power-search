/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#getRotation__anchor
 */
export default (docViewer: Core.DocumentViewer, pageNumber: number): Core.PageRotation => docViewer.getRotation(pageNumber);
