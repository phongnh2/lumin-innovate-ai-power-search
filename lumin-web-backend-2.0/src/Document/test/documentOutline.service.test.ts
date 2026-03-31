import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { Model, Types } from 'mongoose';
import { DocumentOutlineService } from '../documentOutline.service';
import { LoggerService } from '../../Logger/Logger.service';
import { DocumentSharedService } from '../document.shared.service';
import { IDocumentOutlineModel, IDocumentOutline } from '../interfaces/document.interface';
import { MAX_NESTED_OUTLINE_LEVEL, MAX_OUTLINE_PER_CHUNK, MAX_OUTLINE_PER_LEVEL, OutlineActionEnum, OutlineMoveDirectionsEnum } from '../documentConstant';
import { PageManipulation } from '../../Common/constants/SocketConstants';
import { OutlineUtils } from '../../Document/utils/outlineUtils';


describe('DocumentOutlineService', () => {
  let service: DocumentOutlineService;
  let documentOutlineModel: jest.Mocked<Model<IDocumentOutlineModel>>;
  let loggerService: LoggerService;
  let documentSharedService: DocumentSharedService;

  const mockDocumentId = 'doc123';
  const mockPathId = 'path123';
  const mockRefId = 'ref123';

  const mockOutline: IDocumentOutline = {
    _id: 'outline123',
    documentId: mockDocumentId,
    pathId: mockPathId,
    name: 'Test Outline',
    level: 0,
    lexicalRanking: 'a',
    pageNumber: 1,
    verticalOffset: 100,
    horizontalOffset: 50,
    hasChildren: false,
    parentId: undefined,
    parentPath: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentOutlineService,
        {
          provide: getModelToken('DocumentOutline'),
          useValue: {
            deleteMany: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
            }),
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockOutline]),
            }),
            findOne: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOutline),
            }),
            countDocuments: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(1),
            }),
            insertMany: jest.fn().mockResolvedValue([mockOutline]),
            create: jest.fn().mockResolvedValue(mockOutline),
            findOneAndUpdate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOutline),
            }),
            bulkWrite: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
            updateMany: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
            }),
          },
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>({
            info: jest.fn(),
            error: jest.fn(),
          }),
        },
        {
          provide: DocumentSharedService,
          useValue: createMock<DocumentSharedService>({
            getDocumentByDocumentId: jest.fn().mockResolvedValue({
              _id: mockDocumentId,
              metadata: { hasOutlines: true },
            }),
            updateDocument: jest.fn().mockResolvedValue({}),
          }),
        },
      ],
    }).compile();

    service = module.get<DocumentOutlineService>(DocumentOutlineService);
    documentOutlineModel = module.get(getModelToken('DocumentOutline'));
    loggerService = module.get<LoggerService>(LoggerService);
    documentSharedService = module.get<DocumentSharedService>(DocumentSharedService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('clearOutlineOfDocument', () => {
    it('should clear outlines and update document metadata', async () => {
      const result = await service.clearOutlineOfDocument(mockDocumentId);

      expect(documentOutlineModel.deleteMany).toHaveBeenCalledWith({ documentId: mockDocumentId });
      expect(documentSharedService.updateDocument).toHaveBeenCalledWith(
        mockDocumentId,
        { 'metadata.hasOutlines': false },
      );
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe('findDocumentOutlines', () => {
    it('should find document outlines with conditions', async () => {
      const conditions = { documentId: mockDocumentId };
    
      const result = await service.findDocumentOutlines(conditions);
    
      expect(documentOutlineModel.find).toHaveBeenCalledWith(conditions, {}, {});
      expect(result).toEqual({
        exec: expect.any(Function),
      });
    });
  });

  describe('findOneDocumentOutlines', () => {
    it('should find one document outline and return with string _id', async () => {
      const conditions = { documentId: mockDocumentId, pathId: mockPathId };
      const mockOutlineDoc: any = {
        _id: new Types.ObjectId(),
        toObject: () => ({ title: 'Outline 1' }),
      };
      (documentOutlineModel.findOne as jest.Mock).mockResolvedValue(mockOutlineDoc);
      const result = await service.findOneDocumentOutlines(conditions);
  
      expect(documentOutlineModel.findOne).toHaveBeenCalledWith(conditions, {}, {});
      expect(result).toEqual({
        _id: mockOutlineDoc._id.toHexString(),
        title: 'Outline 1',
      });
    });

    it('should return null if no outline found', async () => {
        const conditions = { documentId: mockDocumentId, pathId: mockPathId };
        (documentOutlineModel.findOne as jest.Mock).mockResolvedValue(null);
    
        const result = await service.findOneDocumentOutlines(conditions);
    
        expect(documentOutlineModel.findOne).toHaveBeenCalledWith(conditions, {}, {});
        expect(result).toBeNull();
      });
  });

  describe('insertDocumentOutlineByRefId', () => {
    const mockOutlineData = {
      name: 'New Outline',
      pageNumber: 1,
      verticalOffset: 100,
      horizontalOffset: 50,
    };

    const mockLexicalData = {
      lexicalRanking: 'b',
      parentPath: ',parent1,',
      parentId: 'parent123',
      hasSibling: false,
      level: 1,
      previousLexicalString: 'a',
      nextLexicalString: 'c',
    };

    beforeEach(() => {
      jest.spyOn(service, 'getOutlineLexicalData').mockResolvedValue(mockLexicalData);
      jest.spyOn(service, 'checkOutlineDataValidity').mockResolvedValue();
      jest.spyOn(service, 'updateDocumentOutlineByPathId').mockResolvedValue(mockOutline);
    });

    it('should insert outline successfully with refId and isSubOutline false', async () => {
      const mockCreatedOutline = {
        ...mockOutline,
        toObject: () => ({ ...mockOutline, _id: { toHexString: () => 'newOutline123' } }),
        _id: { toHexString: () => 'newOutline123' }
      };
      
      (documentOutlineModel.create as jest.Mock).mockResolvedValue(mockCreatedOutline);

      const result = await service.insertDocumentOutlineByRefId({
        documentId: mockDocumentId,
        refId: mockRefId,
        data: mockOutlineData as any,
        isSubOutline: false,
      });

      expect(service.getOutlineLexicalData).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        refId: mockRefId,
        movePosition: OutlineMoveDirectionsEnum.DOWN,
      });
      expect(service.checkOutlineDataValidity).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        refId: mockRefId,
        modifiedPosition: OutlineMoveDirectionsEnum.DOWN,
        parentPath: mockLexicalData.parentPath,
        level: mockLexicalData.level,
      });
      expect(documentOutlineModel.create).toHaveBeenCalledWith({
        ...mockOutlineData,
        documentId: mockDocumentId,
        parentId: mockLexicalData.parentId,
        parentPath: mockLexicalData.parentPath,
        level: mockLexicalData.level,
        lexicalRanking: mockLexicalData.lexicalRanking,
        hasChildren: false,
      });
      expect(result).toEqual({ ...mockOutline, _id: 'newOutline123' });
    });

    it('should insert outline successfully with refId and isSubOutline true', async () => {
      const mockCreatedOutline = {
        ...mockOutline,
        toObject: () => ({ ...mockOutline, _id: { toHexString: () => 'newOutline123' } }),
        _id: { toHexString: () => 'newOutline123' }
      };
      
      (documentOutlineModel.create as jest.Mock).mockResolvedValue(mockCreatedOutline);

      const result = await service.insertDocumentOutlineByRefId({
        documentId: mockDocumentId,
        refId: mockRefId,
        data: mockOutlineData as any,
        isSubOutline: true,
      });

      expect(service.getOutlineLexicalData).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        refId: mockRefId,
        movePosition: OutlineMoveDirectionsEnum.INTO,
      });
      expect(service.checkOutlineDataValidity).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        refId: mockRefId,
        modifiedPosition: OutlineMoveDirectionsEnum.INTO,
        parentPath: mockLexicalData.parentPath,
        level: mockLexicalData.level,
      });
      expect(result).toEqual({ ...mockOutline, _id: 'newOutline123' });
    });
  });

  describe('updateDocumentOutlineByPathId', () => {
    it('should update outline and return with string _id', async () => {
      const data = { name: 'Updated Outline' };
      const mockUpdatedOutline = {
        ...mockOutline,
        toObject: () => mockOutline,
        _id: { toHexString: () => mockOutline._id }
      };
      
      (documentOutlineModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedOutline);

      const result = await service.updateDocumentOutlineByPathId({
        documentId: mockDocumentId,
        pathId: mockPathId,
        data,
      });

      expect(documentOutlineModel.findOneAndUpdate).toHaveBeenCalledWith(
        { documentId: mockDocumentId, pathId: mockPathId },
        { $set: data },
        { new: true },
      );
      expect(result).toEqual(mockOutline);
    });

    it('should return null when outline not found', async () => {
      (documentOutlineModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await service.updateDocumentOutlineByPathId({
        documentId: mockDocumentId,
        pathId: mockPathId,
        data: { name: 'Updated' },
      });

      expect(result).toBeNull();
    });
  });

  describe('updateChildOutline', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findDocumentOutlines').mockResolvedValue([
        { pathId: 'child1', parentId: 'parent-old' } as any,
        { pathId: 'child2', parentId: 'child1' } as any,
      ]);
  
      jest.spyOn(OutlineUtils, 'generateOutlinePath').mockImplementation(({ parentPath, parentId }) => {
        return `${parentPath || ''}${parentId},`;
      });
  
      jest.spyOn(OutlineUtils, 'getMiddleString').mockImplementation((a, b) => a + b);
      jest.spyOn(OutlineUtils, 'getNextLexicalString').mockImplementation((current) => current + 'x');
  
      jest.spyOn(service, 'getLevelByMaterializedPath').mockImplementation((path) => {
        return path ? path.split(',').length - 2 : 0;
      });
    });
  
    it('should return updateList with recalculated parentPath, level, lexicalRanking', async () => {
      const formerParentData = {
        pathId: 'parent-old',
        parentPath: ',root,',
        level: 1,
      } as IDocumentOutline;
    
      const newParentData = {
        parentId: 'parent-new',
        parentPath: ',newroot,',
        lexicalRanking: 'a',
      };
    
      const result = await service.updateChildOutline({
        documentId: 'doc1',
        formerParentData,
        newParentData,
        lexicalLimit: 'b',
      });
    
      expect(service.findDocumentOutlines).toHaveBeenCalledWith(
        {
          documentId: 'doc1',
          level: { $gt: 1 },
          parentPath: expect.any(RegExp),
        },
        {},
        { sort: { lexicalRanking: 1 } },
      ); 
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          pathId: 'child1',
          data: expect.objectContaining({
            level: expect.any(Number),
            lexicalRanking: expect.stringContaining('ab'),
            parentPath: ',newroot,parent-old,',
          }),
        }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          pathId: 'child2',
          data: expect.objectContaining({
            level: expect.any(Number),
            lexicalRanking: expect.stringContaining('abx'),
            parentPath: ',newroot,parent-old,child1,',
          }),
        }),
      );
    });
  
    it('should return empty list when no children', async () => {
      (service.findDocumentOutlines as jest.Mock).mockResolvedValueOnce([]);
  
      const result = await service.updateChildOutline({
        documentId: 'doc1',
        formerParentData: { pathId: 'p1', parentPath: ',r,', level: 0 } as any,
        newParentData: {},
        lexicalLimit: '',
      });
  
      expect(result).toEqual([]);
    });

    it('should handle child outline with no parentId (parentPath = null)', async () => {
      (service.findDocumentOutlines as jest.Mock).mockResolvedValueOnce([
        { pathId: 'orphan-child', parentId: null } as any,
      ]);
    
      const formerParentData = {
        pathId: 'parent-old',
        parentPath: ',root,',
        level: 1,
      } as IDocumentOutline;
      const newParentData = {
        parentId: 'parent-new',
        parentPath: ',newroot,',
        lexicalRanking: 'a',
      };
      const result = await service.updateChildOutline({
        documentId: 'doc1',
        formerParentData,
        newParentData,
        lexicalLimit: 'b',
      });
    
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          pathId: 'orphan-child',
          data: expect.objectContaining({
            parentPath: null,
            level: expect.any(Number),
            lexicalRanking: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('moveDocumentOutlineByRefId', () => {
    let mockBulkWrite: jest.Mock;
  
    beforeEach(() => {
      mockBulkWrite = jest.fn();
      (service as any).documentOutlineModel = {
        bulkWrite: mockBulkWrite,
      };
  
      jest.spyOn(service, 'findOneDocumentOutlines').mockResolvedValue({
        pathId: 'cur-path',
        level: 1,
        parentId: 'p1',
      } as any);
  
      jest.spyOn(service, 'getOutlineLexicalData').mockResolvedValue({
        lexicalRanking: '001',
        parentPath: 'pp',
        parentId: 'pid',
        hasSibling: false,
        level: 2,
        nextLexicalString: '002',
      } as any);
  
      jest.spyOn(service, 'updateChildOutline').mockResolvedValue([]);
      jest.spyOn(service, 'checkOutlineDataValidity').mockResolvedValue(undefined);
      jest.spyOn(service, 'hasChildDocumentOutline').mockResolvedValue(false);
      jest.spyOn(service, 'updateDocumentOutlineByPathId').mockResolvedValue(undefined);
    });
  
    it('should throw error when refId is null', async () => {
      await expect(
        service.moveDocumentOutlineByRefId({
          documentId: 'doc1',
          refId: undefined as any,
          movePosition: OutlineMoveDirectionsEnum.INTO,
          pathId: 'cur-path',
        }),
      ).rejects.toThrow('RefId are required');
    });
  
    it('should throw error when outline not found', async () => {
      (service.findOneDocumentOutlines as jest.Mock).mockResolvedValueOnce(null);
  
      await expect(
        service.moveDocumentOutlineByRefId({
          documentId: 'doc1',
          refId: 'r1',
          movePosition: OutlineMoveDirectionsEnum.INTO,
          pathId: 'cur-path',
        }),
      ).rejects.toThrow('Outline not found');
    });
  
    it('should add parent hasChildren when moving INTO and no sibling', async () => {
      (service.updateChildOutline as jest.Mock).mockResolvedValue([{ pathId: 'child1', data: { level: 3 } }]);
  
      await service.moveDocumentOutlineByRefId({
        documentId: 'doc1',
        refId: 'r1',
        movePosition: OutlineMoveDirectionsEnum.INTO,
        pathId: 'cur-path',
      });
  
      expect(mockBulkWrite).toHaveBeenCalled();
      const operations = mockBulkWrite.mock.calls[0][0];
      expect(operations.some(op => op.updateOne.update.$set.hasChildren === true)).toBe(true);
      expect(operations.some(op => op.updateOne.filter.pathId === 'child1')).toBe(true);
    });
  });

  describe('getSortedDocumentOutlines', () => {
    it('should return sorted outlines', async () => {
      (documentOutlineModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockOutline]),
      });

      const result = await service.getSortedDocumentOutlines(mockDocumentId);

      expect(documentOutlineModel.find).toHaveBeenCalledWith(
        { documentId: mockDocumentId },
        {},
        {
          sort: {
            lexicalRanking: 1,
            level: 1,
          },
        },
      );
      expect(result).toEqual({
        exec: expect.any(Function),
      });
    });
  });

  describe('countOutlinesByParentPath', () => {
    it('should count outlines by documentId and parentPath', async () => {
      const expectedCount = 5;
      (documentOutlineModel.countDocuments as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(expectedCount),
      });

      const result = await service.countOutlinesByParentPath(mockDocumentId, mockPathId);

      expect(documentOutlineModel.countDocuments).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        parentPath: mockPathId,
      });
      expect(result).toBe(expectedCount);
    });
  });

  describe('addManyOutlines', () => {
    it('should add many outlines and return with string _id', async () => {
      const outlines = [{ name: 'Outline 1' }, { name: 'Outline 2' }];
      const mockInsertedOutlines = [{
        ...mockOutline,
        toObject: () => mockOutline,
        _id: { toHexString: () => mockOutline._id }
      }];
      
      (documentOutlineModel.insertMany as jest.Mock).mockResolvedValue(mockInsertedOutlines);

      const result = await service.addManyOutlines(outlines);

      expect(documentOutlineModel.insertMany).toHaveBeenCalledWith(outlines);
      expect(result).toEqual([mockOutline]);
    });
  });

  describe('hasChildDocumentOutline', () => {
    it('should return true when child outline exists', async () => {
      const result = await service.hasChildDocumentOutline(mockDocumentId, mockPathId);

      expect(documentOutlineModel.findOne).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        parentId: mockPathId,
      });
      expect(result).toBe(true);
    });
  });

  describe('getLevelByMaterializedPath', () => {
    it('should return correct level based on path', () => {
      expect(service.getLevelByMaterializedPath(',parent1,parent2,')).toBe(2);
    });

    it('should return 0 for empty path', () => {
      const result = service.getLevelByMaterializedPath('');

      expect(result).toBe(0);
    });
  });

  describe('checkOutlineDataValidity', () => {
    it('should pass validation for valid data with null refId', async () => {
      await expect(service.checkOutlineDataValidity({
        documentId: mockDocumentId,
        refId: null,
        modifiedPosition: OutlineMoveDirectionsEnum.DOWN,
        parentPath: null,
        level: 0,
      })).resolves.not.toThrow();
    });

    it('should throw error for invalid level when refId is null', async () => {
      await expect(service.checkOutlineDataValidity({
        documentId: mockDocumentId,
        refId: null,
        modifiedPosition: OutlineMoveDirectionsEnum.DOWN,
        parentPath: null,
        level: 1,
      })).rejects.toThrow('Invalid input');
    });

    it('should pass validation for INTO position with valid level', async () => {
      jest.spyOn(service, 'getLevelByMaterializedPath').mockReturnValue(5);
      
      await expect(service.checkOutlineDataValidity({
        documentId: mockDocumentId,
        refId: mockRefId,
        modifiedPosition: OutlineMoveDirectionsEnum.INTO,
        parentPath: ',parent1,',
        level: 10,
        action: OutlineActionEnum.MOVE,
        childCount: 2,
      })).resolves.not.toThrow();
    });

    it('should pass validation when outlines at same level are within limit', async () => {
      jest.spyOn(service, 'countOutlinesByParentPath').mockResolvedValue(5000);

      await expect(service.checkOutlineDataValidity({
        documentId: mockDocumentId,
        refId: mockRefId,
        modifiedPosition: OutlineMoveDirectionsEnum.DOWN,
        parentPath: ',parent1,',
        level: 1,
      })).resolves.not.toThrow();
    });

    it('should throw error when exceeding max outlines per level', async () => {
      jest.spyOn(service, 'countOutlinesByParentPath').mockResolvedValue(MAX_OUTLINE_PER_LEVEL);

      await expect(service.checkOutlineDataValidity({
        documentId: mockDocumentId,
        refId: mockRefId,
        modifiedPosition: OutlineMoveDirectionsEnum.DOWN,
        parentPath: ',parent1,',
        level: 1,
      })).rejects.toThrow('Number of outline in the same level must be less than or equal');
    });

    it('should throw error when parentPathCount exceeds max nested level', async () => {
      jest.spyOn(service, 'getLevelByMaterializedPath').mockReturnValue(MAX_NESTED_OUTLINE_LEVEL);
    
      await expect(service.checkOutlineDataValidity({
        documentId: mockDocumentId,
        refId: mockRefId,
        modifiedPosition: OutlineMoveDirectionsEnum.INTO,
        parentPath: ',parent1,',
        level: 1,
        action: OutlineActionEnum.INSERT,
        childCount: 0,
      })).rejects.toThrow(`Nested level must be less than or equal ${MAX_NESTED_OUTLINE_LEVEL}`);
    });

    it('should throw error when outlines at same level exceed MAX_OUTLINE_PER_LEVEL', async () => {
      jest.spyOn(service, 'countOutlinesByParentPath').mockResolvedValue(MAX_OUTLINE_PER_LEVEL);
    
      await expect(service.checkOutlineDataValidity({
        documentId: mockDocumentId,
        refId: mockRefId,
        modifiedPosition: OutlineMoveDirectionsEnum.DOWN,
        parentPath: ',parent1,',
        level: 1,
      })).rejects.toThrow(`Number of outline in the same level must be less than or equal ${MAX_OUTLINE_PER_LEVEL}`);
    });
  });

  describe('deleteDocumentOutlinesByPathId', () => {
    it('should delete outline and its children', async () => {
      const mockOutlineWithParent = { ...mockOutline, parentId: 'parent123' };
      jest.spyOn(service, 'findOneDocumentOutlines').mockResolvedValue(mockOutlineWithParent);
      jest.spyOn(service, 'hasChildDocumentOutline').mockResolvedValue(false);
      jest.spyOn(service, 'updateDocumentOutlineByPathId').mockResolvedValue(mockOutline);

      const result = await service.deleteDocumentOutlinesByPathId(mockDocumentId, mockPathId);

      expect(service.findOneDocumentOutlines).toHaveBeenCalledWith({ documentId: mockDocumentId, pathId: mockPathId });
      expect(documentOutlineModel.deleteMany).toHaveBeenCalled();
      expect(result).toEqual(mockOutlineWithParent);
    });

    it('should throw error when outline not found', async () => {
      jest.spyOn(service, 'findOneDocumentOutlines').mockResolvedValue(null);

      await expect(service.deleteDocumentOutlinesByPathId(mockDocumentId, mockPathId))
        .rejects.toThrow('Outline not found');
    });

    it('should delete outline without parent', async () => {
      jest.spyOn(service, 'findOneDocumentOutlines').mockResolvedValue(mockOutline);

      const result = await service.deleteDocumentOutlinesByPathId(mockDocumentId, mockPathId);

      expect(result).toEqual(mockOutline);
    });
  });

  describe('updateOnRemove', () => {
    it('should update outlines when page is removed', async () => {
      await service.updateOnRemove(mockDocumentId, 5);

      expect(documentOutlineModel.updateMany).toHaveBeenCalledWith(
        {
          documentId: mockDocumentId,
          pageNumber: 5,
        },
        {
          $set: { pageNumber: null },
        },
      );
    });
  });

  describe('updatePageNumber', () => {
    it('should update page numbers', async () => {
      const result = await service.updatePageNumber({
        documentId: mockDocumentId,
        pageNumber: 5,
      });

      expect(documentOutlineModel.updateMany).toHaveBeenCalledWith(
        {
          documentId: mockDocumentId,
          pageNumber: { $gte: 5 },
        },
        {
          $inc: { pageNumber: 1 },
        },
      );
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('getRankingBetweenOutlines', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should call getMiddleString when nextOutline is provided', () => {
      const previousOutline = { lexicalRanking: 'a1' } as any;
      const nextOutline = { lexicalRanking: 'a3' } as any;
      const mockValue = 'a2';
      jest.spyOn(OutlineUtils, 'getMiddleString').mockReturnValue(mockValue);
      const result = service.getRankingBetweenOutlines(previousOutline, nextOutline);
  
      expect(OutlineUtils.getMiddleString).toHaveBeenCalledWith('a1', 'a3');
      expect(result).toBe(mockValue);
    });
  
    it('should call getNextLexicalString when nextOutline is not provided', () => {
      const previousOutline = { lexicalRanking: 'a1' } as any;
      const mockValue = 'a2';
      jest.spyOn(OutlineUtils, 'getNextLexicalString').mockReturnValue(mockValue);
      const result = service.getRankingBetweenOutlines(previousOutline, null as any);
  
      expect(OutlineUtils.getNextLexicalString).toHaveBeenCalledWith('a1');
      expect(result).toBe(mockValue);
    });

    it('should pass empty string when previousOutline is undefined', () => {
      const nextOutline = { lexicalRanking: 'b1' } as any;
      const mockValue = 'mid';
      jest.spyOn(OutlineUtils, 'getMiddleString').mockReturnValue(mockValue);
      const result = service.getRankingBetweenOutlines(undefined as any, nextOutline);
    
      expect(OutlineUtils.getMiddleString).toHaveBeenCalledWith('', 'b1');
      expect(result).toBe(mockValue);
    });
    
    it('should pass empty string when previousOutline.lexicalRanking is undefined', () => {
      const previousOutline = {} as any;
      const nextOutline = { lexicalRanking: 'b1' } as any;
      const mockValue = 'mid';
      jest.spyOn(OutlineUtils, 'getMiddleString').mockReturnValue(mockValue);
      const result = service.getRankingBetweenOutlines(previousOutline, nextOutline);
    
      expect(OutlineUtils.getMiddleString).toHaveBeenCalledWith('', 'b1');
      expect(result).toBe(mockValue);
    });
    
  });

  describe('getDocumentOutlines', () => {
    it('should return document outlines when document has outlines', async () => {
      (documentOutlineModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockOutline]),
      });

      const result = await service.getDocumentOutlines({ documentId: mockDocumentId });

      expect(documentSharedService.getDocumentByDocumentId).toHaveBeenCalledWith(
        mockDocumentId,
        { 'metadata.hasOutlines': 1 },
      );
      expect(result).toEqual({
        exec: expect.any(Function),
      });
    });

    it('should throw error when document does not have outlines', async () => {
      (documentSharedService.getDocumentByDocumentId as jest.Mock).mockResolvedValue({
        _id: mockDocumentId,
      });

      await expect(service.getDocumentOutlines({ documentId: mockDocumentId }))
        .rejects.toThrow('Document does not have outlines');
    });

    it('should set hasSibling = false when refOutline is undefined and movePosition = INTO', async () => {
      const refId = 'ref123';
      (service['documentOutlineModel'].findOne as jest.Mock).mockResolvedValue(undefined);
      const result = await service.processOutlineData({
        documentId: mockDocumentId,
        refId,
        movePosition: OutlineMoveDirectionsEnum.INTO,
      });
    
      expect(result.hasSibling).toBe(false);
      expect(result.parentId).toBe(refId);
      expect(result.parentPath).toContain(refId);
    });
  });

  describe('processOutlineData', () => {
    it('should return default values when refId is null', async () => {
      const result = await service.processOutlineData({
        documentId: mockDocumentId,
        refId: null,
        movePosition: OutlineMoveDirectionsEnum.DOWN,
      });
  
      expect(result).toEqual({
        conditions: { documentId: mockDocumentId },
        parentId: null,
        parentPath: null,
        hasSibling: false,
      });
    });
  
    it('should process data correctly when movePosition is INTO', async () => {
      const mockRefOutline = {
        parentPath: ',parent1,',
        hasChildren: true,
      };
      jest.spyOn(documentOutlineModel, 'findOne').mockResolvedValue(mockRefOutline);
  
      const result = await service.processOutlineData({
        documentId: mockDocumentId,
        refId: 'ref123',
        movePosition: OutlineMoveDirectionsEnum.INTO,
      });
  
      expect(documentOutlineModel.findOne).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        pathId: 'ref123',
      });
      expect(result).toEqual({
        conditions: {
          documentId: mockDocumentId,
          $or: [
            { parentPath: service.getFilterChildrenRegex(',parent1,ref123,') },
            { pathId: 'ref123' },
          ],
        },
        parentId: 'ref123',
        parentPath: ',parent1,ref123,',
        hasSibling: true,
      });
    });
  
    it('should set conditions.pathId when movePosition is UP', async () => {
      const mockRefOutline = {
        parentPath: ',parentY,',
        parentId: 'parentY',
      };
      jest.spyOn(documentOutlineModel, 'findOne').mockResolvedValue(mockRefOutline);
  
      const result = await service.processOutlineData({
        documentId: mockDocumentId,
        refId: 'ref789',
        movePosition: OutlineMoveDirectionsEnum.UP,
      });
  
      expect(result.conditions).toEqual({
        documentId: mockDocumentId,
        pathId: 'ref789',
      });
      expect(result.parentId).toBe('parentY');
      expect(result.parentPath).toBe(',parentY,');
      expect(result.hasSibling).toBe(true);
    });

    it('should handle when refOutline is null (cover optional chaining)', async () => {
      jest.spyOn(documentOutlineModel, 'findOne').mockResolvedValue(null);
    
      const result = await service.processOutlineData({
        documentId: mockDocumentId,
        refId: 'refNull',
        movePosition: OutlineMoveDirectionsEnum.DOWN,
      });
    
      expect(result.parentPath).toBeNull();
      expect(result.parentId).toBeNull();
      expect(result.hasSibling).toBe(true);  
    });    
  });

  describe('getOutlineLexicalData', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return default lexicalRanking when no firstUsedOutline found', async () => {
      jest.spyOn(service, 'processOutlineData').mockResolvedValue({
        conditions: {},
        parentId: null,
        parentPath: null,
        hasSibling: false,
      });
      jest.spyOn(service, 'getLevelByMaterializedPath').mockReturnValue(1);
      jest.spyOn(service, 'findDocumentOutlines').mockResolvedValueOnce([]);
      jest.spyOn(OutlineUtils, 'getNextLexicalString').mockReturnValue('init');
  
      const result = await service.getOutlineLexicalData({
        documentId: 'doc1',
        refId: null,
        movePosition: OutlineMoveDirectionsEnum.DOWN,
      });
  
      expect(result.lexicalRanking).toBe('init');
      expect(result.previousLexicalString).toBeNull();
      expect(result.nextLexicalString).toBeNull();
    });
  
    it('should calculate lexicalRanking when movePosition is UP', async () => {
      const firstUsedOutline = { lexicalRanking: 'a3' };
      const secondUsedOutline = { lexicalRanking: 'a1' };
  
      jest.spyOn(service, 'processOutlineData').mockResolvedValue({
        conditions: {},
        parentId: 'p1',
        parentPath: ',p1,',
        hasSibling: false,
      });
      jest.spyOn(service, 'getLevelByMaterializedPath').mockReturnValue(3);
      jest
        .spyOn(service, 'findDocumentOutlines')
        .mockResolvedValueOnce([firstUsedOutline] as any)
        .mockResolvedValueOnce([secondUsedOutline] as any);
  
      jest.spyOn(service, 'getRankingBetweenOutlines').mockReturnValue('a2');
  
      const result = await service.getOutlineLexicalData({
        documentId: 'doc1',
        refId: 'r1',
        movePosition: OutlineMoveDirectionsEnum.UP,
      });
  
      expect(service.getRankingBetweenOutlines).toHaveBeenCalledWith(secondUsedOutline, firstUsedOutline);
      expect(result.lexicalRanking).toBe('a2');
      expect(result.previousLexicalString).toBe('a1');
      expect(result.nextLexicalString).toBe('a3');
    });
  
    it('should handle case when secondUsedOutline is undefined', async () => {
      const firstUsedOutline = { lexicalRanking: 'a1' };
  
      jest.spyOn(service, 'processOutlineData').mockResolvedValue({
        conditions: {},
        parentId: 'p1',
        parentPath: ',p1,',
        hasSibling: true,
      });
      jest.spyOn(service, 'getLevelByMaterializedPath').mockReturnValue(1);
      jest
        .spyOn(service, 'findDocumentOutlines')
        .mockResolvedValueOnce([firstUsedOutline] as any)
        .mockResolvedValueOnce([]);
  
      jest.spyOn(service, 'getRankingBetweenOutlines').mockReturnValue('a2');
  
      const result = await service.getOutlineLexicalData({
        documentId: 'doc1',
        refId: 'r1',
        movePosition: OutlineMoveDirectionsEnum.DOWN,
      });
  
      expect(result.previousLexicalString).toBe('a1');
      expect(result.nextLexicalString).toBeNull();
    });

    it('should set previousLexicalString = null when previousOutline is undefined', async () => {
      const nextOutline = { lexicalRanking: 'a3' };
    
      jest.spyOn(service, 'processOutlineData').mockResolvedValue({
        conditions: {},
        parentId: 'p1',
        parentPath: ',p1,',
        hasSibling: true,
      });
      jest.spyOn(service, 'getLevelByMaterializedPath').mockReturnValue(1);
      jest
        .spyOn(service, 'findDocumentOutlines')
        .mockResolvedValueOnce([nextOutline] as any)
        .mockResolvedValueOnce([]);
      jest.spyOn(service, 'getRankingBetweenOutlines').mockReturnValue('mid');
    
      const result = await service.getOutlineLexicalData({
        documentId: 'doc1',
        refId: 'r1',
        movePosition: OutlineMoveDirectionsEnum.UP,
      });
    
      expect(result.previousLexicalString).toBeNull();
      expect(result.nextLexicalString).toBe('a3');
    });
    
    it('should set previousLexicalString = null when previousOutline.lexicalRanking is undefined', async () => {
      const firstUsedOutline = { lexicalRanking: 'a3' };
      const secondUsedOutline = {} as any;
    
      jest.spyOn(service, 'processOutlineData').mockResolvedValue({
        conditions: {},
        parentId: 'p1',
        parentPath: ',p1,',
        hasSibling: false,
      });
      jest.spyOn(service, 'getLevelByMaterializedPath').mockReturnValue(2);
      jest
        .spyOn(service, 'findDocumentOutlines')
        .mockResolvedValueOnce([firstUsedOutline] as any)
        .mockResolvedValueOnce([secondUsedOutline] as any);
      jest.spyOn(service, 'getRankingBetweenOutlines').mockReturnValue('mid');
    
      const result = await service.getOutlineLexicalData({
        documentId: 'doc1',
        refId: 'r1',
        movePosition: OutlineMoveDirectionsEnum.UP,
      });
    
      expect(result.previousLexicalString).toBeNull();
      expect(result.nextLexicalString).toBe('a3');
    });
    
  });

  describe('getRelevantImportOutline', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should handle case when no lastOutline exists', async () => {
      const mockDocument = { metadata: { hasOutlines: false } };
      const mockCount = 0;
  
      jest.spyOn(service, 'getDocumentByDocumentId').mockResolvedValue(mockDocument as any);
      jest.spyOn(service['documentOutlineModel'], 'countDocuments').mockResolvedValue(mockCount);
      jest.spyOn(service, 'findDocumentOutlines').mockResolvedValue([] as any);
  
      const result = await service.getRelevantImportOutline('doc2');
  
      expect(result).toEqual({
        hasOutlines: false,
        lastOutline: undefined,
        outlinesCount: 0,
      });
    });
  });

  describe('getParentOutlineList', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return parent outlines when parentPathId exists', async () => {
      const outlineList = [
        { pathId: 'p1', parentId: 'root' },
        { pathId: 'p2', parentId: 'root' },
      ] as any;
  
      const mockParentOutlines = [{ id: 'root', pathId: 'root', level: 1 }];
      const spyFind = jest
        .spyOn(service, 'findDocumentOutlines')
        .mockResolvedValue(mockParentOutlines as any);
  
      const result = await service.getParentOutlineList('doc1', outlineList);
  
      expect(spyFind).toHaveBeenCalledWith(
        {
          documentId: 'doc1',
          pathId: { $in: ['root'] },
        },
        {},
        {
          sort: {
            lexicalRanking: 1,
            level: 1,
          },
        },
      );
      expect(result).toEqual(mockParentOutlines);
    });

    it('should delete pathId from parentIdMapper when already exists', async () => {
      const outlineList = [
        { pathId: 'a', parentId: null },
        { pathId: 'b', parentId: 'a' },
        { pathId: 'a', parentId: 'root' },
      ] as any;
      const mockParentOutlines = [{ id: 'root', pathId: 'root', level: 1 }];
      const spyFind = jest
        .spyOn(service, 'findDocumentOutlines')
        .mockResolvedValue(mockParentOutlines as any);
      const result = await service.getParentOutlineList('doc1', outlineList);
    
      expect(spyFind).toHaveBeenCalledWith(
        {
          documentId: 'doc1',
          pathId: { $in: ['root'] },
        },
        {},
        {
          sort: {
            lexicalRanking: 1,
            level: 1,
          },
        },
      );
      expect(result).toEqual(mockParentOutlines);
    });
  });

  describe('getOutlinePathData', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should throw error when document already has outlines and count >= totalOutlines', async () => {
      jest.spyOn(service, 'getRelevantImportOutline').mockResolvedValue({
        hasOutlines: true,
        lastOutline: {
          _id: 'outline1',
          documentId: 'doc1',
          pathId: 'p1',
          lexicalRanking: '001',
          parentPath: 'root',
          level: 1,
        } as any,
        outlinesCount: 10,
      });
      const data = {
        documentId: 'doc1',
        outlineChunk: [] as any,
        totalOutlines: 5,
      };
  
      await expect(
        service.getOutlinePathData({ data })
      ).rejects.toThrowError('This document already has outlines');
    });
  
    it('should return empty values when document has no outlines', async () => {
      jest.spyOn(service, 'getRelevantImportOutline').mockResolvedValue({
        hasOutlines: false,
        lastOutline: undefined,
        outlinesCount: 0,
      });
      const data = {
        documentId: 'doc1',
        outlineChunk: [] as any,
        totalOutlines: 5,
      };
  
      const result = await service.getOutlinePathData({ data });
  
      expect(result).toEqual({
        currentLexicalRanking: '',
        initialMapperList: [],
      });
    });
  
    it('should return mapper list when document has outlines and parentOutlineList found', async () => {
      jest.spyOn(service, 'getRelevantImportOutline').mockResolvedValue({
        hasOutlines: true,
        lastOutline: {
          _id: 'outline2',
          documentId: 'doc1',
          pathId: 'p2',
          lexicalRanking: '010',
          parentPath: 'root',
          level: 2,
        } as any,
        outlinesCount: 2,
      });
      const mockParentOutlines = [
        {
          _id: 'o1',
          documentId: 'doc1',
          pathId: 'p1',
          parentPath: 'root',
          lexicalRanking: '001',
          level: 1,
        },
        {
          _id: 'o2',
          documentId: 'doc1',
          pathId: 'p2',
          parentPath: 'p1',
          lexicalRanking: '002',
          level: 2,
        },
      ];
  
      jest.spyOn(service, 'getParentOutlineList').mockResolvedValue(mockParentOutlines as any);
  
      const data = {
        documentId: 'doc1',
        outlineChunk: [{ pathId: 'x1', parentId: 'p1' }] as any,
        totalOutlines: 10,
      };
      const result = await service.getOutlinePathData({ data });
  
      expect(service.getParentOutlineList).toHaveBeenCalledWith('doc1', data.outlineChunk);
      expect(result).toEqual({
        currentLexicalRanking: '010',
        initialMapperList: [
          ['p1', 'root'],
          ['p2', 'p1'],
        ],
      });
    });
  });

  describe('importDocumentOutlines', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should throw error when outlineChunk exceeds MAX_OUTLINE_PER_CHUNK', async () => {
      const data = {
        documentId: 'doc1',
        outlineChunk: new Array(MAX_OUTLINE_PER_CHUNK + 1).fill({ pathId: 'p1', parentId: null }),
        totalOutlines: 100,
      } as any;
  
      await expect(
        service.importDocumentOutlines({ data })
      ).rejects.toThrowError('Exceed max outlines per chunk');
    });
  
    it('should insert outlines and update document when valid data', async () => {
      const data = {
        documentId: 'doc1',
        outlineChunk: [
          { pathId: 'p1', parentId: null },
          { pathId: 'p2', parentId: 'p1' },
        ],
        totalOutlines: 2,
      } as any;
  
      jest.spyOn(service, 'getOutlinePathData').mockResolvedValue({
        currentLexicalRanking: '',
        initialMapperList: [['p1', 'root']],
      });
  
      const spyInsertMany = jest
        .spyOn(service['documentOutlineModel'], 'insertMany')
        .mockResolvedValue([] as any);
  
      const spyUpdate = jest
        .spyOn(service['documentSharedService'], 'updateDocument')
        .mockResolvedValue({} as any);
  
      jest.spyOn(OutlineUtils, 'getNextLexicalString').mockImplementation((prev: string) => {
        return prev ? prev + 'A' : 'A';
      });
      jest.spyOn(OutlineUtils, 'generateOutlinePath').mockImplementation(({ parentPath, parentId }) => {
        return `${parentPath || ''}/${parentId}`;
      });
  
      await service.importDocumentOutlines({ data });
  
      expect(spyInsertMany).toHaveBeenCalledTimes(1);
      const insertedDocs = spyInsertMany.mock.calls[0][0] as any[];
      expect(insertedDocs.length).toBe(2);
      expect(insertedDocs[0]).toMatchObject({
        documentId: 'doc1',
        pathId: 'p1',
        parentId: null,
        lexicalRanking: 'A',
      });
      expect(insertedDocs[1]).toMatchObject({
        documentId: 'doc1',
        pathId: 'p2',
        parentId: 'p1',
        parentPath: 'root/p1',
        lexicalRanking: 'AA',
      });
  
      expect(spyUpdate).toHaveBeenCalledWith('doc1', { 'metadata.hasOutlines': true });
    });
  });

  describe('updateDocumentOutlines', () => {
    it('should handle DELETE action', async () => {
      const data = {
        action: OutlineActionEnum.DELETE,
        pathId: mockPathId,
      } as any;

      jest.spyOn(service, 'deleteDocumentOutlinesByPathId').mockResolvedValue(mockOutline);

      const result = await service.updateDocumentOutlines(mockDocumentId, data);

      expect(service.deleteDocumentOutlinesByPathId).toHaveBeenCalledWith(mockDocumentId, mockPathId);
      expect(result.action).toBe(OutlineActionEnum.DELETE);
    });

    it('should handle EDIT action', async () => {
      const data = {
        action: OutlineActionEnum.EDIT,
        pathId: mockPathId,
        outline: {
          name: 'Updated Outline',
          pageNumber: 2,
          verticalOffset: 200,
          horizontalOffset: 100,
        },
      } as any;

      jest.spyOn(service, 'updateDocumentOutlineByPathId').mockResolvedValue(mockOutline);

      const result = await service.updateDocumentOutlines(mockDocumentId, data);

      expect(result.action).toBe(OutlineActionEnum.EDIT);
    });

    it('should handle INSERT action', async () => {
      const data = {
        action: OutlineActionEnum.INSERT,
        refId: mockRefId,
        outline: { name: 'New Outline', pageNumber: 1 },
        isSubOutline: true,
      } as any;

      jest.spyOn(service, 'insertDocumentOutlineByRefId').mockResolvedValue(mockOutline);

      const result = await service.updateDocumentOutlines(mockDocumentId, data);

      expect(result.action).toBe(OutlineActionEnum.INSERT);
    });

    it('should handle MOVE action', async () => {
      const data = {
        action: OutlineActionEnum.MOVE,
        refId: mockRefId,
        movePosition: OutlineMoveDirectionsEnum.INTO,
        pathId: mockPathId,
      } as any;

      jest.spyOn(service, 'moveDocumentOutlineByRefId').mockResolvedValue({
        previousLevel: 0,
        currentLevel: 1,
      });

      const result = await service.updateDocumentOutlines(mockDocumentId, data);

      expect(loggerService.info).toHaveBeenCalled();
      expect(result.action).toBe(OutlineActionEnum.MOVE);
    });

    it('should handle unknown action (default case)', async () => {
      const data = {
        action: 'UNKNOWN_ACTION',
      } as any;
    
      const result = await service.updateDocumentOutlines(mockDocumentId, data);
    
      expect(result).toEqual({
        ...data,
        updatedOutlines: [],
      });
    });
  });

  describe('updateOnMove', () => {
    let bulkWriteSpy: jest.SpyInstance;
    let findDocumentOutlinesSpy: jest.SpyInstance;
  
    beforeEach(() => {
      bulkWriteSpy = jest
        .spyOn((service as any).documentOutlineModel, 'bulkWrite')
        .mockResolvedValue({} as any);
  
      findDocumentOutlinesSpy = jest
        .spyOn(service, 'findDocumentOutlines')
        .mockResolvedValue([]);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should move page up correctly', async () => {
      const documentId = 'doc2';
      const movedOriginPage = 4;
      const manipulationPage = 2;
  
      findDocumentOutlinesSpy.mockResolvedValue([
        { pathId: 'a', pageNumber: 2 },
        { pathId: 'b', pageNumber: 3 },
        { pathId: 'c', pageNumber: 4 },
      ]);
  
      await service.updateOnMove({ documentId, movedOriginPage, manipulationPage });
  
      expect(findDocumentOutlinesSpy).toHaveBeenCalledWith(
        {
          documentId,
          pageNumber: { $lte: movedOriginPage, $gte: manipulationPage },
        },
        { pathId: 1, pageNumber: 1 },
      );
  
      expect(bulkWriteSpy).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { documentId, pathId: 'a' },
            update: { $set: { pageNumber: 3 } },
          },
        },
        {
          updateOne: {
            filter: { documentId, pathId: 'b' },
            update: { $set: { pageNumber: 4 } },
          },
        },
        {
          updateOne: {
            filter: { documentId, pathId: 'c' },
            update: { $set: { pageNumber: 2 } },
          },
        },
      ]);
    });
  
    it('should do nothing if no affected outlines', async () => {
      findDocumentOutlinesSpy.mockResolvedValue([]);
  
      await service.updateOnMove({ documentId: 'doc3', movedOriginPage: 1, manipulationPage: 3 });
  
      expect(bulkWriteSpy).toHaveBeenCalledWith([]);
    });
  });

  describe('updateOnManipulationChange', () => {
    it('should return early when document has no outlines', async () => {
      const document = { metadata: { hasOutlines: false } } as any;
      const data = {
        roomId: mockDocumentId,
        option: { insertPages: [3] },
        type: PageManipulation.InsertBlankPage,
        totalPages: 10,
      } as any;

      jest.spyOn(service, 'updatePageNumber').mockResolvedValue({ modifiedCount: 1 } as any);

      await service.updateOnManipulationChange(data, document);

      expect(service.updatePageNumber).not.toHaveBeenCalled();
    });

    it('should handle InsertBlankPage manipulation', async () => {
      const document = { metadata: { hasOutlines: true } } as any;
      const data = {
        roomId: mockDocumentId,
        option: { insertPages: [3] },
        type: PageManipulation.InsertBlankPage,
        totalPages: 10,
      } as any;

      jest.spyOn(service, 'updatePageNumber').mockResolvedValue({ modifiedCount: 1 } as any);

      await service.updateOnManipulationChange(data, document);

      expect(service.updatePageNumber).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        pageNumber: 3,
      });
    });

    it('should handle RemovePage manipulation', async () => {
      const document = { metadata: { hasOutlines: true } } as any;
      const data = {
        roomId: mockDocumentId,
        option: { pagesRemove: [3] },
        type: PageManipulation.RemovePage,
        totalPages: 10,
      } as any;

      jest.spyOn(service, 'updateOnRemove').mockResolvedValue();

      await service.updateOnManipulationChange(data, document);

      expect(service.updateOnRemove).toHaveBeenCalledWith(mockDocumentId, 3);
    });

    it('should handle MovePage manipulation', async () => {
      const document = { metadata: { hasOutlines: true } } as any;
      const data = {
        roomId: mockDocumentId,
        option: { pagesToMove: 3, insertBeforePage: 6 },
        type: PageManipulation.MovePage,
        totalPages: 10,
      } as any;

      jest.spyOn(service, 'updateOnMove').mockResolvedValue();

      await service.updateOnManipulationChange(data, document);

      expect(service.updateOnMove).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        movedOriginPage: 3,
        manipulationPage: 6,
      });
    });

    it('should return early when document.metadata is undefined', async () => {
      const document = {} as any;
      const data = {
        roomId: mockDocumentId,
        option: { insertPages: [3] },
        type: 'UnknownType',
        totalPages: 10,
      } as any;
      const updatePageNumberSpy = jest.spyOn(service, 'updatePageNumber').mockResolvedValue({ modifiedCount: 1 } as any);
  
      await service.updateOnManipulationChange(data, document);
      expect(updatePageNumberSpy).not.toHaveBeenCalled();
    });
  
    it('should not call anything when type is unsupported (default case)', async () => {
      const document = { metadata: { hasOutlines: true } } as any;
      const data = {
        roomId: mockDocumentId,
        option: {},
        type: 'UnknownType',
        totalPages: 10,
      } as any;
  
      const updatePageNumberSpy = jest.spyOn(service, 'updatePageNumber').mockResolvedValue({ modifiedCount: 1 } as any);
      const updateOnRemoveSpy = jest.spyOn(service, 'updateOnRemove').mockResolvedValue();
      const updateOnMoveSpy = jest.spyOn(service, 'updateOnMove').mockResolvedValue();
  
      await service.updateOnManipulationChange(data, document);
  
      expect(updatePageNumberSpy).not.toHaveBeenCalled();
      expect(updateOnRemoveSpy).not.toHaveBeenCalled();
      expect(updateOnMoveSpy).not.toHaveBeenCalled();
    });
  });

  describe('copyOutlines', () => {
    it('should copy outlines from source to destination document', async () => {
      const sourceDocId = 'source123';
      const copiedDocId = 'copied123';
      const mockOutlines = [mockOutline];

      jest.spyOn(service, 'getSortedDocumentOutlines').mockResolvedValue(mockOutlines);
      jest.spyOn(service, 'addManyOutlines').mockResolvedValue(mockOutlines);

      const result = await service.copyOutlines(sourceDocId, copiedDocId);

      expect(service.getSortedDocumentOutlines).toHaveBeenCalledWith(sourceDocId);
      expect(service.addManyOutlines).toHaveBeenCalled();
      expect(documentSharedService.updateDocument).toHaveBeenCalledWith(
        copiedDocId,
        { 'metadata.hasOutlines': true },
      );
      expect(result).toEqual(mockOutlines);
    });

    it('should return empty array when no outlines to copy', async () => {
      jest.spyOn(service, 'getSortedDocumentOutlines').mockResolvedValue([]);

      const result = await service.copyOutlines('source123', 'copied123');

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(service, 'getSortedDocumentOutlines').mockRejectedValue(new Error('Database error'));

      const result = await service.copyOutlines('source123', 'copied123');

      expect(loggerService.error).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should correctly copy outlines with parentId', async () => {
      const sourceDocId = 'sourceParent';
      const copiedDocId = 'copiedParent';
      const parentOutline = {
        name: 'Parent',
        level: 1,
        lexicalRanking: 1,
        pageNumber: 1,
        verticalOffset: 0,
        horizontalOffset: 0,
        hasChildren: true,
        pathId: 'parent-path',
        parentId: null,
      };
      const childOutline = {
        name: 'Child',
        level: 2,
        lexicalRanking: 2,
        pageNumber: 2,
        verticalOffset: 0,
        horizontalOffset: 0,
        hasChildren: false,
        pathId: 'child-path',
        parentId: 'parent-path',
      };
      const mockOutlines = [parentOutline, childOutline];
      jest.spyOn(service, 'getSortedDocumentOutlines').mockResolvedValue(mockOutlines as any);
      const addManySpy = jest.spyOn(service, 'addManyOutlines').mockImplementation(async (outlines) => outlines as any);
    
      await service.copyOutlines(sourceDocId, copiedDocId);
    
      expect(service.getSortedDocumentOutlines).toHaveBeenCalledWith(sourceDocId);
      expect(addManySpy).toHaveBeenCalled();
    
      const copied = addManySpy.mock.calls[0][0];
      const copiedParent = copied.find((o: any) => o.name === 'Parent');
      const copiedChild = copied.find((o: any) => o.name === 'Child');
    
      expect(copiedChild.parentId).toBe(copiedParent.pathId);
      expect(copiedChild.parentPath).toContain(copiedParent.pathId);
    });

    it('should set copiedParentId to null when parentData is missing in pathIdMapper', async () => {
      const sourceDocId = 'sourceMissingParent';
      const copiedDocId = 'copiedMissingParent';
      const outlineWithMissingParent = {
        name: 'OrphanChild',
        level: 2,
        lexicalRanking: 2,
        pageNumber: 2,
        verticalOffset: 0,
        horizontalOffset: 0,
        hasChildren: false,
        pathId: 'orphan-child-path',
        parentId: 'non-existent-parent-path',
      };
    
      jest.spyOn(service, 'getSortedDocumentOutlines').mockResolvedValue([outlineWithMissingParent] as any);
      const addManySpy = jest.spyOn(service, 'addManyOutlines').mockImplementation(async (outlines) => outlines as any);
    
      await service.copyOutlines(sourceDocId, copiedDocId);
    
      const copied = addManySpy.mock.calls[0][0];
      const copiedChild = copied.find((o: any) => o.name === 'OrphanChild');
    
      expect(copiedChild.parentId).toBeNull();
      expect(copiedChild.parentPath).toBeNull();
    });
  });
});