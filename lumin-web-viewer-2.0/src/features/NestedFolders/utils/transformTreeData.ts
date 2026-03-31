import { TreeNodeData, NestedPlainData } from '../types';

export function transformTreeData(
  nodes: NestedPlainData[] = [],
  additionalData: TreeNodeData['additionalData'] = {}
): TreeNodeData[] {
  return nodes.map((node) => ({
    value: node._id,
    label: node.name,
    type: node.type,
    additionalData,
    children: transformTreeData(node.children || [], additionalData),
  }));
}
