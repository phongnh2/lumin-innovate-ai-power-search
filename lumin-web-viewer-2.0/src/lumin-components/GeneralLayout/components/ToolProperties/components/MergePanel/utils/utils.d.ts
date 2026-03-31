import { IDocumentBase } from 'interfaces/document/document.interface';

declare interface FileInfo {
  docInstance: {
    getBookmarks: () => Promise<Core.Bookmark[]>;
    getPDFDoc: () => Promise<Core.PDFNet.PDFDoc>;
  };
  rangeAllPages: number[];
  totalPages: number;
  file: {
    name: string;
  };
  fileSource: string;
}

export function isAllPageAvailable(filesInfo: FileInfo[], allPages: boolean): boolean;

export function isThereAFileWithError(filesInfo: FileInfo[]): boolean;

export function hasLoadingFile(filesInfo: FileInfo[]): boolean;

export function getTotalMergeSize(filesInfo: FileInfo[], currentDocument: IDocumentBase): number;
