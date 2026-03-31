import TreeModel from 'tree-model';
import { v4 } from 'uuid';

import OutlineUtils from 'helpers/outline';

import { TDocumentOutline } from 'interfaces/document/document.interface';

import { OutlineStoreUtils } from './outlineStore.utils';
import { TreeNode } from '../types';

type TConvertCoreToPathOutlinesParams = {
  outlines: Core.Bookmark[];
  parentId?: string | null;
};

type TNestedOutline = TDocumentOutline & {
  children: TNestedOutline[];
};

export class OutlineTransformerUtils {
  static convertToNestedOutline(outlines: TDocumentOutline[]): TreeNode {
    const outlineMap: { [key: string]: TNestedOutline } = {};
    outlines.forEach(({ pathId, ...item }) => {
      outlineMap[pathId] = { pathId, ...item, children: [], name: item.name || '' };
    });

    const rootItems: TNestedOutline[] = [];
    outlines.forEach((item) => {
      if (!item.parentId) {
        rootItems.push(outlineMap[item.pathId]);
      } else if (outlineMap[item.parentId]) {
        outlineMap[item.parentId].children.push(outlineMap[item.pathId]);
      }
    });

    const tree = new TreeModel();
    return tree.parse<TNestedOutline>({
      children: rootItems,
      name: 'Root Outline',
      pathId: null,
      level: -1,
      hasChildren: true,
      pageNumber: null,
      parentId: null,
    }) as TreeNode;
  }

  static convertCoreToPathOutlines = ({
    outlines,
    parentId = null,
  }: TConvertCoreToPathOutlinesParams): TDocumentOutline[] => {
    const pathOutlines: TDocumentOutline[] = [];
    const outlinesLength = outlines.length;

    for (let i = 0; i < outlinesLength; i++) {
      const outline = outlines[i];
      const name = OutlineStoreUtils.truncateTitle(outline.getName());
      const pageNumber = outline.getPageNumber();
      const verticalOffset = outline.getVerticalPosition();
      const horizontalOffset = outline.getHorizontalPosition();
      const children = outline.getChildren();
      const level = OutlineUtils.getNestedLevel(outline);

      const pathId = v4();

      pathOutlines.push({
        name,
        parentId,
        pathId,
        level,
        pageNumber,
        verticalOffset,
        horizontalOffset,
        hasChildren: !!children.length,
      });

      if (children.length) {
        const childrenPathStructures = this.convertCoreToPathOutlines({
          outlines: children,
          parentId: pathId,
        });
        pathOutlines.push(...childrenPathStructures);
      }
    }

    return pathOutlines;
  };
}
