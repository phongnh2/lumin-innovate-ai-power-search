/* eslint-disable class-methods-use-this */
import TreeModel from "tree-model";

import { TDocumentOutline } from "interfaces/document/document.interface";

import { TUpdateDocumentOutlinesParams, TreeNode } from "../types";

export interface ISocketOutlineManipulation {
  refreshOutline(data: TUpdateDocumentOutlinesParams): TreeNode;
}

export abstract class SocketOutlineManipulation implements ISocketOutlineManipulation {
  protected readonly root: TreeNode;

  constructor(rootTree: TreeNode) {
    this.root = rootTree;
  }

  protected getNodeByPathId(pathId: string): TreeNode {
    if (!pathId) {
      return null;
    }
    return this.root.first((n: TreeNode) => n.model.pathId === pathId) as TreeNode;
  };

  protected createNode(data: TDocumentOutline): TreeNode {
    return new TreeModel().parse<TDocumentOutline>({
      ...data,
      children: [],
    }) as TreeNode;
  }

  public getRoot(): TreeNode {
    return this.root;
  }

  public abstract processOutlineUpdate(data: TUpdateDocumentOutlinesParams): void;

  public refreshOutline(data: TUpdateDocumentOutlinesParams): TreeNode {
    this.processOutlineUpdate(data);
    return this.getRoot();
  };
}
