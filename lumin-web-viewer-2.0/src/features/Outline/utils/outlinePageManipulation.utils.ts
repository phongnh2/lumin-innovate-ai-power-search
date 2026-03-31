import selectors from 'selectors';
import { store } from 'store';

import fireEvent from 'helpers/fireEvent';
import OutlineUtils from 'helpers/outline';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { MANIPULATION_TYPE } from 'constants/lumin-common';

import { OutlineStoreUtils } from './outlineStore.utils';
import { OutlinePageDeleted } from '../manipulation/OutlinePageDeleted';
import { OutlinePageInserted } from '../manipulation/OutlinePageInserted';
import { IOutlinePageManipulation } from '../manipulation/OutlinePageManipulation';
import { OutlinePageMerged } from '../manipulation/OutlinePageMerged';
import { OutlinePageMoved } from '../manipulation/OutlinePageMoved';
import { TreeNode } from '../types';

interface IUpdateOnManipulationChangedParams {
  type: string;
  manipulationPages: number[];
  movedOriginPage?: number;
  mergedPagesCount?: number;
  mergedOutlines?: TreeNode[];
}

interface IUpdateOnCollabManipChangedParams {
  type: string;
  option: {
    insertBeforePage?: number;
    pagesToMove?: number;
    pagesRemove?: number[];
    insertPages?: number[];
  };
  shouldSaveOutlines?: boolean;
}

export class OutlinePageManipulationUtils {
  static updateOnManipulationChanged = async (data: IUpdateOnManipulationChangedParams) => {
    const { type, mergedOutlines = [], ...manipulationData } = data;
    const state = store.getState();
    const rootTree = selectors.getOutlines(state);
    const currentDocument = selectors.getCurrentDocument(state);
    if (!rootTree) {
      return;
    }
    let action: IOutlinePageManipulation;

    switch (type) {
      case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
        action = new OutlinePageInserted(rootTree);
        break;
      }
      case MANIPULATION_TYPE.REMOVE_PAGE: {
        action = new OutlinePageDeleted(rootTree);
        break;
      }
      case MANIPULATION_TYPE.MOVE_PAGE: {
        action = new OutlinePageMoved(rootTree);
        break;
      }
      case MANIPULATION_TYPE.MERGE_PAGE: {
        action = new OutlinePageMerged(rootTree);
        break;
      }
      default:
        break;
    }

    const root = action.traverseTree(manipulationData);
    const isMergedAction = type === MANIPULATION_TYPE.MERGE_PAGE;

    if (isMergedAction && mergedOutlines.length) {
      const isMergedBeforeCurrentDoc = manipulationData.manipulationPages[0] === 1;
      for (let i = 0; i < mergedOutlines.length; i++) {
        const mergedOutline = mergedOutlines[i];
        if (isMergedBeforeCurrentDoc) {
          root.addChildAtIndex(mergedOutline, i);
        } else {
          root.addChild(mergedOutline);
        }
      }
    }
    OutlineStoreUtils.setOutlines(root);
    const isExceedSaveThreshold = OutlineStoreUtils.isExceedSaveThreshold();
    if (!isMergedAction && isExceedSaveThreshold) {
      fireEvent(CUSTOM_EVENT.SYNC_DOCUMENT);
    }

    if (isMergedAction || currentDocument.isSystemFile || isExceedSaveThreshold) {
      return;
    }

