/**
 * https://docs.apryse.com/api/web/Core.DocumentViewer.html#setDocumentXFDFRetriever__anchor
 */

export default async (
  docViewer: Core.DocumentViewer,
  retriever: Core.DocumentViewer.DocumentXFDFRetriever | null
): Promise<void> => docViewer.setDocumentXFDFRetriever(retriever);
