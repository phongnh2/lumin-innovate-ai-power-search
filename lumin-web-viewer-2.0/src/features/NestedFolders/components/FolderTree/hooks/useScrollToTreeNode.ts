import { TreeProps, getTreeExpandedState } from 'lumin-ui/kiwi-ui';
import { useEffect, useState } from 'react';

import { TreeNodeData } from 'features/NestedFolders/types';

type UseScrollToTreeNodeProps = {
  treeNodeData: TreeNodeData[];
  containerElement: HTMLElement;
  expandedNodesValues: string[];
  setExpandedState: TreeProps['tree']['setExpandedState'];
};

const useScrollToTreeNode = ({
  containerElement,
  expandedNodesValues,
  setExpandedState,
  treeNodeData,
}: UseScrollToTreeNodeProps) => {
  const [hasExpanded, setHasExpanded] = useState(false);

  useEffect(() => {
    const { length } = expandedNodesValues;
    if (!length || !treeNodeData.length) {
      return;
    }
    if (length > 1) {
      setExpandedState(getTreeExpandedState(treeNodeData, expandedNodesValues.slice(0, -1)));
    }
    setHasExpanded(true);
  }, [expandedNodesValues, treeNodeData]);

  useEffect(() => {
    if (!hasExpanded || !containerElement) {
      return;
    }
    const lastNode = expandedNodesValues[expandedNodesValues.length - 1];
    const lastNodeElement = containerElement.querySelector(`[data-value="${lastNode}"]`);
    if (lastNodeElement) {
      setTimeout(() => {
        lastNodeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }, 100);
    }
    setHasExpanded(false);
  }, [hasExpanded, containerElement, expandedNodesValues]);
};

export default useScrollToTreeNode;
