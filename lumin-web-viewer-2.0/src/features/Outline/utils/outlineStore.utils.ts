import produce from 'immer';
import { cloneDeep } from 'lodash';
import { AnyAction } from 'redux';
import TreeModel from 'tree-model';
import { v4 } from 'uuid';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { documentGraphServices } from 'services/graphServices';

import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import { eventTracking } from 'utils';
import errorExtract from 'utils/error';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { documentStorage } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { LOGGER } from 'constants/lumin-common';
import { OUTLINES_SAVE_THRESHOLD } from 'constants/urls';

import { IDocumentBase, TDocumentOutline } from 'interfaces/document/document.interface';

import { OutlineTransformerUtils } from './outlineTransformer.utils';
import { OutlineService } from '../services';
import { OutlineActionType, OutlineMovePosition, TOutlineNode, TreeNode } from '../types';
import { EmitOutlineHandlerType } from '../types/emitOutlines.type';

const { dispatch } = store;

const TITLE_MAX_LENGTH = 255;
const DEFAULT_CHUNK_SIZE = 100;
const DEFAULT_OUTLINES_SAVE_THRESHOLD = 20;

export class OutlineStoreUtils {
  static truncateTitle = (title: string) => title.slice(0, TITLE_MAX_LENGTH);

  static cloneNode = (node: TreeNode) => {
    const clonedNode = cloneDeep(node);
    Object.setPrototypeOf(clonedNode, Object.getPrototypeOf(node) as object);
    return clonedNode;
  };

  static findNodeByPathId = (rootNode: TreeNode, pathId: string) =>
    rootNode.first((n: TreeNode) => n.model.pathId === pathId) as TreeNode;

  static modifyNodeLevel = (node: TreeNode) => {
    node.model.level = node.getPath().length - 2;
    if (node.hasChildren()) {
      node.children.forEach((child) => {
        this.modifyNodeLevel(child);
      });
    }
  };

  static flatOutlineNodeList = (outlineNodeList: TreeNode[]): TOutlineNode[] =>
    outlineNodeList.map((node: TreeNode) => {
      const { hasChildren, horizontalOffset, level, name, pageNumber, parentId, pathId, verticalOffset } = node.model;
      return {
        hasChildren,
        horizontalOffset,
        level,
        name,
        pageNumber,
        parentId,
        pathId,
        verticalOffset,
      };
    });

  static getFlatOutline = (rootNode: TreeNode): TOutlineNode[] =>
    this.flatOutlineNodeList(rootNode.all((node: TreeNode) => node.model.pathId !== null) as TreeNode[]);

  static getNodeListFromRoot = (rootNode: TreeNode): TreeNode[] =>
    rootNode.all((node: TreeNode) => node.model.pathId !== null) as TreeNode[];

  static setOutlines = (outlineTree: TreeNode) => {
    const clonedOutlineTree = this.cloneNode(outlineTree);
    dispatch(actions.setOutlines(clonedOutlineTree) as AnyAction);
  };

  static getOutlineListFromCore = async (): Promise<TDocumentOutline[]> => {
    try {
      const outlines = await core.getOutlines();
      return OutlineTransformerUtils.convertCoreToPathOutlines({ outlines });
    } catch (error) {
      logger.logError({ reason: LOGGER.Service.OUTLINE_ERROR, error: error as Error });
    }
  };

  static initialOutlines = async ({ currentDocument }: { currentDocument: IDocumentBase }) => {
    let outlineList: TDocumentOutline[] = [];
    try {
      dispatch(actions.setIsLoadingDocumentOutlines(true) as AnyAction);
      if (!currentDocument?.metadata?.hasOutlines) {
        outlineList = await this.getOutlineListFromCore();
      } else {
        outlineList = await documentGraphServices.getDocumentOutlines({ documentId: currentDocument._id });
      }
    } catch (error) {
      if (errorExtract.isGraphError(error)) {
        const { message } = errorExtract.extractGqlError(error) as { message: string };
        logger.logError({ reason: LOGGER.Service.OUTLINE_ERROR, error: error as Error, message });
        outlineList = await this.getOutlineListFromCore();
      }
    } finally {
      const outlineTree = OutlineTransformerUtils.convertToNestedOutline(outlineList || []);
      this.setOutlines(outlineTree);
      dispatch(actions.setIsLoadingDocumentOutlines(false) as AnyAction);
    }
  };

