import { AxiosResponse, CancelTokenSource } from 'axios';
import { TFunction } from 'i18next';

import { CropTypeOption } from '@new-ui/components/ToolProperties/components/CropPanel/types';
import { SaveOperationType } from 'types/saveOperations';

import { IPresignedUrlResult, TGetUploadParams } from 'hooks/useGetPresignedUrl';

import { PredictionFieldsDataType, TriggerActionType } from 'features/FormFieldDetection/types/detectionField.type';

import { IBasicResponse } from 'interfaces/common';
import {
  DocumentImportParams,
  IAnnotation,
  IDocumentBase,
  InfoDocumentExisted,
} from 'interfaces/document/document.interface';

import {
  UploadFileToS3Params,
  FindLocationData,
  PromptInviteGoogleUsersParams,
  PromptInviteUsersBannerResponse,
  UploadDocumentWithThumbnailToS3Params,
  UploadDocFrom,
} from './types/documentServices.types';
import { DropboxFileInfo } from './types/dropboxService.types';

type OverrideDocumentToS3Params = {
  file: File;
  remoteId: string;
  documentId: string;
  thumbnail: File;
  thumbnailRemoteId: string;
  uploadDocFrom?: UploadDocFrom;
  increaseVersion?: boolean;
  isAppliedOCR?: boolean;
  disableRealtime?: boolean;
  signal?: AbortSignal;
};

declare namespace documentServices {
  export function getDocumentById(documentId: string): Promise<IDocumentBase>;

  export function acceptRequestAccessDocument({
    documentId,
    requesterIds,
  }: {
    documentId: string;
    requesterIds: string[];
  }): Promise<void>;

  export function rejectRequestAccessDocument({
    documentId,
    requesterIds,
  }: {
    documentId: string;
    requesterIds: string[];
  }): Promise<void>;

  export function checkThirdPartyStorage({ remoteIds }: { remoteIds: string[] }): Promise<InfoDocumentExisted[]>;

  export function requestAccessDocument({
    documentId,
    documentRole,
    message,
  }: {
    documentId: string;
    documentRole: string;
    message: string;
  }): Promise<void>;

  export function duplicateDocument({
    documentName,
    destinationId,
    destinationType,
    notifyUpload,
    documentId,
    file,
  }: {
    documentName: string;
    destinationId: string;
    destinationType: string;
    notifyUpload: boolean;
    documentId: string;
    file: File;
  }): Promise<IDocumentBase>;

  export function duplicateDocumentToFolder({
    documentName,
    folderId,
    notifyUpload,
    documentId,
    file,
  }: {
    documentName: string;
    folderId: string;
    notifyUpload: boolean;
    documentId: string;
    file: File;
  }): Promise<IDocumentBase>;

  export function findAvailableLocation(
    { type, searchKey, orgId }: { type: string; searchKey: string; orgId: string },
    { signal }: { signal: AbortSignal }
  ): Promise<{
    data: FindLocationData[];
    cursor: string;
    hasNextPage: boolean;
  }>;

  export function moveDocuments({
    documentIds,
    destinationType,
    destinationId,
    isNotify,
    file,
    documentName,
  }: {
    documentIds: string[];
    destinationType: string;
    destinationId: string;
    isNotify: boolean;
    file: File;
    documentName?: string;
  }): Promise<IBasicResponse>;

  export function moveDocumentsToFolder({
    documentIds,
    folderId,
    isNotify,
    file,
    documentName,
  }: {
    documentIds: string[];
    folderId: string;
    isNotify: boolean;
    file?: File;
    documentName?: string;
  }): Promise<IBasicResponse>;

  export function importThirdPartyDocuments({
    folderId,
    userId,
    documents,
  }: {
    folderId: string;
    userId: string;
    documents: DocumentImportParams[];
  }): Promise<IDocumentBase[]>;

  export function uploadDocumentWithThumbnailToS3({
    thumbnail,
    thumbnailRemoteId,
    file,
    remoteId,
    signal,
    uploadDocFrom,
  }: UploadDocumentWithThumbnailToS3Params): Promise<{
    document: IPresignedUrlResult;
    thumbnail: IPresignedUrlResult;
    encodedUploadData: string;
  }>;

