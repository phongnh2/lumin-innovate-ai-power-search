import { IDocumentBase } from 'interfaces/document/document.interface';

export function getFileOptions(
  currentDocument: IDocumentBase,
  options: Record<string, unknown>
): Promise<{ src: string; options: Record<string, unknown> }>;

export function getFlattenedPdfDoc(): Promise<Core.PDFNet.PDFDoc>;

export function getDocument(currentDocument: IDocumentBase): Promise<File>;

export function getLinearizedDocumentFile(
  name: string,
  pdfNetOptions?: {
    xfdf?: string;
    shouldRemoveJavaScript?: boolean;
    shouldRemoveSecurity?: boolean;
    flattenPdf?: boolean;
  },
  requestOptions?: { signal?: AbortSignal }
): Promise<File>;

export function getFileType(document: IDocumentBase): string;

export function getFileData(options?: { xfdfString?: string; flatten?: boolean; flags?: number }): Promise<Uint8Array>;

export function getThumbnailUrl(key: string): string;

export function getFileFromUrl({
  url,
  fileName,
  fileOptions,
  abortSignal,
}: {
  url: string;
  fileName: string;
  fileOptions?: Record<string, unknown>;
  abortSignal?: AbortSignal;
}): Promise<File>;

export function getFileDataByPDFNet(options?: {
  xfdfString?: string;
  flatten?: boolean;
  flags?: number;
}): Promise<Uint8Array>;

declare const _default: {
  getFileOptions: typeof getFileOptions;
  getDocument: typeof getDocument;
  getLinearizedDocumentFile: typeof getLinearizedDocumentFile;
  getFileType: typeof getFileType;
  getFileData: typeof getFileData;
  getThumbnailUrl: typeof getThumbnailUrl;
  getFileFromUrl: typeof getFileFromUrl;
  getFlattenedPdfDoc: typeof getFlattenedPdfDoc;
};

export default _default;