  static chunkOutlines({
    outlines,
    chunkSize = DEFAULT_CHUNK_SIZE,
  }: {
    outlines: TDocumentOutline[];
    chunkSize?: number;
  }) {
    const chunks: TDocumentOutline[][] = [];
    for (let i = 0; i < outlines.length; i += chunkSize) {
      chunks.push(outlines.slice(i, i + chunkSize));
    }
    return chunks;
  }

  static async importOutlinesInChunks({
    documentId,
    outlines,
    chunkSize = DEFAULT_CHUNK_SIZE,
  }: {
    documentId: string;
    outlines: TDocumentOutline[];
    chunkSize?: number;
  }) {
    const totalOutlines = outlines.length;
    if (!totalOutlines) {
      await documentGraphServices.importDocumentOutlines({
        documentId,
        outlineChunk: [],
        totalOutlines: 0,
      });
      return;
    }

    const chunks = this.chunkOutlines({ outlines, chunkSize });
    // eslint-disable-next-line no-restricted-syntax
    for (const chunk of chunks) {
      // eslint-disable-next-line no-await-in-loop
      await documentGraphServices.importDocumentOutlines({
        documentId,
        outlineChunk: chunk,
        totalOutlines,
      });
    }
  }

  static importDocumentOutlines = async () => {
    const state = store.getState();
    const currentDocument = selectors.getCurrentDocument(state);
    if (currentDocument?.metadata?.hasOutlines) {
      return;
    }

    const rootTree = selectors.getOutlines(state);
    const isLoadingGetDocumentOutlines = selectors.getIsLoadingDocumentOutlines(state);
    if (isLoadingGetDocumentOutlines) {
      return;
    }

    try {
      dispatch(actions.setIsLoadingDocumentOutlines(true) as AnyAction);
      await this.importOutlinesInChunks({
        documentId: currentDocument._id,
        outlines: this.getFlatOutline(rootTree),
      });
      const newDocument = produce(currentDocument, (draft) => {
        draft.metadata.hasOutlines = true;
      });
      dispatch(actions.setCurrentDocument(newDocument) as AnyAction);
    } catch (error) {
      const { message } = errorExtract.extractGqlError(error) as { message: string };
      logger.logError({ reason: LOGGER.Service.OUTLINE_ERROR, error: error as Error, message });
    } finally {
      dispatch(actions.setIsLoadingDocumentOutlines(false) as AnyAction);
    }
  };

  static insertMultipleOutlineNode = async (outlineNodeList: TreeNode[]) => {
    const state = store.getState();
    const currentDocument = selectors.getCurrentDocument(state);
    try {
      dispatch(actions.setIsLoadingDocumentOutlines(true) as AnyAction);
      const chunks = this.chunkOutlines({ outlines: this.flatOutlineNodeList(outlineNodeList) });
      // eslint-disable-next-line no-restricted-syntax
      for (const chunk of chunks) {
        // eslint-disable-next-line no-await-in-loop
        await documentGraphServices.importDocumentOutlines({
          documentId: currentDocument._id,
          outlineChunk: chunk,
          totalOutlines: outlineNodeList.length,
          isInsertMultiple: true,
        });
      }
    } catch (error) {
      const { message } = errorExtract.extractGqlError(error) as { message: string };
      logger.logError({ reason: LOGGER.Service.OUTLINE_ERROR, error: error as Error, message });
    } finally {
      dispatch(actions.setIsLoadingDocumentOutlines(false) as AnyAction);
    }
  };

