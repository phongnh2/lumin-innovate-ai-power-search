import { IDocumentBase } from 'interfaces/document/document.interface';

export interface IDocumentRestore {
  versionId: string;
  handleInternalStoragePermission: () => Promise<void>;
  currentDocument: IDocumentBase;
  password?: string;
}

export interface IDocumentRevision {
  _id?: string;
  keepForever?: boolean;
  kind?: string;
  lastModifyingUser?: {
    displayName: string;
    photoLink: string;
  };
  modifiedTime?: string;
  originalFilename?: string;
  size?: string;
  fileRemoteId?: string;
  versionId?: string;
}

export interface IRestoreGoogleFileInfo {
  fileId: string;
  fileMetadata: {
    name: string;
    mimeType: string;
  };
  fileData: File;
}

export interface IDocumentVersioningLoggerError {
  error: unknown;
  reason?: string;
}

export interface IGetListRevision {
  fileId: string;
  limit?: number;
}
