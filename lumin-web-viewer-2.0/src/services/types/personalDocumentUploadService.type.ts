import { InternalAxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';

import { DocumentImportParams, IDocumentBase } from 'interfaces/document/document.interface';

export type UploadParams = {
  encodedUploadData: string;
  fileName: string;
  documentId?: string;
  orgId?: string;
  folderId?: string;
};

export type UploadOptions = {
  cancelToken: CancelTokenSource;
  onUploadProgress: (event: { loaded: number; total: number }) => void;
} & InternalAxiosRequestConfig;

export type AxiosReturnPayload = AxiosResponse<IDocumentBase>;

export type WithUser<T> = T & { userId: string };

export type ImportParams = {
  orgId?: string;
  folderId?: string;
  documents: DocumentImportParams[];
};