  static addOutline = ({
    name,
    pageNumber,
    isAddSub,
    horizontalOffset,
    verticalOffset,
    activeOutlinePath,
  }: {
    name: string;
    pageNumber: number;
    isAddSub?: boolean;
    horizontalOffset: number;
    verticalOffset: number;
    activeOutlinePath: string;
  }) => {
    const rootTree = selectors.getOutlines(store.getState());
    const currentDocument = selectors.getCurrentDocument(store.getState());
    const node = new TreeModel().parse<TDocumentOutline>({
      name,
      pageNumber,
      horizontalOffset,
      verticalOffset,
      hasChildren: false,
      pathId: v4(),
      level: 0,
      parentId: null,
      children: [],
    }) as TreeNode;
    eventTracking(UserEventConstants.EventType.OUTLINE_CREATED, {
      LuminFileId: currentDocument._id,
    }).catch((error) => {
      logger.logError({ reason: LOGGER.Service.OUTLINE_ERROR, error: error as Error });
    });

    if (!activeOutlinePath) {
      const root = this.findNodeByPathId(rootTree, null);
      root.addChild(node);
      this.modifyNodeLevel(node);
      this.setOutlines(rootTree);
      this.handleOutlinesSaveThreshold({
        outlineAction: OutlineActionType.Insert,
        data: {
          documentId: currentDocument._id,
          refId: null,
          data: node.model,
        },
      });
      return;
    }

    const activeNode = this.findNodeByPathId(rootTree, activeOutlinePath);
    if (!activeNode) {
      return;
    }

    if (isAddSub) {
      activeNode.addChild(node);
      this.modifyNodeLevel(node);
      node.model.parentId = activeNode.model.pathId;
      this.setOutlines(rootTree);
      this.handleOutlinesSaveThreshold({
        outlineAction: OutlineActionType.Insert,
        data: {
          documentId: currentDocument._id,
          refId: activeOutlinePath,
          data: node.model,
          isAddSub,
        },
      });
      return;
    }

    // Add to next sibling
    const indexOfActiveNode = activeNode.getIndex();
    activeNode.parent.addChildAtIndex(node, indexOfActiveNode + 1);
    this.modifyNodeLevel(node);
    node.model.parentId = activeNode.model.parentId;
    this.setOutlines(rootTree);
    this.handleOutlinesSaveThreshold({
      outlineAction: OutlineActionType.Insert,
      data: {
        documentId: currentDocument._id,
        refId: activeOutlinePath,
        data: node.model,
      },
    });
  };

  static modifyOutline = ({
    name,
    pageNumber,
    x,
    y,
    activeOutlinePath,
  }: {
    name: string;
    pageNumber: number;
    x: number;
    y: number;
    activeOutlinePath: string;
  }) => {
    const currentDocument = selectors.getCurrentDocument(store.getState());
    const rootTree = selectors.getOutlines(store.getState());
    const activeNode = this.findNodeByPathId(rootTree, activeOutlinePath);
    if (!activeNode) {
      return;
    }
    activeNode.model.name = name;
    activeNode.model.pageNumber = pageNumber;
    activeNode.model.horizontalOffset = x;
    activeNode.model.verticalOffset = y;
    this.setOutlines(rootTree);
    this.handleOutlinesSaveThreshold({
      outlineAction: OutlineActionType.Edit,
      data: {
        documentId: currentDocument._id,
        pathId: activeOutlinePath,
        data: activeNode.model,
      },
    });
  };

  static deleteOutline = ({ activeOutlinePath }: { activeOutlinePath: string }) => {
    const currentDocument = selectors.getCurrentDocument(store.getState());
    const rootTree = selectors.getOutlines(store.getState());
    const activeNode = this.findNodeByPathId(rootTree, activeOutlinePath);
    if (!activeNode) {
      return;
    }
    activeNode.drop();
    this.setOutlines(rootTree);
    this.handleOutlinesSaveThreshold({
      outlineAction: OutlineActionType.Delete,
      data: {
        documentId: currentDocument._id,
        pathId: activeOutlinePath,
      },
    });
  };

  static moveOutlineBeforeTarget = ({
    dragOutline,
    dropOutline,
  }: {
    dragOutline: TDocumentOutline;
    dropOutline: TDocumentOutline;
  }) => {
    const currentDocument = selectors.getCurrentDocument(store.getState());
    const rootTree = selectors.getOutlines(store.getState());
    const dragNode = this.findNodeByPathId(rootTree, dragOutline.pathId);
    const dropNode = this.findNodeByPathId(rootTree, dropOutline.pathId);
    if (!dragNode || !dropNode) {
      return;
    }
    const dropIndex = dropNode.getIndex();
    const targetNode = this.cloneNode(dragNode);
    dropNode.parent.addChildAtIndex(targetNode, dropIndex);
    targetNode.model.level = dropNode.model.level;
    targetNode.model.parentId = dropNode.model.parentId;
    if (targetNode.hasChildren()) {
      targetNode.children.forEach((child: TreeNode) => {
        this.modifyNodeLevel(child);
      });
    }
    dragNode.drop();
    this.setOutlines(rootTree);
    this.handleOutlinesSaveThreshold({
      outlineAction: OutlineActionType.Move,
      data: {
        documentId: currentDocument._id,
        refId: dropOutline.pathId,
        movePosition: OutlineMovePosition.Up,
        pathId: targetNode.model.pathId,
      },
    });
  };

