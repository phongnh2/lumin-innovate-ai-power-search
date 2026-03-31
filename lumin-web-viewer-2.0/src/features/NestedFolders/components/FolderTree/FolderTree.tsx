import { useTree, Tree } from 'lumin-ui/kiwi-ui';
import React, { Ref, forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';

import { DestinationLocation } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { RootTypes, TreeNodeTypes } from 'features/NestedFolders/constants';
import { TreeNodeData, RenderTreeNodePayload, NodeInfo } from 'features/NestedFolders/types';

import TreeNode from './components/TreeNode';
import { useScrollToTreeNode } from './hooks';

type FolderTreeProps = {
  data: TreeNodeData[];
  onNodeSelect: (nodeInfo: NodeInfo) => void;
  selectedNodeValue: string | null;
  expandedNodesValues?: string[];
};

const FolderTree = forwardRef((props: FolderTreeProps, ref: Ref<HTMLUListElement>) => {
  const treeRef = useRef<HTMLUListElement>();

  const { data, onNodeSelect, selectedNodeValue, expandedNodesValues = [] } = props;

  const tree = useTree();

  useScrollToTreeNode({
    treeNodeData: data,
    expandedNodesValues,
    setExpandedState: tree.setExpandedState,
    containerElement: treeRef.current as HTMLElement,
  });

  useImperativeHandle(ref, () => treeRef.current);

  const customedTree = useMemo(
    () => ({
      ...tree,
      setHoveredNode: () => {},
    }),
    [tree]
  );

  const renderNode = useCallback(
    (nodeProps: RenderTreeNodePayload) => {
      const { additionalData, value, type } = nodeProps.node;
      const {
        rootType,
        destinationType,
        getTooltipContent,
        isCopyModal,
        belongToDestination,
        hasFolders,
        isPersonalTargetSelected,
      } = additionalData || {};

      const isRootNode = type === TreeNodeTypes.Root;
      const isFolderNode = type === TreeNodeTypes.Folder;
      const isMatchSelectedValue = selectedNodeValue === value;

      const rootSelected = {
        [RootTypes.Team]: isMatchSelectedValue,
        [RootTypes.Personal]: isMatchSelectedValue && destinationType === DestinationLocation.PERSONAL,
        [RootTypes.Organization]: isMatchSelectedValue && destinationType === DestinationLocation.ORGANIZATION,
      }[rootType];
      const hasChildren = isRootNode && !isPersonalTargetSelected ? Boolean(hasFolders) : nodeProps.hasChildren;
      const selected = isRootNode ? rootSelected : isMatchSelectedValue;

      let informChangingStorage = true;

      if (isFolderNode) {
        informChangingStorage = Boolean(isCopyModal) || belongToDestination !== DestinationLocation.PERSONAL;
      } else if (rootType === RootTypes.Personal) {
        informChangingStorage = Boolean(isCopyModal);
      }

      const tooltip = getTooltipContent({
        informChangingStorage,
      });

      return (
        <TreeNode
          {...nodeProps}
          hasChildren={hasChildren}
          onNodeSelect={onNodeSelect}
          selected={selected}
          tooltip={tooltip}
        />
      );
    },
    [selectedNodeValue]
  );

  return (
    <Tree
      ref={treeRef}
      data={data}
      tree={customedTree}
      selectOnClick={false}
      expandOnClick={false}
      levelOffset="var(--kiwi-spacing-3)"
      renderNode={renderNode}
    />
  );
});

export default React.memo(FolderTree);
