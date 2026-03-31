export abstract class MergeBaseItem {
  abstract getPDFDoc(): Promise<Core.PDFNet.PDFDoc>;
}
