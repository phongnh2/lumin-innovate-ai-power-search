import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { DocumentServiceMobile } from '../document.service.mobile';
import { EnvironmentService } from '../../Environment/environment.service';
import { AwsService } from '../../Aws/aws.service';
import { DocumentService } from '../document.service';
import { CallbackService } from '../../Calback/callback.service';
import { DocumentOwnerTypeEnum, DocumentStorageEnum } from '../document.enum';
import { TypeOfDocument } from '../../graphql.schema';

jest.mock('../../Calback/callback.decorator', () => ({
  Callback: () => () => {
  },
}));

describe('DocumentServiceMobile', () => {
  let service: DocumentServiceMobile;
  let environmentService: EnvironmentService;
  let awsService: AwsService;
  let documentService: DocumentService;

  const mockFileData = {
    fileBuffer: Buffer.from('test content'),
    mimetype: 'application/pdf',
    filename: 'test.pdf',
    filesize: 1024,
  };

  const mockThumbnailData = {
    fileBuffer: Buffer.from('thumbnail content'),
    mimetype: 'image/png',
    filename: 'thumb.png',
    filesize: 512,
  };

  const mockUploader = {
    _id: 'user123',
  };

  const mockDocument = {
    _id: 'doc123',
    name: 'test.pdf',
    remoteId: 'remote123',
    mimeType: 'application/pdf',
    size: 1024,
    service: DocumentStorageEnum.S3,
    isPersonal: true,
    lastModifiedBy: 'user123',
    ownerId: 'user123',
    shareSetting: {},
    thumbnail: 'thumb123',
    manipulationStep: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentServiceMobile,
        {
          provide: EnvironmentService,
          useValue: createMock<EnvironmentService>({
            getByKey: jest.fn().mockReturnValue('test-bucket'),
          }),
        },
        {
          provide: AwsService,
          useValue: createMock<AwsService>({
            uploadDocumentWithBuffer: jest.fn().mockResolvedValue('doc-key-123'),
            uploadThumbnailWithBuffer: jest.fn().mockResolvedValue('thumb-key-123'),
            copyObjectS3: jest.fn().mockResolvedValue('copied-thumb-key'),
          }),
        },
        {
          provide: DocumentService,
          useValue: createMock<DocumentService>({
            getDocumentNameAfterNaming: jest.fn().mockResolvedValue('test.pdf'),
            createDocument: jest.fn().mockResolvedValue(mockDocument),
          }),
        },
        {
          provide: CallbackService,
          useValue: createMock<CallbackService>(),
        },
      ],
    }).compile();

    service = module.get<DocumentServiceMobile>(DocumentServiceMobile);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
    awsService = module.get<AwsService>(AwsService);
    documentService = module.get<DocumentService>(DocumentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDocumentWithBufferData', () => {
    it('should create document without metadata', async () => {
      await service.createDocumentWithBufferData({
        clientId: 'client123',
        doc: mockFileData,
        thumbnail: mockThumbnailData,
        uploader: mockUploader,
        docType: DocumentOwnerTypeEnum.PERSONAL,
      });

      expect(documentService.getDocumentNameAfterNaming).toHaveBeenCalledWith({
        clientId: 'client123',
        fileName: 'test.pdf',
        documentFolderType: DocumentOwnerTypeEnum.PERSONAL,
        mimetype: 'application/pdf',
      });
    });
  });

  describe('copyDocumentFromFileBuffer', () => {
    const mockOriginalDocument = {
      _id: 'original123',
      thumbnail: 'original-thumb.jpg',
      manipulationStep: 'original-step',
    };

    it('should copy document from file buffer successfully', async () => {
      const result = await service.copyDocumentFromFileBuffer({
        originalDocument: mockOriginalDocument as any,
        file: mockFileData,
        creatorId: 'creator123',
        destinationType: TypeOfDocument.PERSONAL,
        destinationId: 'dest123',
        documentName: 'copied-document',
        folderId: 'folder123',
      });

      expect(environmentService.getByKey).toHaveBeenCalled();
      expect(awsService.copyObjectS3).toHaveBeenCalledWith(
        'test-bucket/original-thumb.jpg',
        'test-bucket',
        expect.stringMatching(/^thumbnails\/.*\.jpg$/),
      );
      expect(documentService.createDocument).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should throw error when file is not provided', async () => {
      await expect(service.copyDocumentFromFileBuffer({
        originalDocument: mockOriginalDocument as any,
        file: null,
        creatorId: 'creator123',
        destinationType: TypeOfDocument.PERSONAL,
        destinationId: 'dest123',
        documentName: 'copied-document',
      })).rejects.toThrow('File is required when duplicate drive/dropbox document');
    });

    it('should handle organization destination type', async () => {
      await service.copyDocumentFromFileBuffer({
        originalDocument: mockOriginalDocument as any,
        file: mockFileData,
        creatorId: 'creator123',
        destinationType: TypeOfDocument.ORGANIZATION,
        destinationId: 'org123',
        documentName: 'org-document',
      });

      expect(documentService.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          isPersonal: false,
        }),
      );
    });
  });
});
