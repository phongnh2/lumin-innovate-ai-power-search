import TreeModel from 'tree-model';
import { v4 } from 'uuid';

import { TDocumentOutline } from 'interfaces/document/document.interface';

import { OutlineService } from '../services/outline.service';
import { TreeNode } from '../types';

export class AiOutlineManager {
  private rootTree: TreeNode;

  private nodeMap: Map<number, TreeNode>;

  private documentId: string;

  private hasOutlines: boolean;

  constructor(rootTree: TreeNode, documentId: string, hasOutlines: boolean) {
    this.rootTree = rootTree;
    this.documentId = documentId;
    this.hasOutlines = hasOutlines;
    this.nodeMap = new Map();
  }

  // eslint-disable-next-line class-methods-use-this
  private createNode(outline: { name: string; level: number; pageNumber?: number }): TreeNode {
    return new TreeModel().parse<TDocumentOutline>({
      name: outline.name,
      pageNumber: outline.pageNumber,
      horizontalOffset: 0,
      verticalOffset: 0,
      hasChildren: false,
      pathId: v4(),
      level: outline.level,
      parentId: null,
      children: [],
    }) as TreeNode;
  }

  private emitOutlineInsert(refId: string | null, data: TDocumentOutline, isAddSub = false) {
    if (!this.hasOutlines) {
      return;
    }

    OutlineService.emitInsertOutline({
      documentId: this.documentId,
      refId,
      data,
      isAddSub,
    });
  }

  private handleRootLevelOutline(node: TreeNode) {
    this.rootTree.addChild(node);
    this.nodeMap.set(0, node);
  }

  private handleChildOutline(node: TreeNode, level: number) {
    const parentNode = this.nodeMap.get(level - 1);
    if (parentNode) {
      node.model.parentId = parentNode.model.pathId;
      parentNode.addChild(node);
    } else {
      node.model.level = 0;
      node.model.parentId = null;
      this.rootTree.addChild(node);
    }

    this.nodeMap.set(level, node);
  }

  public insertOutlines = (outlines: { name: string; level: number; pageNumber?: number }[]) => {
    const outlineNodeList: TreeNode[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const outline of outlines) {
      const node = this.createNode(outline);
      if (outline.level === 0) {
        this.handleRootLevelOutline(node);
      } else {
        this.handleChildOutline(node, outline.level);
      }
      outlineNodeList.push(node);
    }

    return outlineNodeList;
  };
}
