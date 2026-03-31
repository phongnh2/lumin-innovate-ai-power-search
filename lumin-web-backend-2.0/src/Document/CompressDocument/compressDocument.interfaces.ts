export interface ICompressDocumentMessage {
  sessionId: string;
  documentId: string;
  presignedUrl: string;
  error: string;
}
