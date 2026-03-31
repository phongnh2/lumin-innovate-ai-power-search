import { Injectable } from '@nestjs/common';

import { AwsService } from 'Aws/aws.service';

@Injectable()
export class S3GrpcService {
  constructor(
    private readonly awsService: AwsService,
  ) {}

  async generateGetObjectUrl({ key, bucketName, versionId }: { key: string, bucketName: string, versionId?: string }) {
    const presignedUrl = await this.awsService.getSignedUrl({ keyFile: key, bucketName, versionId });
    return {
      presignedUrl,
    };
  }

  async generatePutObjectUrl({ key, bucketName }: { key: string, bucketName: string }) {
    const presignedUrl = await this.awsService.createSignedUrl({ keyFile: key, bucketName });
    return {
      presignedUrl,
    };
  }

  async getObjectMetadata({ key, bucketName, versionId }: { key: string, bucketName: string, versionId?: string }) {
    const metadata = await this.awsService.getDocumentMetadata(key, { bucketName, versionId });
    return metadata || { ETag: null };
  }
}
