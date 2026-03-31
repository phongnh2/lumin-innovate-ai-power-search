import {
  S3,
  HeadObjectOutput,
  PutObjectCommand,
  HeadObjectCommandInput,
  PutObjectCommandInput,
  PutObjectOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { ISignedUrl } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';

@Injectable()
export class AwsServiceBase {
  protected s3: S3;

  protected s3Document: S3;

  protected s3Development: S3;

  protected s3Profile: S3;

  protected s3TemporaryFiles: S3;

  constructor(
    protected readonly environmentService: EnvironmentService,
    protected readonly loggerService: LoggerService,
  ) {
    this.s3Development = null;
  }

  /**
   * @description S3 instance used for document versioning; for development use only.
   */
  protected getS3InstanceForDevelopment(): S3 {
    if (!process.env.LUMIN_ENABLE_S3_INSTANCE_ON_DEVELOPMENT) {
      return this.s3Instance();
    }
    if (!this.s3Development) {
      this.s3Development = new S3({
        region: process.env.LUMIN_S3_REGION_ON_DEVELOPMENT,
        credentials: {
          accessKeyId: process.env.LUMIN_S3_ACCESS_KEY_ON_DEVELOPMENT,
          secretAccessKey: process.env.LUMIN_S3_SECRET_KEY_ON_DEVELOPMENT,
        },
      });
    }
    return this.s3Development;
  }

  protected loadDevelopmentConfig() {
    return {
      region: this.environmentService.getByKey(EnvConstants.S3_REGION),
      credentials: {
        accessKeyId: this.environmentService.getByKey(EnvConstants.S3_ACCESS_KEY),
        secretAccessKey: this.environmentService.getByKey(EnvConstants.S3_SECRET_KEY),
      },
    };
  }

  protected getDocumentBucket() {
    return this.environmentService.getByKey(this.getDocumentBucketKey());
  }

  protected getDocumentBucketKey() {
    return EnvConstants.S3_DOCUMENTS_BUCKET;
  }

  protected getTemporaryFilesBucket() {
    return this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES);
  }

  protected getProfileBucket() {
    return this.environmentService.getByKey(EnvConstants.S3_PROFILES_BUCKET);
  }

  protected getS3InstanceForBucket(bucket?: string): S3 {
    switch (bucket) {
      case this.getDocumentBucket():
        return this.s3InstanceForDocument();
      case this.getProfileBucket():
        return this.s3InstanceProfile();
      case this.getTemporaryFilesBucket():
        return this.s3InstanceForTemporaryFiles();
      default:
        return this.s3Instance();
    }
  }

  protected async createUploadPresignedUrl({
    key,
    bucket,
    acl = 'private',
    options,
    expiresIn,
    s3Instance: s3InstanceParam,
    versionId,
  }: {
    key: string;
    bucket: string;
    options?: Record<string, any>;
    isDocumentBucket?: boolean;
    acl?: 'private' | 'public-read';
    expiresIn?: number;
    s3Instance?: S3,
    versionId?: string;
  }): Promise<ISignedUrl> {
    const s3Instance: S3 = s3InstanceParam || this.getS3InstanceForBucket(bucket);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ACL: acl,
      ...options,
    });
    const signedUrl = await getSignedUrl(s3Instance, command, expiresIn && { expiresIn });
    return {
      url: signedUrl,
      fields: {
        key,
        ...(versionId && { versionId }),
      },
    };
  }

  public s3Instance(): S3 {
    if (!this.s3) {
      this.s3 = new S3(this.environmentService.isDevelopment ? this.loadDevelopmentConfig() : {
        region: 'us-east-1',
      });
    }
    return this.s3;
  }

  public s3InstanceProfile() {
    if (!this.s3Profile) {
      this.s3Profile = new S3({
        region: 'us-east-1',
        useAccelerateEndpoint: true,
        ...this.environmentService.isDevelopment ? this.loadDevelopmentConfig() : {},
      });
    }
    return this.s3Profile;
  }

  public s3InstanceForTemporaryFiles(): S3 {
    if (this.s3TemporaryFiles) {
      return this.s3TemporaryFiles;
    }

    const config = this.environmentService.isDevelopment
      ? this.loadDevelopmentConfig()
      : {
        region: 'us-east-1',
        useAccelerateEndpoint: true,
      };

    this.s3TemporaryFiles = new S3(config);
    return this.s3TemporaryFiles;
  }

  headObject(config: HeadObjectCommandInput, instance = this.s3Instance()): Promise<HeadObjectOutput> {
    return instance.headObject(config);
  }

  async putObject(config: PutObjectCommandInput, instance = this.s3Instance()): Promise<PutObjectOutput & { key: string }> {
    const response = await instance.putObject(config);
    return { ...response, key: config.Key };
  }

  public async getDocumentMetadata(
    keyFile: string,
    options?: { bucketName?: string; errorContext?: string; versionId?: string },
  ): Promise<HeadObjectOutput> {
    const { bucketName = this.getDocumentBucket(), errorContext, versionId } = options || {};
    if (!keyFile) {
      return null;
    }
    try {
      this.loggerService.info({
        context: this.getDocumentMetadata.name,
        extraInfo: {
          objectKey: keyFile,
          bucketName,
          versionId,
        },
      });
      const metadata = await this.headObject(
        {
          Key: keyFile,
          Bucket: bucketName,
          ...(versionId && { VersionId: versionId }),
        },
        this.s3InstanceForDocument(),
      );
      return metadata;
    } catch (err) {
      this.loggerService.error({
        ...(errorContext && { context: errorContext }),
        message: 'Failed to get headObject',
        error: err,
      });
      return null;
    }
  }

  /**
   * !!! Attention: Currently, we only use this instance with document and profile bucket
   */
  public s3InstanceForDocument(): S3 {
    if (!this.s3Document) {
      this.s3Document = new S3({
        // signatureVersion: 'v4' is default of aws-sdk v3
        region: this.environmentService.getByKey(EnvConstants.BUCKET_REGION),
        useAccelerateEndpoint: true,
        ...this.environmentService.isDevelopment ? this.loadDevelopmentConfig() : {},
      });
    }
    return this.s3Document;
  }

  public async getRecentVersions(s3Instance: S3, { keyFile, bucket, maxKeys } : { keyFile: string, bucket: string, maxKeys?: number }) {
    if (!keyFile) {
      return null;
    }
    const versions = await s3Instance.listObjectVersions({
      Bucket: bucket,
      MaxKeys: maxKeys || 1,
      Prefix: keyFile,
    });
    return versions.Versions;
  }
}
