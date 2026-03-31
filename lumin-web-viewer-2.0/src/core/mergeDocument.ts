/**
 * https://www.pdftron.com/api/web/CoreControls.Document.html#mergeDocument__anchor
 */

export default (
  docViewer: Core.DocumentViewer,
  source: string | File | Blob | ArrayBuffer,
  position?: number
): Promise<unknown> => docViewer.getDocument().mergeDocument(source, position);
