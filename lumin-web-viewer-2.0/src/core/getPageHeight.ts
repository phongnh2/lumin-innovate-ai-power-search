/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#getPageHeight__anchor
 */
export default (docViewer: Core.DocumentViewer, pageNumber: number): number => docViewer.getPageHeight(pageNumber);
