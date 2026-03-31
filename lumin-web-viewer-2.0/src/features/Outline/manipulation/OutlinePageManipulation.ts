import { TreeNode } from "../types";

interface ITraverseTreeParams {
  manipulationPages: number[];
  movedOriginPage?: number;
  mergedPagesCount?: number;
}

export interface IHandlerParams extends ITraverseTreeParams {
  node: TreeNode;
}

export interface IOutlinePageManipulation {
  traverseTree(manipulationData: ITraverseTreeParams): TreeNode;
}

export abstract class OutlinePageManipulation implements IOutlinePageManipulation {
  protected readonly root: TreeNode;

  constructor(rootTree: TreeNode) {
    this.root = rootTree;
  }

  protected abstract handler(manipulationHandlerData: IHandlerParams): boolean;

  public traverseTree(manipulationData: ITraverseTreeParams): TreeNode {
    this.root.walk((node: TreeNode) => this.handler({ node, ...manipulationData }));
    return this.root;
  }
}
