export default (
  docViewer: Core.DocumentViewer,
  src: string | Core.Document | File | Blob | ArrayBuffer | Core.PDFNet.PDFDoc,
  options?: Core.CreateDocumentOptions
): Promise<void> => docViewer.loadDocument(src, options);