  static moveOutlineAfterTarget = ({
    dragOutline,
    dropOutline,
  }: {
    dragOutline: TDocumentOutline;
    dropOutline: TDocumentOutline;
  }) => {
    const currentDocument = selectors.getCurrentDocument(store.getState());
    const rootTree = selectors.getOutlines(store.getState());
    const dragNode = this.findNodeByPathId(rootTree, dragOutline.pathId);
    const dropNode = this.findNodeByPathId(rootTree, dropOutline.pathId);
    if (!dragNode || !dropNode) {
      return;
    }
    const dropIndex = dropNode.getIndex();
    const targetNode = this.cloneNode(dragNode);
    dropNode.parent.addChildAtIndex(targetNode, dropIndex + 1);
    targetNode.model.level = dropNode.model.level;
    targetNode.model.parentId = dropNode.model.parentId;
    if (targetNode.hasChildren()) {
      targetNode.children.forEach((child: TreeNode) => {
        this.modifyNodeLevel(child);
      });
    }
    dragNode.drop();
    this.setOutlines(rootTree);
    this.handleOutlinesSaveThreshold({
      outlineAction: OutlineActionType.Move,
      data: {
        documentId: currentDocument._id,
        refId: dropOutline.pathId,
        movePosition: OutlineMovePosition.Down,
        pathId: targetNode.model.pathId,
      },
    });
  };

  static moveOutlineInward = ({
    dragOutline,
    dropOutline,
  }: {
    dragOutline: TDocumentOutline;
    dropOutline: TDocumentOutline;
  }) => {
    const currentDocument = selectors.getCurrentDocument(store.getState());
    const rootTree = selectors.getOutlines(store.getState());
    const dragNode = this.findNodeByPathId(rootTree, dragOutline.pathId);
    const dropNode = this.findNodeByPathId(rootTree, dropOutline.pathId);
    if (!dragNode || !dropNode) {
      return;
    }
    const targetNode = this.cloneNode(dragNode);
    dropNode.addChild(targetNode);
    this.modifyNodeLevel(targetNode);
    targetNode.model.parentId = dropNode.model.pathId;
    dragNode.drop();
    this.setOutlines(rootTree);
    this.handleOutlinesSaveThreshold({
      outlineAction: OutlineActionType.Move,
      data: {
        documentId: currentDocument._id,
        refId: dropOutline.pathId,
        movePosition: OutlineMovePosition.Into,
        pathId: targetNode.model.pathId,
      },
    });
  };

  static createTreeNode = (data: Partial<TDocumentOutline>): TreeNode =>
    new TreeModel().parse<Partial<TDocumentOutline>>({
      ...data,
      pathId: v4(),
      children: [],
    }) as TreeNode;

  static sanitizePageNumber = (pageNumber: unknown): number | null =>
    Number.isFinite(pageNumber) ? (pageNumber as number) : null;

  static isExceedSaveThreshold = () => {
    if (!OUTLINES_SAVE_THRESHOLD) {
      logger.logError({
        reason: LOGGER.Service.OUTLINE_ERROR,
        message: 'OUTLINES_SAVE_THRESHOLD is not set',
      });
    }

    const rootTree = selectors.getOutlines(store.getState());
    const totalOutlines = rootTree?.children?.length || 0;
    return totalOutlines > (OUTLINES_SAVE_THRESHOLD || DEFAULT_OUTLINES_SAVE_THRESHOLD);
  };

  static handleOutlinesSaveThreshold = ({ outlineAction, data }: EmitOutlineHandlerType) => {
    const currentDocument = selectors.getCurrentDocument(store.getState());
    const canModifyDriveContent = selectors.canModifyDriveContent(store.getState());
    const { service, isSystemFile } = currentDocument;
    if (isSystemFile) {
      return;
    }

    if (this.isExceedSaveThreshold()) {
      if (![documentStorage.google, documentStorage.onedrive].includes(service) || canModifyDriveContent) {
        fireEvent(CUSTOM_EVENT.SYNC_DOCUMENT);
      }
      return;
    }

    switch (outlineAction) {
      case OutlineActionType.Insert:
        OutlineService.emitInsertOutline(data);
        break;
      case OutlineActionType.Edit:
        OutlineService.emitEditOutline(data);
        break;
      case OutlineActionType.Delete:
        OutlineService.emitDeleteOutline(data);
        break;
      case OutlineActionType.Move:
        OutlineService.emitMoveOutline(data);
        break;
      default:
        break;
    }
  };
}
