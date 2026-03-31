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

type OrganizationFoldersProps = {
  data: NestedPlainData[];
  getTooltipContent: (props?: GetTooltipContentProps) => string;
  getExpandedNodesValues: (data: TreeNodeData[]) => string[];
};

const OrganizationFolders = ({ data, getTooltipContent, getExpandedNodesValues }: OrganizationFoldersProps) => {
  const { getter, setter }: ITransferDocumentContext = useTransferDocumentContext();
  const { selectedTarget, destination, context, totalFolders } = getter;
  const { setDestination, getNestedFolders } = setter;

  const transformedData = useMemo(
    () =>
      transformTreeData(data, {
        getTooltipContent,
        isCopyModal: context.isCopyModal,
        belongToDestination: DestinationLocation.ORGANIZATION,
      }),
    [data, getTooltipContent, context.isCopyModal]
  );

  const treeNodeData = useMemo(() => {
    const rootNodeData: TreeNodeData = {
      value: selectedTarget._id,
      label: selectedTarget.name,
      type: TreeNodeTypes.Root,
      additionalData: {
        rootType: RootTypes.Organization,
        avatarRemoteId: selectedTarget.avatarRemoteId,
        getTooltipContent,
        destinationType: destination.type,
        hasFolders: totalFolders[selectedTarget._id]?.orgDocuments > 0,
        getNestedFolders,
      },
      children: transformedData,
    };
    return [rootNodeData];
  }, [transformedData, selectedTarget._id, destination.type, getTooltipContent, totalFolders, getNestedFolders]);

  const expandedNodesValues = useMemo(
    () => getExpandedNodesValues(treeNodeData),
    [getExpandedNodesValues, treeNodeData]
  );

  const handleSelect = useCallback(
    (nodeInfo: NodeInfo) => {
      const isFolder = nodeInfo.type === TreeNodeTypes.Folder;
      const destinationType = isFolder ? DestinationLocation.FOLDER : DestinationLocation.ORGANIZATION;
      setDestination({
        _id: nodeInfo.value,
        name: nodeInfo.label as string,
        type: destinationType,
        belongsTo: {
          _id: selectedTarget._id,
          name: selectedTarget.name,
          type: DestinationLocation.ORGANIZATION,
          ...(!isFolder && { data: selectedTarget }),
        },
      });
    },
    [selectedTarget._id]
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

export default React.memo(OrganizationFolders);
