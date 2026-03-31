import classNames from 'classnames';
import { Icomoon, IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { forwardRef, Ref, useCallback, useMemo, useRef } from 'react';

import { RootTypes, TreeNodeTypes } from 'features/NestedFolders/constants';
import { NodeInfo, RenderTreeNodePayload } from 'features/NestedFolders/types';

import { TOOLTIP_MAX_WIDTH } from 'constants/lumin-common';

import NodeIcon from '../NodeIcon';
import RootNode from '../RootNode';

import styles from './TreeNode.module.scss';

type TreeNodeProps = {
  onNodeSelect(nodeInfo: NodeInfo): void;
} & RenderTreeNodePayload;

const TreeNode = forwardRef(({ onNodeSelect, ...props }: TreeNodeProps, ref: Ref<HTMLDivElement>) => {
  const { elementProps, node, hasChildren, expanded, selected, disabled, tooltip, tree } = props;
  const { additionalData, type } = node;
  const { rootType, avatarRemoteId, getNestedFolders, isPersonalTargetSelected } = additionalData || {};
  const isRootNode = type === TreeNodeTypes.Root;

  const hasFetchedFolders = useRef(false);
  const fetchingFolders = useRef(false);

  const e2eProps = useMemo(() => {
    if (!isRootNode) {
      return {};
    }
    const dataCyValue = {
      [RootTypes.Organization]: 'nested_panel_organization_item',
      [RootTypes.Personal]: 'nested_panel_personal_item',
      [RootTypes.Team]: 'nested_panel_team_item',
    }[rootType];
    return { 'data-cy': dataCyValue };
  }, [isRootNode, rootType]);

  const handleSelect = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) {
        return;
      }
      onNodeSelect(node);
    },
    [disabled]
  );

  const handleToggle = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!hasChildren || fetchingFolders.current) {
        return;
      }
      if (!isRootNode || hasFetchedFolders.current || isPersonalTargetSelected) {
        tree.toggleExpanded(node.value);
        return;
      }
      if (expanded) {
        hasFetchedFolders.current = true;
        tree.toggleExpanded(node.value);
        return;
      }
      if (getNestedFolders) {
        fetchingFolders.current = true;
        await getNestedFolders({ rootType, teamId: node.value })
          .then(() => {
            hasFetchedFolders.current = true;
            tree.toggleExpanded(node.value);
          })
          .finally(() => {
            fetchingFolders.current = false;
          });
      }
    },
    [hasChildren, getNestedFolders, expanded, isPersonalTargetSelected]
  );

  const renderNodeIcon = () => {
    if (isRootNode) {
      return (
        <RootNode
          label={node.label as string}
          rootType={rootType}
          avatarRemoteId={avatarRemoteId}
          className={classNames(styles.icon, disabled && styles.disabled)}
        />
      );
    }
    return (
      <NodeIcon
        className={classNames(styles.icon, disabled && styles.disabled)}
        isFolder={hasChildren || type === TreeNodeTypes.Folder}
      />
    );
  };

  return (
    <PlainTooltip
      position="bottom-start"
      content={tooltip}
      withinPortal={false}
      middlewares={{
        shift: {
          padding: {
            left: 16,
          },
        },
      }}
      maw={TOOLTIP_MAX_WIDTH}
    >
      <div
        {...elementProps}
        ref={ref}
        role="presentation"
        className={classNames(elementProps.className, styles.container)}
        onClick={handleSelect}
        data-tree-node="true"
        data-selected={selected}
        data-disabled={disabled}
        {...e2eProps}
      >
        <IconButton
          size="sm"
          className={classNames(styles.toggleButton, !hasChildren && styles.hidden)}
          onClick={handleToggle}
          icon={
            <Icomoon
              size="sm"
              type={expanded ? 'chevron-down-sm' : 'chevron-right-sm'}
              color="var(--kiwi-colors-surface-on-surface)"
            />
          }
        />
        {renderNodeIcon()}
        <span className={classNames(styles.label, disabled && styles.disabled)}>{node.label}</span>
        {selected && <span className={styles.selected} />}
      </div>
    </PlainTooltip>
  );
});

export default React.memo(TreeNode);
