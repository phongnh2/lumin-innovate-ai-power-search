import { OfficeDocumentType } from "constants/officeDocument";

declare namespace fileUtil {
  function getFilenameWithoutExtension(filename: string): string;

  function getFileSizeLimit(sizeLimit: number): number;

  function getThumbnailWithDocument(
    documentInstance: Core.Document,
    options?: { thumbSize?: number }
  ): Promise<HTMLCanvasElement>;

  function convertThumnailCanvasToFile(thumbnailCanvas: HTMLCanvasElement, name?: string): Promise<File>;

  function getCanvasFromUrl(url: string): Promise<HTMLCanvasElement>;

  function dataURLtoFile(dataurl: string, filename: string): File;

  function isOffice(type: OfficeDocumentType): boolean;

  function convertExtensionToPdf(fileName: string): string;

  function getThumbnailWithFile(file: File, password?: string): Promise<HTMLCanvasElement>;

  function getMimeTypeFromSignedUrl(url: string): string;

  function getExtension(fileName: string): string;

  function getShortFilename(fileName: string): string;

  function fileReaderAsync(fileUploaded: File): Promise<File>;
}

export default fileUtil;
