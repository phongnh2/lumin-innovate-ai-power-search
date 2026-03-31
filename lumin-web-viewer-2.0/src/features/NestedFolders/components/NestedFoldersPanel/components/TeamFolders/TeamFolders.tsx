import React, { useCallback, useMemo } from 'react';

import { useTransferDocumentContext } from 'luminComponents/TransferDocument/hooks';
import {
  DestinationLocation,
  ITransferDocumentContext,
} from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import FolderTree from 'features/NestedFolders/components/FolderTree';
import { RootTypes, TreeNodeTypes } from 'features/NestedFolders/constants';
import { NestedPlainData, NodeInfo, TreeNodeData, GetTooltipContentProps } from 'features/NestedFolders/types';
import { transformTreeData } from 'features/NestedFolders/utils';

import { ITeam } from 'interfaces/team/team.interface';

type TeamFoldersProps = {
  team: ITeam;
  data: NestedPlainData[];
  getTooltipContent: (props?: GetTooltipContentProps) => string;
  getExpandedNodesValues: (data: TreeNodeData[]) => string[];
};

const TeamFolders = ({ data, team, getTooltipContent, getExpandedNodesValues }: TeamFoldersProps) => {
  const { getter, setter }: ITransferDocumentContext = useTransferDocumentContext();
  const { selectedTarget, destination, context, totalFolders } = getter;
  const { setDestination, getNestedFolders } = setter;

  const transformedData = useMemo(
    () =>
      transformTreeData(data, {
        getTooltipContent,
        isCopyModal: context.isCopyModal,
        belongToDestination: DestinationLocation.ORGANIZATION_TEAM,
      }),
    [data, getTooltipContent, context.isCopyModal]
  );

  const treeNodeData = useMemo(() => {
    const rootNodeData: TreeNodeData = {
      value: team._id,
      label: team.name,
      type: TreeNodeTypes.Root,
      additionalData: {
        rootType: RootTypes.Team,
        avatarRemoteId: team.avatarRemoteId,
        getTooltipContent,
        hasFolders: totalFolders[selectedTarget._id]?.teams?.[team._id] > 0,
        getNestedFolders,
      },
      children: transformedData,
    };
    return [rootNodeData];
  }, [transformedData, team, getTooltipContent, totalFolders, selectedTarget._id, getNestedFolders]);

  const expandedNodesValues = useMemo(
    () => getExpandedNodesValues(treeNodeData),
    [getExpandedNodesValues, treeNodeData]
  );

  const handleSelect = useCallback(
    (nodeInfo: NodeInfo) => {
      const isFolder = nodeInfo.type === TreeNodeTypes.Folder;
      const destinationType = isFolder ? DestinationLocation.FOLDER : DestinationLocation.ORGANIZATION_TEAM;
      const belongsTo = isFolder
        ? {
            _id: team._id,
            name: team.name,
            type: DestinationLocation.ORGANIZATION_TEAM,
          }
        : {
            _id: selectedTarget._id,
            name: selectedTarget.name,
            type: DestinationLocation.ORGANIZATION,
            data: selectedTarget,
          };
      setDestination({
        _id: nodeInfo.value,
        name: nodeInfo.label as string,
        type: destinationType,
        belongsTo,
      });
    },
    [selectedTarget._id, team]
  );

  return (
    <FolderTree
      data={treeNodeData}
      selectedNodeValue={destination._id}
      onNodeSelect={handleSelect}
      expandedNodesValues={expandedNodesValues}
    />
  );
};

export default React.memo(TeamFolders);