  export function uploadThumbnail(
    documentId: string,
    thumbnail: File | Blob
  ): Promise<{ statusCode: number; message: string; data: File } | null>;

  export function uploadFileToS3(
    {
      file,
      presignedUrl,
      headers,
      options: { signal },
    }: UploadFileToS3Params,
    requestConfig?: { cancelToken?: CancelTokenSource; onUploadProgress?: (progressEvent: ProgressEvent) => void }
  ): Promise<string>;

  export function getPresignedUrlForUploadDoc(params: TGetUploadParams): Promise<IPresignedUrlResult>;

  export function syncFileToS3(
    currentDocument: IDocumentBase,
    options?: { increaseVersion?: boolean }
  ): Promise<AxiosResponse>;

  export function syncFileToS3Exclusive(
    currentDocument: IDocumentBase,
    options?: {
      increaseVersion?: boolean;
      isAppliedOCR?: boolean;
      action?: SaveOperationType;
      uploadDocFrom?: UploadDocFrom;
    },
    { signal }?: { signal?: AbortSignal }
  ): Promise<AxiosResponse>;

  export function getSignedUrlForOCR(params: {
    documentId: string;
    totalParts: number;
  }): Promise<{ key: string; listSignedUrls: string[] }>;

  export function overrideDocumentToS3(options: OverrideDocumentToS3Params): Promise<{ data: { etag: string } }>;

  export function uploadTemporaryDocument(
    currentDocument: IDocumentBase,
    key: string,
    convertType: string
  ): Promise<void>;

  export function getCurrentDocumentSize(currentDocument: IDocumentBase): Promise<number>;

  export function getPromptInviteUsersBanner(
    payload: PromptInviteGoogleUsersParams,
    { signal }: { signal: AbortSignal }
  ): Promise<PromptInviteUsersBannerResponse>;

  export function isOfflineMode(): boolean;

  export function uploadFileToBananaSign(currentDocument: IDocumentBase): Promise<string>;

  export function getDocumentByRemoteAndClientId({
    remoteId,
    clientId,
  }: {
    remoteId: string;
    clientId: string;
  }): Promise<{ document: IDocumentBase }>;

  export function getAnnotations({
    documentId,
    fetchOptions,
  }: {
    documentId: string;
    fetchOptions?: Record<string, unknown>;
  }): Promise<IAnnotation[]>;

  export function syncFileToDrive(document: IDocumentBase): Promise<void>;

  export function insertFileToDrive(data: { fileMetadata: Record<string, unknown>; fileData: Blob }): Promise<unknown>;

  export function syncFileToDropbox(
    data: { fileId: string; file: Blob },
    options?: { signal?: AbortSignal }
  ): Promise<{
    data: {
      name: string;
      path_lower: string;
      path_display: string;
      id: string;
      client_modified: string;
      server_modified: string;
      rev: string;
      size: number;
      is_downloadable: boolean;
      content_hash: string;
    };
  }>;

  export function insertFileToDropbox(
    data: { fileName: string; file: Blob; folderPath?: string },
    options?: { signal?: AbortSignal }
  ): Promise<{ data: DropboxFileInfo }>;

  export function getDropboxFileInfo(
    fileId: string,
    { signal }?: { signal: AbortSignal }
  ): Promise<{ data: { name: string; path_display: string; size: number; content_hash: string } }>;

  export function renameFileFromDropbox(
    fileId: string,
    fileName: string,
    path: string,
    { signal }: { signal: AbortSignal }
  ): Promise<{ data: { name: string; path_display: string } }>;

  export function createPresignedFormFieldDetectionUrl(
    input: {
      documentId: string;
      triggerAction?: TriggerActionType;
      pages?: number[];
    },
    fetchOptions: { signal: AbortSignal }
  ): Promise<{ blockTime: number; presignedUrl: string; sessionId: string; usage: number; isExceeded: boolean }>;

