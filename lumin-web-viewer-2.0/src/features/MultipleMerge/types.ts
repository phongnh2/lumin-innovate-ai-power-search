import { IAnnotation, IDocumentBase, IFormField, TDocumentOutline } from 'interfaces/document/document.interface';

import { FileSourceType, SaveDestinationType, UploadStatusType, UploadDocumentErrorType } from './enum';

export type MergeDocumentMetadataType = {
  errorCode?: UploadDocumentErrorType;
};

export type MergeDocumentType = {
  _id: string;
  mimeType: string;
  name: string;
  size: number;
  thumbnail?: string;
  status: UploadStatusType;
  metadata?: MergeDocumentMetadataType;
  file?: File;
  buffer?: ArrayBuffer;
  pdfDoc?: Core.PDFNet.PDFDoc;
  source: FileSourceType;
  error?: string;
  remoteId?: string;
};

export type SaveDestinationOptionType = {
  type: SaveDestinationType;
  icon?: string;
  imageSrc?: string;
  contentKey?: string;
  content?: string;
  iconColor?: string;
};

export type GetDocumentDataType = Partial<MergeDocumentType>;

export type GetRemoteDocumentDataPayload = {
  document: IDocumentBase;
  annotations: IAnnotation[];
  outlines: TDocumentOutline[];
  fields: IFormField[];
  signedUrls: Record<string, string>;
};

export type GetRemoteDocumentDataType = GetDocumentDataType & GetRemoteDocumentDataPayload;

export type BaseDocumentItemType = {
  _id: string;
  remoteId?: string;
  name: string;
  onError: (error: Error) => void;
  onLoadDocumentComplete: () => void;
  onSetupPasswordHandler: (params: { attempt: number; name: string }) => void;
};
