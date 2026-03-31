/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#loadThumbnailAsync__anchor
 * RequestId will be used if we cancel that thumbnail loading
 */
export default (
  docViewer: Core.DocumentViewer,
  pageNumber: number,
  onLoadThumbnail: (...params: unknown[]) => unknown
): string => docViewer.getDocument().loadThumbnail(pageNumber, onLoadThumbnail);
