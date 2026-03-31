import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyBulkWriteOperation, UpdateResult } from 'mongodb';
import {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
} from 'mongoose';
import { v4 } from 'uuid';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { PageManipulation } from 'Common/constants/SocketConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import {
  OutlineActionEnum,
  OutlineMoveDirectionsEnum,
  MAX_NESTED_OUTLINE_LEVEL,
  MAX_OUTLINE_PER_LEVEL,
  MAX_OUTLINE_PER_CHUNK,
} from 'Document/documentConstant';
import {
  IDocument,
  IDocumentOutline,
  IDocumentOutlineModel,
  IUpdateOutlineData,
} from 'Document/interfaces/document.interface';
import { OutlineUtils } from 'Document/utils/outlineUtils';
import { OutlineData, TOutlineActionData } from 'Gateway/dtos/outlinesChanged.dto';
import { ISendManipulationChangedData } from 'Gateway/Socket.interface';
import {
  GetDocumentOutlinesInput,
  ImportDocumentOutlinesInput,
  ImportOutlineInput,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';

import { DocumentSharedService } from './document.shared.service';

@Injectable()
export class DocumentOutlineService {
  constructor(
    @InjectModel('DocumentOutline')
    private readonly documentOutlineModel: Model<IDocumentOutlineModel>,
    private readonly loggerService: LoggerService,
    private readonly documentSharedService: DocumentSharedService,
  ) {}

  async getDocumentByDocumentId(documentId: string, projection?: ProjectionType<IDocument>): Promise<IDocument> {
    return this.documentSharedService.getDocumentByDocumentId(documentId, projection);
  }

  async clearOutlineOfDocument(documentId: string) {
    const result = await this.documentOutlineModel.deleteMany({ documentId }).exec();
    await this.documentSharedService.updateDocument(documentId, { 'metadata.hasOutlines': false });
    return result;
  }

  async findDocumentOutlines(
    conditions: FilterQuery<IDocumentOutline>,
    projections: ProjectionType<IDocumentOutline> = {},
    options: QueryOptions = {},
  ): Promise<IDocumentOutline[]> {
    return this.documentOutlineModel.find(conditions, projections, options);
  }

  async findOneDocumentOutlines(
    conditions: FilterQuery<IDocumentOutline>,
    projections: ProjectionType<IDocumentOutline> = {},
    options: QueryOptions = {},
  ): Promise<IDocumentOutline> {
    const outline = await this.documentOutlineModel.findOne(conditions, projections, options);

    return outline ? { ...outline.toObject(), _id: outline._id.toHexString() } : null;
  }

  countOutlinesByParentPath(documentId: string, parentPath?: string): Promise<number> {
    return this.documentOutlineModel.countDocuments({
      documentId,
      parentPath,
    }).exec();
  }

  async addManyOutlines(outlines: Partial<IDocumentOutline>[]): Promise<IDocumentOutline[]> {
    const insertedOutlines = await this.documentOutlineModel.insertMany(outlines);
    return insertedOutlines.map((outline) => ({ ...outline.toObject(), _id: outline._id.toHexString() }));
  }

  async hasChildDocumentOutline(documentId: string, pathId: string): Promise<boolean> {
    const firstChildren = await this.documentOutlineModel.findOne({ documentId, parentId: pathId });
    return !!firstChildren;
  }

  getLevelByMaterializedPath(path: string): number {
    // The outline path will have a ',parentPathId,' format. Outline's level will be the number of pathId it has
    return path ? path.split(',').length - 2 : 0;
  }

  getFilterChildrenRegex(path: string, depth: number | null = null): RegExp {
    return new RegExp(`^${path.substring(0, path.length - 1)}(,[^,]+){0,${depth || ''}},$`);
  }

  async checkOutlineDataValidity({
    documentId,
    refId,
    modifiedPosition,
    parentPath,
    level,
    action,
    childCount,
  }: {
    documentId: string;
    refId: string | null;
    modifiedPosition: OutlineMoveDirectionsEnum;
    parentPath: string | null;
    level: number;
    action?: OutlineActionEnum;
    childCount?: number;
  }) {
    if (!refId) {
      if (level !== 0) {
        throw GraphErrorException.BadRequest('Invalid input', ErrorCode.Common.INVALID_INPUT);
      }
      return;
    }

    if (modifiedPosition === OutlineMoveDirectionsEnum.INTO) {
      let parentPathCount = this.getLevelByMaterializedPath(parentPath);
      if (action === OutlineActionEnum.MOVE) {
        parentPathCount += childCount;
      }

      if (level >= MAX_NESTED_OUTLINE_LEVEL || parentPathCount >= MAX_NESTED_OUTLINE_LEVEL) {
        throw GraphErrorException.BadRequest(`Nested level must be less than or equal ${MAX_NESTED_OUTLINE_LEVEL}`, ErrorCode.Common.INVALID_INPUT);
      }
      return;
    }

    const totalOutlinesAtLevel = await this.countOutlinesByParentPath(documentId, parentPath);
    if (totalOutlinesAtLevel < MAX_OUTLINE_PER_LEVEL) {
      return;
    }

    throw GraphErrorException.BadRequest(
      `Number of outline in the same level must be less than or equal ${MAX_OUTLINE_PER_LEVEL}`,
      ErrorCode.Common.INVALID_INPUT,
    );
  }

  async insertDocumentOutlineByRefId({
    documentId,
    refId,
    data,
    isSubOutline,
  }: {
    documentId: string;
    refId: string | null;
    data: OutlineData;
    isSubOutline?: boolean;
  }): Promise<IDocumentOutline> {
    const modifiedPosition = isSubOutline ? OutlineMoveDirectionsEnum.INTO : OutlineMoveDirectionsEnum.DOWN;

    const {
      lexicalRanking,
      parentPath,
      parentId,
      hasSibling,
      level,
    } = await this.getOutlineLexicalData({ documentId, refId, movePosition: modifiedPosition });
    await this.checkOutlineDataValidity({
      documentId, refId, modifiedPosition, parentPath, level,
    });
    const createdData = await this.documentOutlineModel.create({
      ...data,
      documentId,
      parentId,
      parentPath,
      level,
      lexicalRanking,
      hasChildren: false,
    });

    if (parentId && !hasSibling) {
      await this.updateDocumentOutlineByPathId({ documentId, pathId: parentId, data: { hasChildren: true } });
    }

    return { ...createdData.toObject(), _id: createdData._id.toHexString() };
  }

  async updateDocumentOutlineByPathId({
    documentId,
    pathId,
    data,
  }: { documentId: string; pathId: string; data: Partial<IDocumentOutline> }): Promise<IDocumentOutline> {
    const updatedOutline = await this.documentOutlineModel.findOneAndUpdate({ documentId, pathId }, { $set: data }, { new: true });
    return updatedOutline ? { ...updatedOutline.toObject(), _id: updatedOutline._id.toHexString() } : null;
  }

  async deleteDocumentOutlinesByPathId(documentId: string, pathId: string): Promise<IDocumentOutline> {
    const currentOutline = await this.findOneDocumentOutlines({ documentId, pathId });

    if (!currentOutline) {
      throw GraphErrorException.NotFound('Outline not found', ErrorCode.Document.OUTLINE_NOT_FOUND);
    }

    const parentPath = OutlineUtils.generateOutlinePath({
      parentPath: currentOutline.parentPath,
      parentId: currentOutline.pathId,
    });

    await this.documentOutlineModel.deleteMany({
      documentId,
      $or: [
        {
          parentPath: this.getFilterChildrenRegex(parentPath),
        },
        {
          pathId,
        },
      ],
    });

    if (currentOutline.parentId) {
      const hasChildren = await this.hasChildDocumentOutline(documentId, currentOutline.parentId);
      if (!hasChildren && currentOutline.parentId) {
        await this.updateDocumentOutlineByPathId({ documentId, pathId: currentOutline.parentId, data: { hasChildren: false } });
      }
    }

    return currentOutline;
  }

  async updateChildOutline({
    documentId,
    formerParentData,
    newParentData,
    lexicalLimit,
  }: {
    documentId: string;
    formerParentData: IDocumentOutline;
    newParentData: Partial<IDocumentOutline>;
    lexicalLimit: string;
  }): Promise<IUpdateOutlineData[]> {
    const updateList: IUpdateOutlineData[] = [];
    const childrenOutlines = await this.findDocumentOutlines(
      {
        documentId,
        level: { $gt: formerParentData.level },
        parentPath: this.getFilterChildrenRegex(
          OutlineUtils.generateOutlinePath({
            parentPath: formerParentData.parentPath,
            parentId: formerParentData.pathId,
          }),
        ),
      },
      {},
      { sort: { lexicalRanking: 1 } },
    );
    const childrenOutlinesLength = childrenOutlines.length;

    if (!childrenOutlinesLength) {
      return updateList;
    }

    const parentIdMapper = new Map();
    if (newParentData.parentId) {
      parentIdMapper.set(formerParentData.pathId, newParentData.parentPath);
    }

    const minSubCharacter = Math.floor(Math.log(childrenOutlinesLength) / Math.log(13)) + 1;
    let middleString = newParentData.lexicalRanking;
    let minCharacter: number | null = null;

    if (lexicalLimit) {
      middleString = OutlineUtils.getMiddleString(newParentData.lexicalRanking, lexicalLimit);
      minCharacter = minSubCharacter + middleString.length;
    }

    let currentLexicalRanking = middleString;

    for (let i = 0; i < childrenOutlinesLength; i++) {
      const { parentId, pathId } = childrenOutlines[i];
      const parentPath: string | null = parentId
        ? OutlineUtils.generateOutlinePath({
          parentPath: parentIdMapper.get(parentId),
          parentId,
        })
        : null;
      if (parentId) {
        parentIdMapper.set(pathId, parentPath);
      }
      const level = this.getLevelByMaterializedPath(parentPath);
      const lexicalRanking = OutlineUtils.getNextLexicalString(currentLexicalRanking, minCharacter);
      currentLexicalRanking = lexicalRanking;

      updateList.push({
        pathId,
        data: {
          parentPath,
          level,
          lexicalRanking,
        },
      });
    }
    parentIdMapper.clear();

    return updateList;
  }

  async moveDocumentOutlineByRefId({
    documentId,
    refId,
    movePosition,
    pathId,
  }: {
    documentId: string;
    refId: string;
    movePosition: OutlineMoveDirectionsEnum;
    pathId?: string;
  }): Promise<{
    previousLevel: number;
    currentLevel: number;
  }> {
    if (!refId) {
      throw GraphErrorException.BadRequest('RefId are required', ErrorCode.Document.PATH_ID_MISSING);
    }

    const updateList: IUpdateOutlineData[] = [];
    const isMovingInto = movePosition === OutlineMoveDirectionsEnum.INTO;
    const currentOutline = await this.findOneDocumentOutlines({ documentId, pathId });
    if (!currentOutline) {
      throw GraphErrorException.NotFound('Outline not found', ErrorCode.Document.OUTLINE_NOT_FOUND);
    }
    const previousLevel = currentOutline.level;
    const {
      lexicalRanking: movedLexicalRanking,
      parentPath: movedParentPath,
      parentId: movedParentId,
      hasSibling,
      level: movedLevel,
      nextLexicalString,
    } = await this.getOutlineLexicalData({
      documentId,
      refId,
      movePosition,
    });

    if (isMovingInto && movedParentId && !hasSibling) {
      updateList.push({ pathId: movedParentId, data: { hasChildren: true } });
    }

    updateList.push({
      pathId: currentOutline.pathId,
      data: {
        parentPath: movedParentPath,
        parentId: movedParentId,
        level: movedLevel,
        lexicalRanking: movedLexicalRanking,
      },
    });

    const updateChildList = await this.updateChildOutline({
      documentId,
      formerParentData: currentOutline,
      newParentData: {
        parentPath: movedParentPath,
        parentId: movedParentId,
        level: movedLevel,
        lexicalRanking: movedLexicalRanking,
      },
      lexicalLimit: nextLexicalString,
    });

    await this.checkOutlineDataValidity({
      documentId,
      refId,
      modifiedPosition: movePosition,
      parentPath: movedParentPath,
      level: movedLevel,
      action: OutlineActionEnum.MOVE,
      childCount: updateChildList.length,
    });

    updateList.push(...updateChildList);

    const updateListLength = updateList.length;
    const bulkWriteList: AnyBulkWriteOperation<IDocumentOutlineModel>[] = [];

    for (let i = 0; i < updateListLength; i++) {
      const { pathId: updatedPathId, data: updateData } = updateList[i];
      bulkWriteList.push({
        updateOne: {
          filter: { documentId, pathId: updatedPathId },
          update: {
            $set: updateData,
          },
        },
      });
    }

    await this.documentOutlineModel.bulkWrite(bulkWriteList);

    if (currentOutline.parentId) {
      const hasChildrenOutline = await this.hasChildDocumentOutline(documentId, currentOutline.parentId);
      if (!hasChildrenOutline && currentOutline.parentId) {
        await this.updateDocumentOutlineByPathId({ documentId, pathId: currentOutline.parentId, data: { hasChildren: false } });
      }
    }

    return {
      previousLevel,
      currentLevel: movedLevel,
    };
  }

  async getSortedDocumentOutlines(documentId: string): Promise<IDocumentOutline[]> {
    return this.findDocumentOutlines({ documentId }, {}, {
      sort: {
        lexicalRanking: 1,
        level: 1,
      },
    });
  }

  async getDocumentOutlines(input: GetDocumentOutlinesInput): Promise<IDocumentOutline[]> {
    const document = await this.getDocumentByDocumentId(input.documentId, { 'metadata.hasOutlines': 1 });
    if (!document.metadata?.hasOutlines) {
      throw GraphErrorException.NotFound('Document does not have outlines', ErrorCode.Document.DOES_NOT_HAVE_OUTLINES);
    }

    return this.getSortedDocumentOutlines(input.documentId);
  }

  async processOutlineData({
    documentId,
    refId,
    movePosition,
  }: {
    documentId: string;
    refId?: string | null;
    movePosition: OutlineMoveDirectionsEnum;
  }): Promise<{
    conditions: FilterQuery<IDocumentOutline>;
    parentId: string | null;
    parentPath: string | null;
    hasSibling: boolean;
  }> {
    const conditions: FilterQuery<IDocumentOutline> = {
      documentId,
    };
    const isModifiedInto = movePosition === OutlineMoveDirectionsEnum.INTO;
    const isModifiedUp = movePosition === OutlineMoveDirectionsEnum.UP;
    let parentPath: string | null = null;
    let parentId: string | null = null;
    let hasSibling = false;

    if (!refId) {
      return {
        conditions,
        parentId,
        parentPath,
        hasSibling,
      };
    }

    const refOutline = await this.documentOutlineModel.findOne({ documentId, pathId: refId });
    const refParentPath = refOutline?.parentPath || null;

    const childOfRefPath = refParentPath ? `${refParentPath}${refId},` : `,${refId},`;

    if (isModifiedInto) {
      parentPath = childOfRefPath;
      parentId = refId;
      hasSibling = Boolean(refOutline?.hasChildren);
    } else {
      parentPath = refParentPath;
      parentId = refOutline?.parentId || null;
      hasSibling = true;
    }

    if (isModifiedUp) {
      conditions.pathId = refId;
    } else {
      conditions.$or = [
        {
          parentPath: this.getFilterChildrenRegex(childOfRefPath),
        },
        {
          pathId: refId,
        },
      ];
    }

    return {
      conditions,
      parentId,
      parentPath,
      hasSibling,
    };
  }

  getRankingBetweenOutlines(previousOutline: IDocumentOutline, nextOutline: IDocumentOutline): string {
    if (nextOutline) {
      return OutlineUtils.getMiddleString(previousOutline?.lexicalRanking || '', nextOutline.lexicalRanking);
    }
    return OutlineUtils.getNextLexicalString(previousOutline.lexicalRanking);
  }

  async getOutlineLexicalData({
    documentId,
    refId,
    movePosition,
  }: {
    documentId: string;
    refId?: string | null;
    movePosition: OutlineMoveDirectionsEnum;
  }): Promise<{
    lexicalRanking: string | null;
    parentId: string | null;
    parentPath: string | null;
    hasSibling: boolean;
    level: number;
    previousLexicalString: string | null;
    nextLexicalString: string | null;
  }> {
    const isModifiedUp = movePosition === OutlineMoveDirectionsEnum.UP;

    const {
      conditions, parentId, parentPath, hasSibling,
    } = await this.processOutlineData({ documentId, refId, movePosition });

    const level = this.getLevelByMaterializedPath(parentPath);

    const [firstUsedOutline] = await this.findDocumentOutlines(conditions, { lexicalRanking: 1 }, { sort: { lexicalRanking: -1 }, limit: 1 });

    if (!firstUsedOutline) {
      return {
        lexicalRanking: OutlineUtils.getNextLexicalString(''),
        parentId,
        parentPath,
        hasSibling,
        level,
        previousLexicalString: null,
        nextLexicalString: null,
      };
    }

    const [secondUsedOutline] = await this.findDocumentOutlines({
      documentId,
      lexicalRanking: (isModifiedUp ? { $lt: firstUsedOutline.lexicalRanking } : { $gt: firstUsedOutline.lexicalRanking }),
    }, { lexicalRanking: 1 }, { sort: { lexicalRanking: isModifiedUp ? -1 : 1 }, limit: 1 });

    const [previousOutline, nextOutline] = isModifiedUp ? [secondUsedOutline, firstUsedOutline] : [firstUsedOutline, secondUsedOutline];

    const lexicalRanking = this.getRankingBetweenOutlines(previousOutline, nextOutline);

    return {
      lexicalRanking,
      parentId,
      parentPath,
      hasSibling,
      level,
      previousLexicalString: previousOutline?.lexicalRanking || null,
      nextLexicalString: nextOutline?.lexicalRanking || null,
    };
  }

  async getRelevantImportOutline(documentId: string): Promise<{
    hasOutlines: boolean;
    lastOutline: IDocumentOutline;
    outlinesCount: number;
  }> {
    const [
      {
        metadata: { hasOutlines },
      },
      outlinesCount,
      [lastOutline],
    ] = await Promise.all([
      this.getDocumentByDocumentId(documentId, { 'metadata.hasOutlines': 1 }),
      this.documentOutlineModel.countDocuments({ documentId }),
      this.findDocumentOutlines(
        { documentId },
        { lexicalRanking: 1 },
        { sort: { lexicalRanking: -1 }, limit: 1 },
      ),
    ]);

    return {
      hasOutlines,
      lastOutline,
      outlinesCount,
    };
  }

  async getParentOutlineList(documentId: string, outlineList: ImportOutlineInput[]): Promise<IDocumentOutline[]> {
    let parentOutlineList: IDocumentOutline[] = [];
    const parentIdMapper: Map<string, boolean> = new Map();
    for (let i = outlineList.length - 1; i >= 0; i--) {
      const currentOutline = outlineList[i];
      if (parentIdMapper.has(currentOutline.pathId)) {
        parentIdMapper.delete(currentOutline.pathId);
      }
      if (currentOutline.parentId) {
        parentIdMapper.set(currentOutline.parentId, true);
      }
    }

    const parentPathIdList = [...parentIdMapper.keys()];
    if (parentPathIdList.length) {
      parentOutlineList = await this.findDocumentOutlines(
        {
          documentId,
          pathId: { $in: [...parentIdMapper.keys()] },
        },
        {},
        {
          sort: {
            lexicalRanking: 1,
            level: 1,
          },
        },
      );
    }

    parentIdMapper.clear();
    return parentOutlineList;
  }

  async getOutlinePathData({ data, isInsertMultiple = false }: { data: ImportDocumentOutlinesInput, isInsertMultiple?: boolean }): Promise<{
    currentLexicalRanking: string;
    initialMapperList: [string, string][];
  }> {
    const { documentId, outlineChunk, totalOutlines } = data;
    const { hasOutlines, lastOutline, outlinesCount } = await this.getRelevantImportOutline(documentId);
    if (hasOutlines && outlinesCount >= totalOutlines && !isInsertMultiple) {
      throw GraphErrorException.BadRequest('This document already has outlines', ErrorCode.Document.OUTLINE_EXISTED);
    }

    const initialMapperList: [string, string][] = [];

    if (hasOutlines) {
      const parentOutlineList = await this.getParentOutlineList(documentId, outlineChunk);
      if (parentOutlineList.length) {
        initialMapperList.push(
          ...parentOutlineList.map<[string, string]>((parentOutline) => [
            parentOutline.pathId,
            parentOutline.parentPath,
          ]),
        );
      }
    }

    return {
      currentLexicalRanking: lastOutline?.lexicalRanking || '',
      initialMapperList,
    };
  }

  async importDocumentOutlines({ data, isInsertMultiple = false }: { data: ImportDocumentOutlinesInput, isInsertMultiple?: boolean }): Promise<void> {
    const { documentId, outlineChunk, totalOutlines } = data;
    if (outlineChunk.length > MAX_OUTLINE_PER_CHUNK) {
      throw GraphErrorException.BadRequest('Exceed max outlines per chunk', ErrorCode.Document.OUTLINE_NOT_VALID);
    }

    const {
      currentLexicalRanking: previousRanking,
      initialMapperList,
    } = await this.getOutlinePathData({ data, isInsertMultiple });

    let currentLexicalRanking = previousRanking;
    const parentPathMapper = new Map(initialMapperList);
    const documentOutlines = [];
    const minCharacter = Math.floor(Math.log(Math.max(outlineChunk.length, totalOutlines)) / Math.log(26)) + 1;

    // eslint-disable-next-line no-restricted-syntax
    for (const outline of outlineChunk) {
      const { parentId, pathId } = outline;
      const lexicalRanking = OutlineUtils.getNextLexicalString(currentLexicalRanking, minCharacter);
      const parentPath: string | null = parentId
        ? OutlineUtils.generateOutlinePath({
          parentPath: parentPathMapper.get(parentId),
          parentId,
        })
        : null;
      if (parentId) {
        parentPathMapper.set(pathId, parentPath);
      }
      currentLexicalRanking = lexicalRanking;

      documentOutlines.push({
        ...outline,
        documentId,
        parentId,
        pathId,
        parentPath,
        lexicalRanking,
      });
    }

    parentPathMapper.clear();
    await this.documentOutlineModel.insertMany(documentOutlines);
    await this.documentSharedService.updateDocument(documentId, { 'metadata.hasOutlines': true });
  }

  async updateDocumentOutlines(documentId: string, data: TOutlineActionData): Promise<{
    action: OutlineActionEnum,
    isSubOutline?: boolean;
    movePosition?: OutlineMoveDirectionsEnum;
    pathId?: string;
    refId?: string;
    updatedOutlines: Partial<IDocumentOutline>[];
  }> {
    const updatedOutlines: Partial<IDocumentOutline>[] = [];

    switch (data.action) {
      case OutlineActionEnum.DELETE: {
        const { pathId } = data;
        await this.deleteDocumentOutlinesByPathId(documentId, pathId);
        break;
      }
      case OutlineActionEnum.EDIT: {
        const { pathId, outline } = data;
        const affectedOutline = await this.updateDocumentOutlineByPathId({
          documentId,
          pathId,
          data: {
            name: outline.name,
            pageNumber: outline.pageNumber,
            verticalOffset: outline.verticalOffset,
            horizontalOffset: outline.horizontalOffset,
          },
        });
        updatedOutlines.push({
          name: affectedOutline.name,
          pageNumber: affectedOutline.pageNumber,
          verticalOffset: affectedOutline.verticalOffset,
          horizontalOffset: affectedOutline.horizontalOffset,
        });
        break;
      }
      case OutlineActionEnum.INSERT: {
        const { refId, outline, isSubOutline } = data;
        const affectedOutline = await this.insertDocumentOutlineByRefId({
          documentId,
          refId,
          data: outline,
          isSubOutline,
        });
        updatedOutlines.push(affectedOutline);
        break;
      }
      case OutlineActionEnum.MOVE: {
        const { refId, movePosition, pathId } = data;
        const { previousLevel, currentLevel } = await this.moveDocumentOutlineByRefId({
          documentId,
          refId,
          movePosition,
          pathId,
        });
        this.loggerService.info({
          context: this.updateDocumentOutlines.name,
          extraInfo: {
            action: data.action,
            documentId,
            previousLevel,
            currentLevel,
          },
        });
        break;
      }
      default:
        break;
    }

    return {
      ...data,
      updatedOutlines,
    };
  }

  async updateOnRemove(documentId: string, removedPage: number): Promise<void> {
    await this.documentOutlineModel.updateMany({
      documentId,
      pageNumber: removedPage,
    }, {
      $set: {
        pageNumber: null,
      },
    }).exec();
    await this.updatePageNumber({ documentId, pageNumber: removedPage, updateAmount: -1 });
  }

  async updatePageNumber({
    documentId,
    pageNumber,
    updateAmount = 1,
  }: { documentId: string, pageNumber: number, updateAmount?: number }): Promise<UpdateResult<IDocumentOutline>> {
    return this.documentOutlineModel.updateMany({
      documentId,
      pageNumber: {
        $gte: pageNumber,
      },
    }, {
      $inc: {
        pageNumber: updateAmount,
      },
    }).exec();
  }

  async updateOnMove({
    documentId,
    movedOriginPage,
    manipulationPage,
  }: {
    documentId: string;
    movedOriginPage: number;
    manipulationPage: number;
  }): Promise<void> {
    const isMovingDown = movedOriginPage < manipulationPage;
    const delta = isMovingDown ? -1 : 1;
    const affectedOutlines = await this.findDocumentOutlines(
      {
        documentId,
        pageNumber: isMovingDown
          ? {
            $gte: movedOriginPage,
            $lte: manipulationPage,
          }
          : {
            $lte: movedOriginPage,
            $gte: manipulationPage,
          },
      },
      { pathId: 1, pageNumber: 1 },
    );
    const bulkWriteList: AnyBulkWriteOperation<IDocumentOutlineModel>[] = [];
    for (let i = 0; i < affectedOutlines.length; i++) {
      const { pathId, pageNumber } = affectedOutlines[i];
      const newPageNumber = pageNumber === movedOriginPage ? manipulationPage : pageNumber + delta;
      bulkWriteList.push({
        updateOne: {
          filter: { documentId, pathId },
          update: {
            $set: {
              pageNumber: newPageNumber,
            },
          },
        },
      });
    }
    await this.documentOutlineModel.bulkWrite(bulkWriteList);
  }

  async updateOnManipulationChange(data: ISendManipulationChangedData, document: IDocument): Promise<void> {
    if (!document.metadata?.hasOutlines) {
      return;
    }
    const { roomId: documentId, option, type } = data;
    const {
      insertPages, pagesRemove, pagesToMove, insertBeforePage,
    } = option;

    switch (type) {
      case PageManipulation.InsertBlankPage: {
        await this.updatePageNumber({ documentId, pageNumber: insertPages[0] });
        break;
      }
      case PageManipulation.RemovePage: {
        await this.updateOnRemove(documentId, pagesRemove[0]);
        break;
      }
      case PageManipulation.MovePage: {
        await this.updateOnMove({
          documentId,
          movedOriginPage: pagesToMove,
          manipulationPage: insertBeforePage,
        });
        break;
      }
      default:
        break;
    }
  }

  async copyOutlines(sourceDocId: string, copiedDocId: string): Promise<IDocumentOutline[]> {
    try {
      const outlines = await this.getSortedDocumentOutlines(sourceDocId);
      if (!outlines.length) {
        return [];
      }

      const pathIdMapper = new Map();
      const copiedOutlines = outlines.map((outline) => {
        const {
          name,
          level,
          lexicalRanking,
          pageNumber,
          verticalOffset,
          horizontalOffset,
          hasChildren,
          pathId,
          parentId,
        } = outline;
        const copiedPathId = v4();
        const parentData = pathIdMapper.get(parentId);
        let copiedParentId = null;
        let copiedParentPath = null;
        if (parentId) {
          copiedParentId = parentData?.pathId || null;
          copiedParentPath = copiedParentId
            ? OutlineUtils.generateOutlinePath({
              parentPath: parentData.parentPath,
              parentId: copiedParentId,
            })
            : null;
        }
        pathIdMapper.set(pathId, { pathId: copiedPathId, parentPath: copiedParentPath });

        return {
          name,
          level,
          lexicalRanking,
          pageNumber,
          verticalOffset,
          horizontalOffset,
          hasChildren,
          pathId: copiedPathId,
          parentId: copiedParentId,
          parentPath: copiedParentPath,
          documentId: copiedDocId,
        };
      });
      pathIdMapper.clear();
      const results = await this.addManyOutlines(copiedOutlines);
      await this.documentSharedService.updateDocument(copiedDocId, { 'metadata.hasOutlines': true });
      return results;
    } catch (error) {
      this.loggerService.error({
        error,
        context: this.copyOutlines.name,
      });
      return [];
    }
  }
}
