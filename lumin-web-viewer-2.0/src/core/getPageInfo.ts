/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#getPageInfo__anchor
 */
export default (docViewer: Core.DocumentViewer, pageNumber: number): Core.Document.PageInfo => docViewer.getDocument().getPageInfo(pageNumber);
