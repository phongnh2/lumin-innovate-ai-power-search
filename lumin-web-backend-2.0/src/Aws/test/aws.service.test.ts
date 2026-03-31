import { Test, TestingModule } from '@nestjs/testing';
import { AwsService } from '../aws.service';
import { AwsServiceBase } from '../aws.base.service';
import { EnvConstants } from '../../Common/constants/EnvConstants';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(() => ({
    done: jest.fn().mockResolvedValue(true),
  })),
}));

describe('AwsService – full branch coverage', () => {
  let service: AwsService;

  const mockS3 = {
    putObject: jest.fn(),
    getObject: jest.fn(),
    headObject: jest.fn(),
    deleteObject: jest.fn(),
    deleteObjects: jest.fn(),
    copyObject: jest.fn(),
    listObjectVersions: jest.fn(),
  };

  const mockEnvService = {
    getByKey: jest.fn((key) => key),
  };

  const mockLogger = {
    error: jest.fn(),
    info: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsService,
        {
          provide: AwsServiceBase,
          useValue: {},
        },
      ],
    })
      .overrideProvider(AwsService)
      .useFactory({
        factory: () => {
          const svc = new AwsService(mockEnvService as any, mockLogger as any);
          // @ts-ignore
          svc.environmentService = mockEnvService;
          // @ts-ignore
          svc.loggerService = mockLogger;
          // @ts-ignore
          svc.s3Instance = () => mockS3;
          // @ts-ignore
          svc.s3InstanceForDocument = () => mockS3;
          // @ts-ignore
          svc.getS3InstanceForBucket = () => mockS3;
          // @ts-ignore
          svc.getDocumentBucket = () => 'DOCUMENT_BUCKET';
          // @ts-ignore
          svc.getProfileBucket = () => 'PROFILE_BUCKET';
          // @ts-ignore
          svc.getDocumentBucketKey = () => EnvConstants.S3_DOCUMENTS_BUCKET;
          // @ts-ignore
          svc.createUploadPresignedUrl = jest.fn().mockResolvedValue({
            url: 'signed-url',
            fields: { key: 'file-key' },
          });
          // @ts-ignore
          svc.putObject = jest.fn().mockResolvedValue({ key: 'uploaded-key' });
          return svc;
        },
      })
      .compile();

    service = module.get(AwsService);
  });

  it('getListObjectVersions – should call listObjectVersions with default bucket', async () => {
    const mockResponse = { Versions: [] };
    // @ts-ignore
    service.getS3InstanceForBucket = jest.fn().mockReturnValue({
      listObjectVersions: jest.fn().mockResolvedValue(mockResponse),
    });

    const key = 'file.txt';
    const res = await service.getListObjectVersions({ key });

    expect((service as any).getS3InstanceForBucket).toHaveBeenCalledWith((service as any).getDocumentBucket());
    expect(res).toBe(mockResponse);
  });

  it('putFileToTemporaryBucket – should include Tagging when provided', async () => {
    const keyFile = 'temp/file.txt';
    const body = Buffer.from('data');
    const tagging = 'key1=value1&key2=value2';

    (Upload as unknown as jest.Mock).mockImplementationOnce(({ params }) => {
      expect(params.Tagging).toBe(tagging);
      return { done: jest.fn().mockResolvedValue(true) };
    });

    const res = await service.putFileToTemporaryBucket(keyFile, body, tagging);

    expect(res).toBe(keyFile);
  });

  it('getTemporaryDocumentPresignedUrlForConvertFile – without key', async () => {
    const mimeType = 'application/pdf';
    const options = { ACL: 'private' };
    jest.spyOn((service as any).environmentService, 'getByKey').mockImplementation((key) => key);
    (service as any).createUploadPresignedUrl = jest.fn().mockResolvedValue({ url: 'signed-url', fields: { key: 'file-key' } });

    const res = await service.getTemporaryDocumentPresignedUrlForConvertFile({ mimeType, options });

    expect((service as any).createUploadPresignedUrl).toHaveBeenCalled();
    expect(res.url).toBe('signed-url');
  });

  it('getTemporaryDocumentPresignedUrlForConvertFile – with key', async () => {
    const mimeType = 'application/pdf';
    const keyParam = 'conversion/custom/file.pdf';
    (service as any).createUploadPresignedUrl = jest.fn().mockResolvedValue({ url: 'signed-url', fields: { key: keyParam } });

    const res = await service.getTemporaryDocumentPresignedUrlForConvertFile({ mimeType, key: keyParam });

    expect((service as any).createUploadPresignedUrl).toHaveBeenCalled();
    expect(res.url).toBe('signed-url');
  });


  it('getListObjectVersions – should call listObjectVersions with custom bucket', async () => {
    const mockResponse = { Versions: [] };
    const bucket = 'CUSTOM_BUCKET';
    // @ts-ignore
    service.getS3InstanceForBucket = jest.fn().mockReturnValue({
      listObjectVersions: jest.fn().mockResolvedValue(mockResponse),
    });

    const key = 'file.txt';
    const res = await service.getListObjectVersions({ key, bucket });

    expect((service as any).getS3InstanceForBucket).toHaveBeenCalledWith(bucket);
    expect(res).toBe(mockResponse);
  });


  it('uploadUserAvatarWithBuffer – without keyFile', async () => {
    const buffer = Buffer.from('avatar-data');
    const mimetype = 'image/png';

    const res = await service.uploadUserAvatarWithBuffer(buffer, mimetype);

    expect(service.putObject).toHaveBeenCalledWith({
      Key: expect.stringMatching(/^user-profiles\/.+\.png$/),
      ACL: 'private',
      Bucket: EnvConstants.S3_PROFILES_BUCKET,
      Body: buffer,
    });

    expect(res).toBe('uploaded-key');
  });

  it('uploadUserAvatarWithBuffer – with keyFile', async () => {
    const buffer = Buffer.from('avatar-data');
    const mimetype = 'image/png';
    const keyFile = 'user-profiles/custom.png';

    const res = await service.uploadUserAvatarWithBuffer(buffer, mimetype, keyFile);

    expect(service.putObject).toHaveBeenCalledWith({
      Key: keyFile,
      ACL: 'private',
      Bucket: EnvConstants.S3_PROFILES_BUCKET,
      Body: buffer,
    });

    expect(res).toBe('uploaded-key');
  });

  it('should handle batchError correctly when it throws inside logger', async () => {
    mockLogger.error.mockImplementationOnce(() => {
      throw new Error('logger failed');
    });

    await expect(
      service.logDataMigrationBatch({
        migrationName: 'migration-test',
        batchId: 'batch-1',
        batchInfo: { ok: true },
        batchError: { err: true },
      }),
    ).not.toBeNull();
  });

  describe('AwsService – deleteObjectVersionAsync', () => {
    it('should call s3Instance.deleteObject with correct params and resolve', async () => {
      const mockData = { Deleted: true };
      mockS3.deleteObject.mockImplementation((_params, cb) => cb(null, mockData));

      const res = await service.deleteObjectVersionAsync({
        keyFile: 'file.txt',
        versionId: 'v1',
      });

      expect(mockS3.deleteObject).toHaveBeenCalled();

      expect(res).toBe(mockData);
    });

    it('should reject and log error if deleteObject fails', async () => {
      const error = new Error('S3 error');
      mockS3.deleteObject.mockImplementation((_params, cb) => cb(error, null));

      await expect(
        service.deleteObjectVersionAsync({
          keyFile: 'file.txt',
          versionId: 'v1',
        }),
      ).rejects.toThrow('S3 error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.stringContaining('Delete object on S3 failed'),
          error,
        }),
      );
    });

    it('should use provided s3Instance and bucket', async () => {
      const mockCustomS3 = { deleteObject: jest.fn((_params, cb) => cb(null, { ok: true })) };
      const res = await service.deleteObjectVersionAsync({
        keyFile: 'file.txt',
        versionId: 'v1',
        bucket: 'CUSTOM_BUCKET',
        s3Instance: mockCustomS3 as any,
      });

      expect(mockCustomS3.deleteObject).toHaveBeenCalledWith(
        {
          Key: 'file.txt',
          Bucket: 'CUSTOM_BUCKET',
          VersionId: 'v1',
        },
        expect.any(Function),
      );

      expect(res).toEqual({ ok: true });
    });
  });


  describe('AwsService – getFileFromTemporaryBucket', () => {
    it('should return null if keyFile is null', async () => {
      const res = await service.getFileFromTemporaryBucket(null);
      expect(res).toBeNull();
    });

    it('should call s3Instance().getObject with correct params', async () => {
      const mockResult = { Body: Buffer.from('data') };
      mockS3.getObject.mockResolvedValue(mockResult);

      const key = 'temp/file.txt';
      const res = await service.getFileFromTemporaryBucket(key);

      expect(mockS3.getObject).toHaveBeenCalledWith({
        Key: key,
        Bucket: EnvConstants.S3_TEMPORARY_FILES,
      });

      expect(res).toBe(mockResult);
    });

    it('should throw if s3Instance().getObject rejects', async () => {
      mockS3.getObject.mockRejectedValue(new Error('S3 error'));
      await expect(service.getFileFromTemporaryBucket('temp/file.txt')).rejects.toThrow('S3 error');
    });
  });


  it('deleteManyObjectAsync – should reject on S3 error', async () => {
    mockS3.deleteObjects.mockImplementation((_params, cb) => cb(new Error('S3 delete error'), null));

    await expect(service.deleteManyObjectAsync(['file1', 'file2'], EnvConstants.S3_DOCUMENTS_BUCKET))
      .rejects.toThrow('S3 delete error');
  });

  it('getPresignedUrlForDocumentUploadToLuminSign – without keyParam', async () => {
    const mimeType = 'application/pdf';

    const res = await service.getPresignedUrlForDocumentUploadToLuminSign({ mimeType });

    expect((service as any).createUploadPresignedUrl).toHaveBeenCalledWith({
      key: expect.stringMatching(/^.+\.pdf$/),
      bucket: EnvConstants.BANANASIGN_TEMP_DOCUMENTS_BUCKET,
      options: undefined,
      expiresIn: 300,
    });

    expect(res).toEqual({ url: 'signed-url', fields: { key: 'file-key' } });
  });

  it('getPresignedUrlForDocumentUploadToLuminSign – with keyParam', async () => {
    const mimeType = 'application/pdf';
    const keyParam = 'documents/custom.pdf';

    const res = await service.getPresignedUrlForDocumentUploadToLuminSign({ mimeType, key: keyParam });

    expect((service as any).createUploadPresignedUrl).toHaveBeenCalledWith({
      key: keyParam,
      bucket: EnvConstants.BANANASIGN_TEMP_DOCUMENTS_BUCKET,
      options: undefined,
      expiresIn: 300,
    });

    expect(res).toEqual({ url: 'signed-url', fields: { key: 'file-key' } });
  });

  it('uploadThumbnailWithBuffer – without keyFile', async () => {
    const buffer = Buffer.from('thumbnail');
    const mimetype = 'image/png';

    const res = await service.uploadThumbnailWithBuffer(buffer, mimetype);

    expect(service.putObject).toHaveBeenCalledWith({
      Key: expect.stringMatching(/^thumbnails\/.+\.png$/),
      ACL: 'private',
      Bucket: EnvConstants.S3_RESOURCES_BUCKET,
      Body: buffer,
    });

    expect(res).toBe('uploaded-key');
  });

  it('uploadThumbnailWithBuffer – with keyFile', async () => {
    const buffer = Buffer.from('thumbnail');
    const mimetype = 'image/png';
    const keyFile = 'thumbnails/custom.png';

    const res = await service.uploadThumbnailWithBuffer(buffer, mimetype, keyFile);

    expect(service.putObject).toHaveBeenCalledWith({
      Key: keyFile,
      ACL: 'private',
      Bucket: EnvConstants.S3_RESOURCES_BUCKET,
      Body: buffer,
    });

    expect(res).toBe('uploaded-key');
  });

  it('uploadThumbnailToS3 – without keyFile', async () => {
    const file = { mimetype: 'image/jpeg', buffer: Buffer.from('thumbnail') };

    const res = await service.uploadThumbnailToS3(file);

    expect(service.putObject).toHaveBeenCalled();
  });

  it('uploadThumbnailToS3 – with keyFile', async () => {
    const file = { mimetype: 'image/jpeg', buffer: Buffer.from('thumbnail') };
    const keyFile = 'thumbnails/custom.jpg';

    const res = await service.uploadThumbnailToS3(file, keyFile);

    expect(service.putObject).toHaveBeenCalledWith({
      Key: keyFile,
      ACL: 'private',
      Bucket: EnvConstants.S3_RESOURCES_BUCKET,
      Body: file.buffer,
    });

    expect(res).toBe('uploaded-key');
  });

  it('getThumbnailMetadata – catch block throws error', async () => {
    jest.spyOn(service as any, 'headObject').mockImplementation(() => {
      throw new Error('S3 error');
    });

    await expect(service.getThumbnailMetadata('somefile.png')).rejects.toThrow('File does not exist');
  });

  it('uploadTeamAvatarWithBuffer – without keyFile', async () => {
    const buffer = Buffer.from('team-avatar');
    const mimetype = 'image/png';

    const res = await service.uploadTeamAvatarWithBuffer(buffer, mimetype);

    expect(service.putObject).toHaveBeenCalledWith({
      Key: expect.stringMatching(/^team-profiles\/.+\.png$/),
      ACL: 'private',
      Bucket: EnvConstants.S3_PROFILES_BUCKET,
      Body: buffer,
    });

    expect(res).toBe('uploaded-key');
  });

  it('uploadTeamAvatarWithBuffer – with keyFile', async () => {
    const buffer = Buffer.from('team-avatar');
    const mimetype = 'image/png';
    const keyFile = 'team-profiles/custom.png';

    const res = await service.uploadTeamAvatarWithBuffer(buffer, mimetype, keyFile);

    expect(service.putObject).toHaveBeenCalledWith({
      Key: keyFile,
      ACL: 'private',
      Bucket: EnvConstants.S3_PROFILES_BUCKET,
      Body: buffer,
    });

    expect(res).toBe('uploaded-key');
  });

  it('uploadOrganizationAvatar – without keyFile', async () => {
    const buffer = Buffer.from('org-avatar');
    const mimetype = 'image/jpeg';

    const res = await service.uploadOrganizationAvatar(buffer, mimetype);

    expect(service.putObject).toHaveBeenCalled();
  });

  it('uploadOrganizationAvatar – with keyFile', async () => {
    const buffer = Buffer.from('org-avatar');
    const mimetype = 'image/jpeg';
    const keyFile = 'organization-profiles/custom.jpg';

    const res = await service.uploadOrganizationAvatar(buffer, mimetype, keyFile);

    expect(service.putObject).toHaveBeenCalledWith({
      Key: keyFile,
      ACL: 'private',
      Bucket: EnvConstants.S3_PROFILES_BUCKET,
      Body: buffer,
    });

    expect(res).toBe('uploaded-key');
  });


  it('uploadSignature – without keyFile', async () => {
    const file = { mimetype: 'image/png' };

    const res = await service.uploadSignature(file);

    expect(service.putObject).toHaveBeenCalledWith({
      Key: expect.stringMatching(/^signatures\/.+\.png$/),
      ACL: 'private',
      Bucket: EnvConstants.S3_PROFILES_BUCKET,
      Body: file,
    });
    expect(res).toBe('uploaded-key');
  });

  it('uploadSignature – with keyFile', async () => {
    const file = { mimetype: 'image/png' };

    const res = await service.uploadSignature(file, 'signatures/custom.png');

    expect(service.putObject).toHaveBeenCalledWith({
      Key: 'signatures/custom.png',
      ACL: 'private',
      Bucket: EnvConstants.S3_PROFILES_BUCKET,
      Body: file,
    });
    expect(res).toBe('uploaded-key');
  });

  it('uploadUserAvatar – without keyFile', async () => {
    const file = {
      mimetype: 'image/jpeg',
      fileBuffer: Buffer.from('avatar'),
      filename: 'avatar.jpg',
      filesize: 1024,
    };

    const res = await service.uploadUserAvatar(file);

    expect(service.putObject).toHaveBeenCalled();
    expect(res).toBe('uploaded-key');
  });

  it('uploadUserAvatar – with keyFile', async () => {
    const file = {
      mimetype: 'image/jpeg',
      fileBuffer: Buffer.from('avatar'),
      filename: 'me.jpg',
      filesize: 2048,
    };

    const res = await service.uploadUserAvatar(file, 'user-profiles/me.jpg');

    expect(service.putObject).toHaveBeenCalledWith({
      Key: 'user-profiles/me.jpg',
      ACL: 'private',
      Bucket: EnvConstants.S3_PROFILES_BUCKET,
      Body: file.fileBuffer,
    });
    expect(res).toBe('uploaded-key');
  });

  it('getPresignedUrlForDocument – with versionId', async () => {
    jest.spyOn(service as any, 'getDocumentMetadata').mockResolvedValue({ VersionId: 'v1' });

    const res = await service.getPresignedUrlForDocument({
      mimeType: 'application/pdf',
      key: 'a.pdf',
    });

    expect(res.url).toBe('signed-url');
  });

  it('getPresignedUrlForDocument – without versionId', async () => {
    jest.spyOn(service as any, 'getDocumentMetadata').mockResolvedValue(null);

    await service.getPresignedUrlForDocument({
      mimeType: 'application/pdf',
    });

    expect((service as any).createUploadPresignedUrl).toHaveBeenCalled();
  });

  it('getPresignedUrlForThumbnail', async () => {
    const res = await service.getPresignedUrlForThumbnail({ mimeType: 'image/png' });
    expect(res.url).toBe('signed-url');
  });

  it('getPresignedUrlForTemporaryUploadFile', async () => {
    const res = await service.getPresignedUrlForTemporaryUploadFile({
      mimeType: 'image/png',
      s3Folder: 'tmp/',
    });
    expect(res.url).toBe('signed-url');
  });

  it('uploadDocument', async () => {
    const res = await service.uploadDocument({
      buffer: Buffer.from('a'),
      mimetype: 'text/plain',
    });
    expect(res.key).toBe('uploaded-key');
  });

  it('uploadDocumentWithBuffer', async () => {
    const res = await service.uploadDocumentWithBuffer(Buffer.from('a'), 'text/plain');
    expect(res).toBe('uploaded-key');
  });

  it('uploadFeedbackAttachmentToS3', async () => {
    const res = await service.uploadFeedbackAttachmentToS3({
      buffer: Buffer.from('x'),
      mimetype: 'image/png',
    });
    expect(res).toBe('uploaded-key');
  });

  it('getThumbnailMetadata – success', async () => {
    mockS3.headObject.mockResolvedValue({ ContentLength: 10 });
    const res = await service.getThumbnailMetadata('thumb.png');
    expect(res.ContentLength).toBe(10);
    expect(await service.getThumbnailMetadata('')).toBeNull();
  });

  it('getThumbnailMetadata – error', async () => {
    mockS3.headObject.mockRejectedValue(new Error());
    await expect(service.getThumbnailMetadata('x')).rejects.toThrow();
  });

  it('getTemporaryFileMetadata – null key', async () => {
    const res = await service.getTemporaryFileMetadata(null);
    expect(res).toBeNull();
  });

  it('getTemporaryFileMetadata – success', async () => {
    mockS3.headObject.mockResolvedValue({ ContentLength: 5 });
    const res = await service.getTemporaryFileMetadata('tmp/file.txt');
    expect(res.ContentLength).toBe(5);
  });

  it('getFileMetadata – null key', async () => {
    const res = await service.getFileMetadata(null, EnvConstants.S3_DOCUMENTS_BUCKET);
    expect(res).toBeNull();
  });

  it('getFileMetadata – success', async () => {
    mockS3.headObject.mockResolvedValue({ ContentLength: 10 });
    const res = await service.getFileMetadata('file.pdf', EnvConstants.S3_DOCUMENTS_BUCKET);
    expect(res.ContentLength).toBe(10);
  });

  it('getStreamFromDocumentBucket', async () => {
    const stream = new Readable();
    mockS3.getObject.mockResolvedValue({ Body: stream });

    const res = await service.getStreamFromDocumentBucket('file', 'bytes=0-10');
    expect(res).toBe(stream);
  });

  it('deleteObjectAsync – success', async () => {
    mockS3.deleteObject.mockImplementation((_p, cb) => cb(null, {}));
    await service.deleteObjectAsync('a', EnvConstants.S3_DOCUMENTS_BUCKET);
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it('deleteObjectAsync – error', async () => {
    mockS3.deleteObject.mockImplementation((_p, cb) => cb(new Error('fail'), null));
    await expect(
      service.deleteObjectAsync('a', EnvConstants.S3_DOCUMENTS_BUCKET),
    ).rejects.toThrow();
  });

  it('deleteManyObjectAsync', async () => {
    mockS3.deleteObjects.mockImplementation((_p, cb) => cb(null, {}));
    await service.deleteManyObjectAsync(['a'], EnvConstants.S3_DOCUMENTS_BUCKET);
  });

  it('copyObjectS3 – success', async () => {
    mockS3.copyObject.mockImplementation((_p, cb) => cb(null));
    const res = await service.copyObjectS3('src', 'bucket', 'key', true);
    expect(res).toBe('key');
  });

  it('copyObjectS3 – error', async () => {
    mockS3.copyObject.mockImplementation((_p, cb) => cb(new Error()));
    await expect(service.copyObjectS3('src', 'bucket', 'key')).rejects.toThrow();
  });

  it('putFileToTemporaryBucket – success', async () => {
    const res = await service.putFileToTemporaryBucket('a', 'data');
    expect(res).toBe('a');
  });

  it('putFileToTemporaryBucket – error', async () => {
    (Upload as unknown as jest.Mock).mockImplementationOnce(() => ({
      done: jest.fn().mockRejectedValue(new Error()),
    }));

    await expect(service.putFileToTemporaryBucket('a', 'data')).rejects.toThrow();
  });

  it('logDataMigrationBatch – success & error batch', async () => {
    await service.logDataMigrationBatch({
      migrationName: 'test',
      batchId: '1',
      batchInfo: { ok: true },
      batchError: { err: true },
    });

    expect(mockLogger.info).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('getSignedUrl – without versionId', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('signed');
    const res = await service.getSignedUrl({ keyFile: 'a' });
    expect(res).toBe('signed');
  });

  it('getSignedUrl – with versionId', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('signed');
    const res = await service.getSignedUrl({
      keyFile: 'a',
      versionId: 'v1',
    });
    expect(res).toBe('signed');
  });

  it('createSignedUrl', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('signed');
    const res = await service.createSignedUrl({ keyFile: 'a' });
    expect(res).toBe('signed');
  });

  it('getDocumentSize – success', async () => {
    mockS3.headObject.mockImplementation((_p, cb) =>
      cb(null, { ContentLength: 123 }),
    );

    const size = await service.getDocumentSize('file.pdf');
    expect(size).toBe(123);
  });

  it('getDocumentSize – error', async () => {
    mockS3.headObject.mockImplementation((_p, cb) =>
      cb(new Error(), null),
    );

    const size = await service.getDocumentSize('file.pdf');
    expect(size).toBe(0);
  });
});
