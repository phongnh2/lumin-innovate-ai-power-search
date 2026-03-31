/* eslint-disable no-use-before-define */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsService } from 'Aws/aws.service';

import { INVALID_ENCODED_DATA } from 'constant';
import { EnvironmentService } from 'Environment/environment.service';
import { GetPresignedUrlForUploadDocInput, ISignedUrl } from 'graphql.schema';
import { RedisService } from 'Microservices/redis/redis.service';

import { UploadDocMetaKey } from './upload.constant';
import { IGetPresignedUrlForUploadFilePayload, IVerifyUploadDataPayload, IVerifyUploadSignatureDataPayload } from './upload.interface';

interface IGetPresignedParams {
  mimeType: string;
  options: Record<string, any>;
  key?: string;
  s3Folder?: string;
}

interface IGetPresignedUrlParams {
  mimeType: string;
  key?: string;
  s3Folder?: string;
  excuter: (params: IGetPresignedParams) => Promise<ISignedUrl>;
}

interface IGetPresignedParams {
  key?: string;
  mimeType: string;
  options: Record<string, any>;
}

interface IPresignedParams {
  mimeType: string;
  /**
   * @description File size limit in bytes
   */
  fileSizeLimit?: number;
  key?: string;
  metadata?: Record<string, string>
}

interface IGetPresignedUrlParams {
  mimeType: string;
  key?: string;
  excuter: (params: IGetPresignedParams) => Promise<ISignedUrl>;
  options?: Record<string, unknown>
}

@Injectable()
export class UploadService {
  constructor(
    private readonly awsService: AwsService,
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
    private readonly redisService: RedisService,
  ) {}

  private readonly tokenExpiredTime = '10m';

  private async getPresignedUrl({
    mimeType,
    key,
    s3Folder,
    excuter,
    options = {},
  }: IGetPresignedUrlParams): Promise<ISignedUrl> {
    const { url, fields } = await excuter({
      mimeType,
      key,
      s3Folder,
      options,
    });

    return {
      url,
      fields,
    };
  }

  async verifyUploadData(userId: string, data: string): Promise<IVerifyUploadDataPayload> {
    try {
      const decodedData = this.jwtService.verify(data);
      if (!decodedData || decodedData.userId !== userId) {
        throw new Error(INVALID_ENCODED_DATA);
      }
      const existKey = await this.redisService.setKeyIfNotExist(data, '1', '600000');
      if (!existKey) {
        throw new Error(INVALID_ENCODED_DATA);
      }
      return decodedData;
    } catch (error) {
      throw new Error(INVALID_ENCODED_DATA);
    }
  }

  verifyUploadSignatureData(userId: string, data: string): IVerifyUploadSignatureDataPayload {
    try {
      const decodedData = this.jwtService.verify(data);
      if (!decodedData || decodedData.userId !== userId || !decodedData.signatureRemoteId) {
        throw new Error(INVALID_ENCODED_DATA);
      }
      return decodedData;
    } catch (error) {
      throw new Error(INVALID_ENCODED_DATA);
    }
  }

  verifyUploadTemporaryDocumentData(userId: string, documentId: string, data: string): IVerifyUploadDataPayload {
    try {
      const decodedData = this.jwtService.verify(data);
      if (!decodedData || decodedData.userId !== userId || decodedData.documentId !== documentId) {
        throw new Error(INVALID_ENCODED_DATA);
      }
      return decodedData;
    } catch (error) {
      throw new Error(INVALID_ENCODED_DATA);
    }
  }

  createToken(data: Record<string, string>, expriesIn?: string): string {
    return this.jwtService.sign(
      data,
      {
        expiresIn: expriesIn ?? this.tokenExpiredTime,
      },
    );
  }

  async getDocumentPresignedUrl({
    mimeType,
    key,
    metadata,
  }: IPresignedParams): Promise<ISignedUrl> {
    return this.getPresignedUrl({
      key,
      mimeType,
      excuter: (params) => this.awsService.getPresignedUrlForDocument(params),
      options: {
        Metadata: metadata,
      },
    });
  }

  async getDocumentUploadToLuminSignPresignedUrl({
    mimeType,
    key,
  }: IPresignedParams): Promise<ISignedUrl> {
    return this.getPresignedUrl({
      key,
      mimeType,
      excuter: (params) => this.awsService.getPresignedUrlForDocumentUploadToLuminSign(params),
    });
  }

  async getThumbnailPresignedUrl({ mimeType, key }: IPresignedParams): Promise<ISignedUrl> {
    return this.getPresignedUrl({
      mimeType,
      key,
      excuter: (params) => this.awsService.getPresignedUrlForThumbnail(params),
    });
  }

  async getPresignedUrlForUploadDoc(input: GetPresignedUrlForUploadDocInput): Promise<IGetPresignedUrlForUploadFilePayload> {
    const {
      documentMimeType,
      thumbnailMimeType,
      thumbnailKey,
      documentKey,
      uploadDocFrom,
    } = input;
    const [documentPresignedResult, thumbnailPresignedResult] = await Promise.all([
      this.getDocumentPresignedUrl({
        mimeType: documentMimeType,
        key: documentKey,
        metadata: {
          [UploadDocMetaKey.UploadDocFrom]: uploadDocFrom,
        },
      }),
      thumbnailMimeType ? this.getThumbnailPresignedUrl({ mimeType: thumbnailMimeType, key: thumbnailKey }) : null,
    ]);
    return { document: documentPresignedResult, thumbnail: thumbnailPresignedResult };
  }

  async getPresignedUrlForStaticToolUpload({
    mimeType,
    key,
  }: IPresignedParams): Promise<ISignedUrl> {
    return this.getPresignedUrl({
      key,
      mimeType,
      s3Folder: this.environmentService.getByKey(EnvConstants.S3_STATIC_TOOL_FILE_FOLDER),
      excuter: (params: IGetPresignedParams) => this.awsService.getPresignedUrlForTemporaryUploadFile(params),
    });
  }

  async getTemporaryDocumentPresignedUrlForConvertFile({
    mimeType,
    key,
    metadata,
  }: IPresignedParams): Promise<ISignedUrl> {
    return this.getPresignedUrl({
      key,
      mimeType,
      options: {
        Metadata: metadata,
      },
      excuter: (params) => this.awsService.getTemporaryDocumentPresignedUrlForConvertFile(params),
    });
  }
}
