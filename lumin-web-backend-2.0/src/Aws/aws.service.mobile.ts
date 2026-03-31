import { ObjectCannedACL, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import * as mime from 'mime-types';
import { v4 as uuid } from 'uuid';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';

import { AwsService } from './aws.service';

@Injectable()
export class AwsServiceMobile {
  private s3;

  private s3Document;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly awsService: AwsService,
  ) {
  }

  /**
   * @deprecated Avoid using this service to upload file to server directly
   */
  public uploadDocument(file, keyFile?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let key = keyFile;
      if (!keyFile) {
        key = `${uuid()}.${mime.extension(file.mimetype as string)}`;
      }
      const fileInstance = {
        Key: key,
        ACL: ObjectCannedACL.private,
        Bucket: this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET),
        Body: file.buffer,
      };

      this.awsService.s3Instance().putObject(fileInstance, (err, _data) => {
        if (err) {
          reject(err);
        }
        resolve(key);
      });
    });
  }

  public async getPresignedUrlForDocument(mimeType: string): Promise<Record<string, string>> {
    const key = `${uuid()}.${mime.extension(mimeType)}`;
    const command = new PutObjectCommand({
      Key: key,
      Bucket: this.environmentService.getByKey(EnvConstants.S3_DOCUMENTS_BUCKET),
    });
    return {
      url: await getSignedUrl(this.awsService.s3InstanceForDocument(), command),
      key,
    };
  }
}
