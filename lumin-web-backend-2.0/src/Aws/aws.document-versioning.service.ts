import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import * as mime from 'mime-types';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { MIME_TYPE } from 'Common/constants/DocumentConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { ISignedUrl } from 'graphql.schema';

import { AwsServiceBase } from './aws.base.service';

@Injectable()
export class AwsDocumentVersioningService extends AwsServiceBase {
  private fileContentBucketName = this.getDocumentBucket();

  private annotationHistoryBucketName = this.environmentService.getByKey(
    EnvConstants.S3_ANNOTATIONS_HISTORY_BUCKET,
  );

  private documentExpirationTime = 30 * 60;

  private annotationExpirationTime = 5 * 60;

  private generateAnnotationHistoryKey({
    documentId,
    versionId,
  }: {
    documentId: Types.ObjectId;
    versionId?: string;
  }) {
    const prefix = 'backup-annotation';
    const env = this.environmentService.getByKey(EnvConstants.ENV);
    const versionSegment = versionId ? `/${versionId}` : '';
    const mimeType = mime.extension(MIME_TYPE.XML);

    return `${prefix}/${env}/${documentId}${versionSegment}/${uuidv4()}.${mimeType}`;
  }

  async getHeadObject(objectKey: string) {
    const response = await this.getS3InstanceForDevelopment().headObject({
      Bucket: this.annotationHistoryBucketName,
      Key: objectKey,
    });
    return response;
  }

  async createUploadAnnotationPresignedUrl({
    documentId,
    versionId,
    userId,
  }: {
    documentId: Types.ObjectId;
    versionId?: string;
    userId: Types.ObjectId;
  }): Promise<ISignedUrl> {
    const presignedResult = await this.createUploadPresignedUrl({
      bucket: this.annotationHistoryBucketName,
      key: this.generateAnnotationHistoryKey({ documentId, versionId }),
      expiresIn: this.annotationExpirationTime,
      options: {
        Metadata: {
          document_id: documentId.toString(),
          version_id: versionId,
          user_id: userId,
        },
      },
      s3Instance: process.env.LUMIN_ENABLE_S3_INSTANCE_ON_DEVELOPMENT ? this.getS3InstanceForDevelopment() : null,
    });

    return presignedResult;
  }

  async generateGetVersionPresignedUrl({
    versionId,
    documentRemoteId,
    annotationPath,
  }: {
    versionId: string;
    documentRemoteId: string;
    annotationPath: string;
  }): Promise<{
    fileContentPresignedUrl: string;
    annotationPresignedUrl: string;
  }> {
    const s3DocumentInstance = this.s3InstanceForDocument();
    const fileContentPresignedUrlPromise = getSignedUrl(
      s3DocumentInstance,
      new GetObjectCommand({
        Bucket: this.fileContentBucketName,
        Key: documentRemoteId,
        VersionId: versionId,
      }),
    );
    const annotationPresignedUrlPromise = annotationPath ? getSignedUrl(
      this.getS3InstanceForDevelopment(),
      new GetObjectCommand({
        Bucket: this.annotationHistoryBucketName,
        Key: annotationPath,
      }),
    ) : Promise.resolve(null);

    const [fileContentPresignedUrl, annotationPresignedUrl] = await Promise.all(
      [fileContentPresignedUrlPromise, annotationPresignedUrlPromise],
    );

    return { fileContentPresignedUrl, annotationPresignedUrl };
  }

  async getRecentDocumentFileVersions(keyFile: string) {
    return super.getRecentVersions(this.s3InstanceForDocument(), { bucket: this.fileContentBucketName, keyFile, maxKeys: 2 });
  }
}
