import {
  S3,
  HeadObjectOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  ObjectCannedACL,
  GetObjectOutput,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import * as mime from 'mime-types';
import { Readable, Stream } from 'stream';
import { v4 as uuid } from 'uuid';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { S3_ORG_DOMAIN_FILE_EXPIRATION } from 'Common/constants/OrganizationConstants';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { TemplateStorageNamespace } from 'CommunityTemplate/communityTemplate.enum';
import { SIGNATURE_MIMETYPE } from 'Document/document.enum';
import { ANNOTATION_IMAGE_BASE_PATH } from 'Document/documentConstant';
import { ISignedUrl } from 'graphql.schema';

import { AwsServiceBase } from './aws.base.service';

const UPLOAD_PRESIGNED_EXPIRED_TIME = 60 * 5;

@Injectable()
export class AwsService extends AwsServiceBase {
  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public uploadDocument(file, keyFile?: string): Promise<any> {
    let key = keyFile;
    if (!keyFile) {
      key = `${uuid()}.${mime.extension(file.mimetype as string)}`;
    }
    const fileInstance = {
      Key: key,
      ACL: ObjectCannedACL.private,
      Bucket: this.getDocumentBucket(),
      Body: file.buffer,
    };
    return this.putObject(fileInstance, this.s3InstanceForDocument());
  }

  public async getPresignedUrlForDocumentImage(mimeType: string, documentId: string): Promise<Record<string, string>> {
    const key = `${uuid()}.${mime.extension(mimeType)}`;
    const command = new PutObjectCommand({
      Key: `${ANNOTATION_IMAGE_BASE_PATH}/${documentId}/${key}`,
      Bucket: this.getDocumentBucket(),
    });
    return {
      url: await getSignedUrl(this.s3InstanceForDocument(), command),
      key,
    };
  }

  public async getPresignedUrlForDocument({
    mimeType,
    options,
    key: keyParam,
  }: {
    mimeType: string;
    options?: Record<string, any>;
    key?: string;
  }): Promise<ISignedUrl> {
    const objectMetadata = await this.getDocumentMetadata(keyParam);
    const versionId = objectMetadata?.VersionId;
    const key = keyParam || `${uuid()}.${mime.extension(mimeType)}`;

    return this.createUploadPresignedUrl({
      key,
      bucket: this.getDocumentBucket(),
      options,
      expiresIn: UPLOAD_PRESIGNED_EXPIRED_TIME,
      versionId,
    });
  }

  public async getPresignedUrlForDocumentUploadToLuminSign({
    mimeType,
    options,
    key: keyParam,
  }: {
    mimeType: string;
    options?: Record<string, any>;
    key?: string;
  }): Promise<ISignedUrl> {
    const key = keyParam || `${uuid()}.${mime.extension(mimeType)}`;
    return this.createUploadPresignedUrl({
      key,
      bucket: this.environmentService.getByKey(EnvConstants.BANANASIGN_TEMP_DOCUMENTS_BUCKET),
      options,
      expiresIn: UPLOAD_PRESIGNED_EXPIRED_TIME,
    });
  }

  public getPresignedUrlForThumbnail({
    mimeType,
    options,
    key: keyParam,
  }: {
    mimeType: string;
    options?: Record<string, any>;
    key?: string;
  }): Promise<ISignedUrl> {
    const key = keyParam || `thumbnails/${uuid()}.${mime.extension(mimeType)}`;
    return this.createUploadPresignedUrl({
      key,
      bucket: this.environmentService.getByKey(
        EnvConstants.S3_RESOURCES_BUCKET,
      ),
      options,
      expiresIn: UPLOAD_PRESIGNED_EXPIRED_TIME,
    });
  }

  /**
   * Use this service for temporary uploaded files, such as upload from static pages
   */
  public async getPresignedUrlForTemporaryUploadFile({
    mimeType,
    options,
    key: keyParam,
    s3Folder,
  }: {
    mimeType: string;
    options?: Record<string, any>;
    key?: string;
    s3Folder?: string;
  }): Promise<ISignedUrl> {
    const key = keyParam || `${uuid()}.${mime.extension(mimeType)}`;
    return this.createUploadPresignedUrl({
      key: `${s3Folder}${key}`,
      bucket: this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES),
      options,
      expiresIn: UPLOAD_PRESIGNED_EXPIRED_TIME,
    });
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public async uploadTempDocumentToBananaSign(file): Promise<any> {
    const key = `${uuid()}.${mime.extension(file.mimetype as string)}`;
    const fileInstance = {
      Key: key,
      ACL: ObjectCannedACL.private,
      Bucket: this.environmentService.getByKey(EnvConstants.BANANASIGN_TEMP_DOCUMENTS_BUCKET),
      Body: file.buffer,
    };
    const response = await this.putObject(fileInstance);
    return response.key;
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public async uploadDocumentWithBuffer(buffer: Buffer, mimetype: string, keyFile?: string): Promise<any> {
    let key = keyFile;
    if (!keyFile) {
      key = `${uuid()}.${mime.extension(mimetype)}`;
    }
    const response = await this.putObject({
      Key: key,
      ACL: 'private',
      Bucket: this.getDocumentBucket(),
      Body: buffer,
    }, this.s3InstanceForDocument());
    return response.key;
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public async uploadTemplateWithBuffer(buffer: Buffer, mimetype: string, ownerType: TemplateStorageNamespace): Promise<any> {
    const key = `${ownerType.toLowerCase()}/${uuid()}.${mime.extension(mimetype)}`;
    const response = await this.putObject({
      Key: key,
      ACL: 'private',
      Bucket: this.environmentService.getByKey(EnvConstants.S3_TEMPLATES_BUCKET),
      Body: buffer,
    });
    return response.key;
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public async uploadThumbnailWithBuffer(buffer: Buffer, mimetype: string, keyFile?: string): Promise<any> {
    const key = keyFile || `thumbnails/${uuid()}.${mime.extension(mimetype)}`;
    const response = await this.putObject({
      Key: key,
      ACL: 'private',
      Bucket: this.environmentService.getByKey(EnvConstants.S3_RESOURCES_BUCKET),
      Body: buffer,
    });
    return response.key;
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public async uploadThumbnailToS3(file, keyFile?: string): Promise<any> {
    const key = keyFile || `thumbnails/${uuid()}.${mime.extension(file.mimetype as string)}`;
    const response = await this.putObject({
      Key: key,
      ACL: 'private',
      Bucket: this.environmentService.getByKey(EnvConstants.S3_RESOURCES_BUCKET),
      Body: file.buffer,
    });
    return response.key;
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public async uploadAttachmentToS3(file): Promise<any> {
    const key = `${uuid()}.${mime.extension(file.mimetype as string)}`;
    const response = await this.putObject({
      Key: key,
      ACL: 'public-read',
      Bucket: this.environmentService.getByKey(EnvConstants.S3_ATTACHMENTS_BUCKET),
      Body: file.buffer,
    });
    return response.key;
  }

  public async uploadFeedbackAttachmentToS3(file: any): Promise<any> {
    const key = `${uuid()}.${mime.extension(file.mimetype as string)}`;
    const response = await this.putObject({
      Key: key,
      ACL: 'public-read',
      Bucket: this.environmentService.getByKey(EnvConstants.S3_ATTACHMENTS_BUCKET),
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    return response.key;
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public async uploadSignature(file, keyFile?: string): Promise<any> {
    const key = keyFile || `signatures/${uuid()}.${mime.extension(file.mimetype as string)}`;
    const response = await this.putObject({
      Key: key,
      ACL: 'private',
      Bucket: this.environmentService.getByKey(EnvConstants.S3_PROFILES_BUCKET),
      Body: file,
    });
    return response.key;
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public async uploadUserAvatar(file: FileData, keyFile?: string): Promise<any> {
    const key = keyFile || `user-profiles/${uuid()}.${mime.extension(file.mimetype)}`;
    const response = await this.putObject({
      Key: key,
      ACL: 'private',
      Bucket: this.environmentService.getByKey(EnvConstants.S3_PROFILES_BUCKET),
      Body: file.fileBuffer,
    });
    return response.key;
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public async uploadTeamAvatarWithBuffer(buffer: Buffer, mimetype: string, keyFile?: string): Promise<any> {
    const key = keyFile || `team-profiles/${uuid()}.${mime.extension(mimetype)}`;
    const response = await this.putObject({
      Key: key,
      ACL: 'private',
      Bucket: this.environmentService.getByKey(EnvConstants.S3_PROFILES_BUCKET),
      Body: buffer,
    });
    return response.key;
  }

  public async uploadOrganizationAvatar(buffer: Buffer, mimetype: string, keyFile?: string): Promise<any> {
    const key = keyFile || `organization-profiles/${uuid()}.${mime.extension(mimetype)}`;
    const response = await this.putObject(
      {
        Key: key,
        ACL: 'private',
        Bucket: this.environmentService.getByKey(EnvConstants.S3_PROFILES_BUCKET),
        Body: buffer,
      },
    );
    return response.key;
  }

  public async uploadSuggestionAvatarByEmailDomain(buffer: Buffer, emailDomain: string, mimetype: string, keyFile?: string): Promise<any> {
    const key = keyFile || `suggestion-avatars/${emailDomain}.${mime.extension(mimetype)}`;
    const response = await this.putObject({
      Key: key,
      ACL: 'private',
      Bucket: this.environmentService.getByKey(EnvConstants.S3_PROFILES_BUCKET),
      Body: buffer,
    });
    return response.key;
  }

  public async applySuggestionAvatar(keyFile: string, mimetype: string): Promise<any> {
    const bucket = this.environmentService.getByKey(EnvConstants.S3_PROFILES_BUCKET);
    const destKey = `organization-profiles/${uuid()}.${mime.extension(mimetype)}`;
    await this.copyObjectS3(`${bucket}/${encodeURIComponent(keyFile)}`, bucket, destKey, false);
    return destKey;
  }

  public async getThumbnailMetadata(keyFile: string): Promise<HeadObjectOutput> {
    if (!keyFile) {
      return null;
    }
    try {
      return this.headObject({
        Key: keyFile,
        Bucket: this.environmentService.getByKey(
          EnvConstants.S3_RESOURCES_BUCKET,
        ),
      });
    } catch {
      throw new Error('File does not exist');
    }
  }

  public async getTemporaryFileMetadata(keyFile): Promise<HeadObjectOutput> {
    if (!keyFile) {
      return null;
    }
    return this.headObject({
      Key: keyFile,
      Bucket: this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES),
    });
  }

  public async getFileMetadata(keyFile, bucket: string): Promise<HeadObjectOutput> {
    if (!keyFile) {
      return null;
    }
    return this.headObject({
      Key: keyFile,
      Bucket: this.environmentService.getByKey(bucket),
    });
  }

  public getSignedUrl({ keyFile, bucketName = this.getDocumentBucket(), versionId }: {
    keyFile: string;
    bucketName?: string;
    versionId?: string;
  }): Promise<string> {
    const s3Instance = this.getS3InstanceForBucket(bucketName);
    return getSignedUrl(s3Instance, new GetObjectCommand({ Key: keyFile, Bucket: bucketName, VersionId: versionId }));
  }

  public async createSignedUrl({ keyFile, bucketName = this.getDocumentBucket() }: {
    keyFile: string;
    bucketName?: string;
  }): Promise<string> {
    const s3Instance = this.getS3InstanceForBucket(bucketName);
    return getSignedUrl(s3Instance, new PutObjectCommand({ Bucket: bucketName, Key: keyFile, ACL: 'private' }));
  }

  public async getStreamFromDocumentBucket(keyFile, range): Promise<Readable> {
    const config = {
      Key: keyFile,
      Bucket: this.getDocumentBucket(),
      Range: range,
    };
    const result = await this.s3InstanceForDocument().getObject(config);
    return result.Body as Readable;
  }

  public async removeFileFromBucket(keyFile: string, bucket: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.s3Instance().headObject({
      Key: keyFile,
      Bucket: this.environmentService.getByKey(bucket),
    });
    await this.deleteObjectAsync(keyFile, bucket);
  }

  public deleteObjectAsync(keyFile: string, bucket: string, s3Instance = this.s3Instance()): Promise<unknown> {
    return new Promise((resolve, reject) => {
      s3Instance.deleteObject({
        Key: keyFile,
        Bucket: this.environmentService.getByKey(bucket),
      }, (err, data) => {
        if (err) {
          this.loggerService.error({
            context: `Delete object on S3 failed, bucket: ${bucket}, keyFile: ${keyFile}}`,
            error: err,
          });
          reject(err);
        }
        this.loggerService.info({
          context: `Deleteobject on S3 successfully, bucket: ${bucket}, keyFile: ${keyFile}}`,
        });
        resolve(data);
      });
    });
  }

  public deleteManyObjectAsync(keyFiles: string[], bucket: string, s3Instance = this.s3Instance()): Promise<unknown> {
    const objects = keyFiles.map((key) => ({ Key: key }));
    return new Promise((resolve, reject) => {
      s3Instance.deleteObjects({
        Bucket: this.environmentService.getByKey(bucket),
        Delete: {
          Objects: objects,
        },
      }, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  public deleteObjectVersionAsync(params: { keyFile: string, bucket?: string, versionId: string, s3Instance?: S3 }): Promise<unknown> {
    const {
      keyFile,
      bucket = this.getDocumentBucket(),
      versionId,
      s3Instance = this.s3Instance(),
    } = params;
    return new Promise((resolve, reject) => {
      s3Instance.deleteObject({
        Key: keyFile,
        Bucket: this.environmentService.getByKey(bucket),
        VersionId: versionId,
      }, (err, data) => {
        if (err) {
          this.loggerService.error({
            context: `Delete object on S3 failed, bucket: ${bucket}, keyFile: ${keyFile}} versionId: {versionId}`,
            error: err,
          });
          reject(err);
        }
        resolve(data);
      });
    });
  }

  public removeDocument(keyFile: string): Promise<any> {
    return this.deleteObjectAsync(keyFile, this.getDocumentBucketKey(), this.s3InstanceForDocument());
  }

  public removeManyDocument(keyFiles: string[]): Promise<any> {
    return this.deleteManyObjectAsync(keyFiles, this.getDocumentBucketKey(), this.s3InstanceForDocument());
  }

  public removeThumbnail(keyFile: string): Promise<any> {
    return this.deleteObjectAsync(keyFile, EnvConstants.S3_RESOURCES_BUCKET);
  }

  public removeManyThumbnail(keyFiles: string[]): Promise<any> {
    return this.deleteManyObjectAsync(keyFiles, EnvConstants.S3_RESOURCES_BUCKET);
  }

  public removeFileQuestion(keyFile: string): Promise<any> {
    return this.deleteObjectAsync(keyFile, EnvConstants.S3_COMMUNITY_RESOURCES_BUCKET);
  }

  public copyObjectS3(copySource, bucket, keyFile: string, isPublic?: boolean, s3Instance = this.s3Instance()): Promise<any> {
    return new Promise((resolve, reject) => {
      s3Instance.copyObject({
        Key: keyFile,
        ACL: isPublic ? 'public-read' : 'private',
        CopySource: copySource,
        Bucket: bucket,
      }, (err) => {
        if (err) {
          reject(err);
        }
        resolve(keyFile);
      });
    });
  }

  public async putFileToTemporaryBucket(keyFile: string, body: Buffer | Stream | string, tagging?: string, contentType?: string) : Promise<string> {
    try {
      const params: PutObjectCommandInput = {
        Key: keyFile,
        ACL: 'private',
        Bucket: this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES),
        Body: body as any,
        ...(contentType && { ContentType: contentType }),
        ...(tagging && { Tagging: tagging }),
      };
      const paralelUpload = new Upload({
        client: this.s3Instance(),
        params,
      });
      await paralelUpload.done();
      return keyFile;
    } catch (err) {
      this.loggerService.error({
        context: `Put file to temporary bucket failed, keyFile: ${keyFile}}`,
      });
      throw err;
    }
  }

  public getSignedUrlTemporaryFile(keyFile: string) : Promise<string> {
    const config = {
      Key: keyFile,
      Bucket: this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES),
      ResponseExpires: new Date(Date.now() + S3_ORG_DOMAIN_FILE_EXPIRATION),
    };
    return getSignedUrl(this.s3Instance(), new GetObjectCommand(config));
  }

  public removeTemplate(keyFile: string): Promise<any> {
    return this.deleteObjectAsync(keyFile, EnvConstants.S3_TEMPLATES_BUCKET);
  }

  async getDocumentSize(keyFile: string): Promise<number> {
    return new Promise((resolve) => {
      const config = {
        Key: keyFile,
        Bucket: this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET),
      };
      this.s3InstanceForDocument().headObject(config, (error, data) => {
        if (error) {
          resolve(0);
        } else {
          resolve(data.ContentLength as number);
        }
      });
    });
  }

  public async getPresignedUrlForSignature(mimeType: SIGNATURE_MIMETYPE): Promise<Record<string, string>> {
    const fileNameS3 = uuid();
    const key = `signatures/${fileNameS3}.${mime.extension(mimeType as unknown as string)}`;
    const { url } = await this.createUploadPresignedUrl({
      key,
      bucket: this.getProfileBucket(),
      expiresIn: UPLOAD_PRESIGNED_EXPIRED_TIME,
      options: {
        ContentType: mimeType,
      },
    });
    return { key, url };
  }

  public async getTemporaryDocumentPresignedUrlForConvertFile({
    mimeType,
    options,
    key: keyParam,
  }: {
    mimeType: string;
    options?: Record<string, any>;
    key?: string;
  }): Promise<ISignedUrl> {
    const prefixEnv = this.environmentService.getByKey(EnvConstants.ENV);
    const key = keyParam || `conversion/${prefixEnv}/${uuid()}.${mime.extension(mimeType)}`;
    return this.createUploadPresignedUrl({
      key,
      bucket: this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES),
      expiresIn: UPLOAD_PRESIGNED_EXPIRED_TIME,
      options: { ...options, Tagging: CommonConstants.EXPIRE_OBJECT_TAG },
    });
  }

  public async getOCRDocumentPresignedUrl({
    position,
    key: keyParam,
  }: {
    position: number;
    key: string;
  }): Promise<ISignedUrl> {
    const key = keyParam;
    const bucket = this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES);
    const s3Instance: S3 = this.getS3InstanceForBucket(bucket);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ACL: 'private',
      Tagging: CommonConstants.EXPIRE_OBJECT_TAG,
      Metadata: {
        position: position.toString(),
        env: this.environmentService.getByKey(EnvConstants.ENV),
      },
    });

    const signedUrl = await getSignedUrl(s3Instance, command, {
      unhoistableHeaders: new Set(['x-amz-meta-position', 'x-amz-meta-env']),
      signableHeaders: new Set(['x-amz-meta-position', 'x-amz-meta-env']),
    });
    return {
      url: signedUrl,
      fields: {
        key,
      },
    };
  }

  public async getListObjectVersions(input: { key: string, bucket?: string }) {
    const { bucket = this.getDocumentBucket(), key } = input;
    const s3Instance = this.getS3InstanceForBucket(bucket);
    return s3Instance.listObjectVersions({
      Bucket: bucket,
      Prefix: key,
    });
  }

  public async createPresignedFormFieldDetectionUrl(key: string, metadata?: Record<string, any>): Promise<ISignedUrl> {
    const bucket = this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES);
    const s3Instance: S3 = this.getS3InstanceForBucket(bucket);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ACL: 'private',
      ...(metadata && { Metadata: metadata }),
    });
    const signedUrl = await getSignedUrl(s3Instance, command);
    return {
      url: signedUrl,
      fields: {
        key,
      },
    };
  }

  public async logDataMigrationBatch({
    migrationName,
    batchId,
    batchInfo,
    batchError,
  }: {
    migrationName: string;
    batchId: string;
    batchInfo: Record<string, any>;
    batchError: Record<string, any>;
  }) {
    const timestamp = new Date().toUTCString();
    try {
      this.loggerService.info({
        context: migrationName,
        extraInfo: batchInfo,
      });

      const env = this.environmentService.getByKey(EnvConstants.ENV);
      const keyFile = `logs/${migrationName}/${env}/ok-${timestamp}-${batchId}.json`;
      const body = JSON.stringify({ ...batchInfo }, null, 2);
      await this.putFileToTemporaryBucket(keyFile, body, null, 'application/json');

      if (Object.keys(batchError).length) {
        this.loggerService.error({
          context: migrationName,
          extraInfo: { batchId, batchError },
        });
        const errorKeyFile = `logs/${migrationName}/${env}/fail-${timestamp}-${batchId}.json`;
        const errorBody = JSON.stringify({ ...batchError }, null, 2);
        await this.putFileToTemporaryBucket(errorKeyFile, errorBody, null, 'application/json');
      }
    } catch (error) {
      this.loggerService.error({
        context: migrationName,
        error,
      });
    }
  }

  public async getFileFromTemporaryBucket(keyFile): Promise<GetObjectOutput> {
    if (!keyFile) {
      return null;
    }
    return this.s3Instance().getObject({
      Key: keyFile,
      Bucket: this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES),
    });
  }

  public async uploadUserAvatarWithBuffer(buffer: Buffer, mimetype: string, keyFile?: string): Promise<any> {
    const key = keyFile || `user-profiles/${uuid()}.${mime.extension(mimetype)}`;
    const response = await this.putObject({
      Key: key,
      ACL: 'private',
      Bucket: this.environmentService.getByKey(EnvConstants.S3_PROFILES_BUCKET),
      Body: buffer,
    });
    return response.key;
  }
}
