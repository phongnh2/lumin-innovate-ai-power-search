import { ReactNode } from 'react';

import { IFolder } from 'interfaces/folder/folder.interface';

import { ErrorModalType } from '../constants';

export type ErrorDocument = {
  _id: string;
  name: string;
  errorMessage: string | ReactNode;
};

export interface ErrorModal {
  opened: boolean;
  type: ErrorModalType;
}

export interface MultipleDownloadState {
  errorModal: ErrorModal;
  errorDocuments: ErrorDocument[];
  errorTypes: string[];
  hasOpenedDropboxAuthWindow: boolean;
}

export interface FolderDataWithFiles extends IFolder {
  filesData: { name: string; file: Blob }[];
  subFolders: FolderDataWithFiles[];
}

export interface FileData {
  _id: string;
  name: string;
  file: Blob;
}
