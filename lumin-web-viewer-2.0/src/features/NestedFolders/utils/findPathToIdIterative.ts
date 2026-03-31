import { TreeNodeData } from '../types';

export function findPathToIdIterative(rootNodes: TreeNodeData[], targetId: string) {
  const stack = rootNodes.map((node) => ({
    node,
    path: [node.value],
  }));

  while (stack.length > 0) {
    const { node, path } = stack.pop();

    if (node.value === targetId) {
      return path;
    }

    if (node.children?.length) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push({
          node: node.children[i] as TreeNodeData,
          path: [...path, node.children[i].value],
        });
      }
    }
  }

  return null; // not found
}
