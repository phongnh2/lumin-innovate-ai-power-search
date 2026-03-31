import { GetPresignedUrlForUploadDocPayload } from 'graphql.schema';

export interface IVerifyUploadDataPayload {
  documentRemoteId?: string;
  thumbnailRemoteId?: string;
  avatarRemoteId?: string;
  documentName?: string;
  versionId?: string;
}
export interface IVerifyUploadSignatureDataPayload {
  userId?: string,
  signatureRemoteId?: string
}

export type IGetPresignedUrlForUploadFilePayload = Pick<GetPresignedUrlForUploadDocPayload, 'document' | 'thumbnail'>;

export interface IS3FileMetadata {
  ContentType: string,
  ContentLength: number,
}
