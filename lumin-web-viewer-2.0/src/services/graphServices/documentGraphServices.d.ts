import { IPresignedUrlResult, TGetUploadParams } from 'hooks/useGetPresignedUrl';

import { IFormField, TDocumentOutline, IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

interface IMentionParams {
  documentId: string;
  searchKey: string;
}

interface IMentionData {
  _id: string;
  email: string;
  name: string;
  avatarRemoteId: string;
}

type TGetDocumentOutlinesParams = {
  documentId: string;
  path?: string;
  level?: number;
};

type TImportDocumentOutlinesInput = {
  documentId: string;
  outlineChunk: TDocumentOutline[];
  totalOutlines: number;
  isInsertMultiple?: boolean;
};

declare namespace documentGraphServices {
  export function getPresignedUrlForUploadDoc(
    params: TGetUploadParams
  ): Promise<{ data: { getPresignedUrlForUploadDoc: IPresignedUrlResult } }>;
  export function getMentionList(params: IMentionParams): Promise<Array<IMentionData>>;

  export function getPresignedUrlForSignature(fileType: string): Promise<{
    remoteId: string;
    putSignedUrl: string;
    getSignedUrl: string;
    encodeSignatureData: string;
  }>;
  export function getDocumentOutlines(input: TGetDocumentOutlinesParams): Promise<TDocumentOutline[]>;
  export function importDocumentOutlines(input: TImportDocumentOutlinesInput): Promise<void>;
  export function getDocumentOriginalFileUrl(documentId: string): Promise<any>;
  export function getFormFields(documentId: string, fetchOptions: { signal: AbortSignal }): Promise<IFormField[]>;
  export function getDocument({ documentId, usePwa }: { documentId: string; usePwa?: boolean }): Promise<{
    data: {
      document: IDocumentBase;
      getFormField: IFormField[];
    };
  }>;
  export function getDocumentTemplate({ documentId, usePwa }: { documentId: string; usePwa?: boolean }): Promise<{
    data: {
      documentTemplate: IDocumentBase;
      getFormField: IFormField[];
    };
  }>;
  export function starDocumentMutation(data: {
    document: IDocumentBase;
    currentUser: IUser;
    clientId: string;
    callback?: () => unknown;
  }): Promise<unknown>;

  export function createPDFForm(data: { remoteId: string; formStaticPath: string; source: string }): Promise<{
    data: {
      documentId: string;
    };
  }>;
  export function refreshDocumentImageSignedUrls(documentId: string): Promise<Record<string, string>>;

  export function getDocumentsInFolder(input: {
    folderId: string;
    filter: {
      lastModifiedFilterCondition: string;
      ownedFilterCondition: string;
    };
    query: {
      searchKey: string;
      minimumQuantity: number;
    };
  }): Promise<{
    documents: IDocumentBase[];
    cursor: string;
    hasNextPage: boolean;
    total: number;
  }>;

  export function checkDownloadMultipleDocuments(
    input: {
      orgId?: string;
      documentIds?: string[];
      folderIds?: string[];
    },
    fetchOptions?: Record<string, unknown>
  ): Promise<{
    data: {
      isDocStackInsufficient?: boolean;
      isDocumentLimitExceeded?: boolean;
      isTotalSizeExceeded?: boolean;
    };
  }>;

  export function updateStackedDocuments(input: { documentIds: string[] }): Promise<void>;
  export function getSignedUrlForExternalPdfByEncodeData(encodeData: string): Promise<{
    signedUrl: string;
    documentName: string;
    remoteId: string;
    fileSize: number;
  }>;
  export function createPdfFromStaticToolUpload(input: { encodeData: string }): Promise<{
    documentId: string;
    documentName: string;
    documentSize: number;
    documentMimeType: string;
    temporaryRemoteId: string;
  }>;

  export function updateMimeType(documentId: string): Promise<{
    data: {
      mimeType: string;
    };
  }>;

  export function updateDocumentMimeTypeToPdf(
    documentId: string,
    remoteId: string
  ): Promise<{
    data: {
      mimeType: string;
      name: string;
    };
  }>;
}

export default documentGraphServices;
