import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl as getSignedUrlPresigner } from '@aws-sdk/s3-request-presigner';

import { environment } from '@/configs/environment';

type CloudStorageOpts = {
  region: string;
  profilesBucket: string;
  publicResourcesBucket: string;
  accessKeyId: string;
  secretAccessKey: string;
};
export class CloudStorage {
  private readonly s3: S3;

  private profilesBucket: string;
  private publicResourcesBucket: string;
  constructor(opts: CloudStorageOpts) {
    this.profilesBucket = opts.profilesBucket;
    this.publicResourcesBucket = opts.publicResourcesBucket;
    const useDefaultProvider = !opts.accessKeyId && !opts.secretAccessKey;
    this.s3 = new S3({
      region: opts.region,
      credentials: useDefaultProvider
        ? undefined
        : {
            accessKeyId: opts.accessKeyId,
            secretAccessKey: opts.secretAccessKey
          }
    });
  }

  /**
   *
   * @param stream file input stream to be uploaded
   * @param filename the filename that will be used to store the remote object
   * @returns remote path of the uploaded object (key of S3 Object)
   */
  async uploadToProfiles(buffer: Buffer, filename: string, mime?: string): Promise<string> {
    const key = `user-profiles/${filename}`;
    await this.s3.putObject({
      ContentType: mime ?? 'application/octet-stream',
      Bucket: this.profilesBucket,
      Key: key,
      Body: buffer
    });
    return key;
  }

  async removeFromProfiles(path: string): Promise<void> {
    await this.s3.deleteObject({
      Bucket: this.profilesBucket,
      Key: path
    });
  }

  async getLogoUri(fileId: string): Promise<string> {
    const params = {
      Bucket: this.publicResourcesBucket,
      Key: fileId
    };
    return getSignedUrlPresigner(this.s3 as any, new GetObjectCommand(params) as any, {
      expiresIn: 60 * 15 // 15 minutes
    });
  }
}

export const storage = new CloudStorage({
  profilesBucket: environment.public.aws.s3ProfilesBucket,
  publicResourcesBucket: environment.public.aws.s3PublicResourcesBucket,
  region: environment.public.aws.region,
  accessKeyId: environment.internal.aws.s3AccessKeyId,
  secretAccessKey: environment.internal.aws.s3SecretAccessKey
});
