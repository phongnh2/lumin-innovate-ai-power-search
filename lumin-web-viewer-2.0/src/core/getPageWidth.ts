/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#getPageWidth__anchor
 */
export default (docViewer: Core.DocumentViewer, pageNumber: number): number => docViewer.getPageWidth(pageNumber);
