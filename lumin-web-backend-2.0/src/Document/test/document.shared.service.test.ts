import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocumentSharedService } from '../document.shared.service';
import { IDocumentModel } from '../interfaces/document.interface';

describe('DocumentSharedService', () => {
  let service: DocumentSharedService;
  let documentModel: jest.Mocked<Model<IDocumentModel>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentSharedService,
        {
          provide: getModelToken('Document'),
          useValue: {
            findOneAndUpdate: jest.fn().mockReturnValue({
              session: jest.fn().mockReturnValue({
                exec: jest.fn(),
              }),
            }),
            findOne: jest.fn().mockReturnValue({
              exec: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentSharedService>(DocumentSharedService);
    documentModel = module.get(getModelToken('Document'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateDocument', () => {
    const mockDocumentId = new Types.ObjectId();
    const mockUpdatedProperties = {
      name: 'Updated Document Name',
      size: 1024,
      lastModify: new Date(),
    };

    it('should update document and return updated document with string _id', async () => {
      const mockDocument = {
        _id: mockDocumentId,
        name: 'Updated Document Name',
        size: 1024,
        lastModify: mockUpdatedProperties.lastModify,
        toObject: jest.fn().mockReturnValue({
          _id: mockDocumentId,
          name: 'Updated Document Name',
          size: 1024,
          lastModify: mockUpdatedProperties.lastModify,
        }),
      };

      const execMock = jest.fn().mockResolvedValue(mockDocument);
      const sessionMock = jest.fn().mockReturnValue({ exec: execMock });
      (documentModel.findOneAndUpdate as jest.Mock).mockReturnValue({ session: sessionMock });

      const result = await service.updateDocument(mockDocumentId, mockUpdatedProperties);

      expect(documentModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockDocumentId },
        { $set: mockUpdatedProperties },
        { new: true },
      );
      expect(sessionMock).toHaveBeenCalledWith(null);
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual({
        _id: mockDocumentId.toHexString(),
        name: 'Updated Document Name',
        size: 1024,
        lastModify: mockUpdatedProperties.lastModify,
      });
    });

    it('should return null when document is not found', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      const sessionMock = jest.fn().mockReturnValue({ exec: execMock });
      (documentModel.findOneAndUpdate as jest.Mock).mockReturnValue({ session: sessionMock });

      const result = await service.updateDocument(mockDocumentId, mockUpdatedProperties);

      expect(execMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getDocumentByDocumentId', () => {
    const mockDocumentId = new Types.ObjectId();

    it('should return document when found', async () => {
      const mockDocument = {
        _id: mockDocumentId,
        name: 'Test Document',
        size: 2048,
        toObject: jest.fn().mockReturnValue({
          _id: mockDocumentId,
          name: 'Test Document',
          size: 2048,
        }),
      };

      const execMock = jest.fn().mockResolvedValue(mockDocument);
      (documentModel.findOne as jest.Mock).mockReturnValue({ exec: execMock });

      const result = await service.getDocumentByDocumentId(mockDocumentId.toHexString());

      expect(documentModel.findOne).toHaveBeenCalledWith(
        { _id: mockDocumentId.toHexString() },
        undefined,
      );
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual({
        _id: mockDocumentId.toHexString(),
        name: 'Test Document',
        size: 2048,
      });
    });

    it('should return null when document is not found', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      (documentModel.findOne as jest.Mock).mockReturnValue({ exec: execMock });

      const result = await service.getDocumentByDocumentId('non-existent-id');

      expect(execMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