    await OutlineStoreUtils.importDocumentOutlines();
  };

  static getPageNumberOfBookmark = ({
    bookmark,
    isAllPageAvailable,
    pageDelta = 0,
    mergedPageList = [],
  }: {
    bookmark: Core.Bookmark;
    isAllPageAvailable: boolean;
    pageDelta: number;
    mergedPageList: number[];
  }) => {
    const pageNumber = bookmark.getPageNumber();
    if (isAllPageAvailable) {
      return OutlineStoreUtils.sanitizePageNumber(pageNumber + pageDelta);
    }

    if (!mergedPageList.includes(pageNumber)) {
      return null;
    }

    return OutlineStoreUtils.sanitizePageNumber(mergedPageList.indexOf(pageNumber) + 1 + pageDelta);
  };

  static buildDocumentOutlineTree = ({
    bookmarks,
    isAllPageAvailable,
    mergedPageList,
    pageDelta,
    parentNode,
  }: {
    bookmarks: Core.Bookmark[];
    isAllPageAvailable: boolean;
    mergedPageList: number[];
    pageDelta: number;
    parentNode: TreeNode;
  }) => {
    const rootNodeLevel = -1;
    // eslint-disable-next-line no-restricted-syntax
    for (const bookmark of bookmarks) {
      const pageNumber = this.getPageNumberOfBookmark({ bookmark, isAllPageAvailable, pageDelta, mergedPageList });
      const children = bookmark.getChildren();
      const node = OutlineStoreUtils.createTreeNode({
        name: OutlineStoreUtils.truncateTitle(bookmark.getName()),
        pageNumber,
        verticalOffset: bookmark.getVerticalPosition(),
        horizontalOffset: bookmark.getHorizontalPosition(),
        level: OutlineUtils.getNestedLevel(bookmark),
        parentId: parentNode.model.level !== rootNodeLevel ? parentNode.model.pathId : null,
        hasChildren: !!children.length,
      });
      parentNode.addChild(node);
      if (children.length) {
        this.buildDocumentOutlineTree({
          bookmarks: children,
          isAllPageAvailable,
          mergedPageList,
          pageDelta,
          parentNode: node,
        });
      }
    }
  };

  static createDocumentOutlineNode = ({
    bookmarks,
    isAllPageAvailable,
    mergedPageList,
    pageDelta,
    fileName,
  }: {
    bookmarks: Core.Bookmark[];
    isAllPageAvailable: boolean;
    mergedPageList: number[];
    pageDelta: number;
    fileName: string;
  }) => {
    const rootNode = OutlineStoreUtils.createTreeNode({
      name: 'Root Outline',
      level: -1,
      hasChildren: true,
      pageNumber: null,
      parentId: null,
    });
    if (bookmarks.length) {
      this.buildDocumentOutlineTree({ bookmarks, isAllPageAvailable, mergedPageList, pageDelta, parentNode: rootNode });
    } else {
      const startPageNumber = 1;
      const node = OutlineStoreUtils.createTreeNode({
        name: fileName,
        level: 0,
        verticalOffset: 0,
        horizontalOffset: 0,
        hasChildren: false,
        pageNumber: OutlineStoreUtils.sanitizePageNumber(startPageNumber + pageDelta),
        parentId: null,
      });
      rootNode.addChild(node);
    }
    return rootNode;
  };

  static updateOnCollabManipChanged = async (manipData: IUpdateOnCollabManipChangedParams) => {
    const {
      type,
      option: { insertBeforePage, pagesToMove, pagesRemove = [], insertPages = [] } = {},
      shouldSaveOutlines = true,
    } = manipData;
    if (!shouldSaveOutlines) {
      return;
    }

    const data: IUpdateOnManipulationChangedParams = {
      type,
      manipulationPages: null,
    };
    switch (type) {
      case MANIPULATION_TYPE.MOVE_PAGE: {
        if (Number.isFinite(pagesToMove)) {
          data.movedOriginPage = pagesToMove;
          data.manipulationPages = [insertBeforePage];
        }
        break;
      }
      case MANIPULATION_TYPE.REMOVE_PAGE: {
        data.manipulationPages = pagesRemove;
        break;
      }
      case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
        data.manipulationPages = insertPages;
        break;
      }
      default:
        break;
    }

    if (!Number.isFinite(data.manipulationPages)) {
      return;
    }

    await this.updateOnManipulationChanged(data);
  };
}
