/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#cancelLoadThumbnail__anchor
 */
export default (docViewer: Core.DocumentViewer, requestId: number): void => {
  docViewer.getDocument().cancelLoadThumbnail(requestId);
};