  export function batchCreatePresignedFormFieldDetectionUrl(
    input: {
      documentId: string;
      triggerAction?: TriggerActionType;
      pages?: number[][];
    },
    fetchOptions: { signal: AbortSignal }
  ): Promise<
    {
      blockTime: number;
      presignedUrl: string;
      sessionId: string;
      usage: number;
      isExceeded?: boolean;
    }[]
  >;

  export function trackingUserUseDocument(documentId: string): Promise<{
    statusCode: number;
    message: string;
  }>;

  export function countDocStackUsage(documentId: string): Promise<{
    statusCode: number;
    message: string;
  }>;

  export function getDocStackInfo(
    documentId: string,
    { signal }?: { signal?: AbortSignal }
  ): Promise<{ canFinishDocument: boolean; totalUsed: number; totalStack: number }>;

  export function createPDFForm({
    remoteId,
    formStaticPath,
    source,
  }: {
    remoteId: string;
    formStaticPath: string;
    source: string;
  }): Promise<{ documentId: string; documentName: string }>;

  export function processAppliedFormFields(input: {
    documentId: string;
    predictionFieldDataList: PredictionFieldsDataType[];
  }): Promise<{
    statusCode: number;
    message: string;
  }>;

  export function checkDownloadMultipleDocuments(
    input: {
      orgId?: string;
      documentIds?: string[];
      folderIds?: string[];
    },
    fetchOptions?: Record<string, unknown>
  ): Promise<{
    isDocStackInsufficient?: boolean;
    isDocumentLimitExceeded?: boolean;
    isTotalSizeExceeded?: boolean;
    totalDocuments?: number;
  }>;

  export function updateStackedDocuments(input: { documentIds: string[] }): Promise<void>;

  export function uploadDocumentFromDrive({
    document,
    orgId,
  }: {
    document: IDocumentBase;
    orgId: string;
  }): Promise<string>;

  export function checkShareThirdPartyDocument(input: { documentId: string }): Promise<{ isAllowed: boolean }>;

  export function saveBackupFile(params: {
    file: File;
    remoteId: string;
    documentId: string;
    thumbnail?: File;
    thumbnailRemoteId?: string;
  }): Promise<AxiosResponse>;

  export function emitData({
    document,
    type,
    data,
  }: {
    document: IDocumentBase;
    type: string;
    data: IAnnotation;
  }): Promise<void>;

  export function emitSocketMergePages(params: {
    currentDocument: IDocumentBase;
    totalPages: number;
    numberOfPageToMerge: number;
    positionToMerge: number;
    totalPagesBeforeMerge: number;
  }): Promise<void>;

  export function deleteSignedUrlImage(
    input: { currentDocument: IDocumentBase; remoteIds: string[] },
    { signal }?: { signal: AbortSignal }
  ): Promise<void>;

  export function uploadDriveDocumentTemporary(params: { _id: string; name: string }): Promise<void>;

  export function movePages({
    currentDocument,
    pagesToMove,
    insertBeforePage,
  }: {
    currentDocument: IDocumentBase;
    pagesToMove: number;
    insertBeforePage: number;
  }): Promise<void>;

  export function rotatePages({
    currentDocument,
    pageIndexes,
    angle,
  }: {
    currentDocument: IDocumentBase;
    pageIndexes: number[];
    angle: number;
  }): Promise<void>;

  export function cropPages({
    pageCrops,
    top,
    bottom,
    left,
    right,
    currentDocument,
    croppedAnnotations,
    isUndo,
  }: {
    pageCrops: number[];
    top: number;
    bottom: number;
    left: number;
    right: number;
    currentDocument: IDocumentBase;
    croppedAnnotations: Core.Annotations.Annotation[];
    isUndo: boolean;
  }): Promise<void>;

  export function emitSocketCropPage({
    currentDocument,
    pageCrops,
    cropType,
    top,
    bottom,
    left,
    right,
  }: {
    currentDocument: IDocumentBase;
    pageCrops: number[];
    cropType?: CropTypeOption;
    top: number;
    bottom: number;
    left: number;
    right: number;
  }): Promise<void>;

  export function renameDocument({
    document,
    newName,
    t,
  }: {
    document: IDocumentBase;
    newName: string;
    t: TFunction;
  }): Promise<IDocumentBase>;
}

export default documentServices;
