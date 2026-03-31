/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#getBookmarks__anchor
 */
export default (docViewer: Core.DocumentViewer): Promise<Core.Bookmark[]> => docViewer.getDocument().getBookmarks();
