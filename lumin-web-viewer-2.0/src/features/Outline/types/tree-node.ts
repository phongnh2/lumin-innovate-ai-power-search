import TreeModel from 'tree-model';

import { TDocumentOutline } from 'interfaces/document/document.interface';

export type TOutlineNode = TDocumentOutline & {
  children?: TOutlineNode[];
};

export type TreeNode = TreeModel.Node<TOutlineNode> & {
  children: TreeNode[];
  model: TOutlineNode;
  parent: TreeNode | null;
};
