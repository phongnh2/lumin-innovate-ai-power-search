import React, { useCallback, useMemo } from 'react';

import { useTransferDocumentContext } from 'luminComponents/TransferDocument/hooks';
import {
  DestinationLocation,
  ITransferDocumentContext,
} from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useGetCurrentUser, useTranslation } from 'hooks';

import FolderTree from 'features/NestedFolders/components/FolderTree';
import { RootTypes, TreeNodeTypes } from 'features/NestedFolders/constants';
import { GetTooltipContentProps, NestedPlainData, NodeInfo, TreeNodeData } from 'features/NestedFolders/types';
import { transformTreeData } from 'features/NestedFolders/utils';

type PersonalFoldersProps = {
  data: NestedPlainData[];
  getTooltipContent: (props: GetTooltipContentProps) => string;
  getExpandedNodesValues: (data: TreeNodeData[]) => string[];
};

const PersonalFolders = ({ data, getTooltipContent, getExpandedNodesValues }: PersonalFoldersProps) => {
  const { t } = useTranslation();

  const currentUser = useGetCurrentUser();

  const { getter, setter }: ITransferDocumentContext = useTransferDocumentContext();
  const { isPersonalTargetSelected, selectedTarget, destination, personalData, documents, context, totalFolders } =
    getter;
  const { setDestination, getNestedFolders } = setter;
  const { isOldProfessional } = personalData;
  const {
    belongsTo: { workspaceId },
  } = documents[0];

  const transformedData = useMemo(
    () =>
      transformTreeData(data, {
        getTooltipContent,
        isCopyModal: context.isCopyModal,
        belongToDestination: DestinationLocation.PERSONAL,
      }),
    [data, getTooltipContent, context.isCopyModal]
  );

  const treeNodeData = useMemo(() => {
    const rootNodeData: TreeNodeData = {
      value: selectedTarget._id,
      label: t('modalMove.myDocuments'),
      type: TreeNodeTypes.Root,
      additionalData: {
        rootType: RootTypes.Personal,
        destinationType: destination.type,
        getTooltipContent,
        isCopyModal: context.isCopyModal,
        getNestedFolders,
        isPersonalTargetSelected,
        hasFolders: totalFolders[selectedTarget._id]?.myDocuments > 0,
      },
      children: transformedData,
    };
    return [rootNodeData];
  }, [
    transformedData,
    selectedTarget._id,
    destination.type,
    getTooltipContent,
    context.isCopyModal,
    totalFolders,
    getNestedFolders,
    isPersonalTargetSelected,
  ]);

  const expandedNodesValues = useMemo(
    () => getExpandedNodesValues(treeNodeData),
    [getExpandedNodesValues, treeNodeData]
  );

  const handleSelect = useCallback(
    (nodeInfo: NodeInfo) => {
      const isBelongsToMyDocuments = !isOldProfessional || isPersonalTargetSelected !== Boolean(workspaceId);
      const isFolder = nodeInfo.type === TreeNodeTypes.Folder;
      const destinationType = isFolder ? DestinationLocation.FOLDER : DestinationLocation.PERSONAL;
      const belongsTo = isFolder
        ? {
            _id: currentUser._id,
            name: currentUser.name,
            type: DestinationLocation.PERSONAL,
          }
        : {
            _id: selectedTarget._id,
            name: selectedTarget.name,
            type: isBelongsToMyDocuments ? DestinationLocation.ORGANIZATION : DestinationLocation.PERSONAL,
            data: selectedTarget,
          };
      setDestination({
        _id: nodeInfo.value,
        name: nodeInfo.label as string,
        type: destinationType,
        belongsTo,
      });
    },
    [workspaceId, selectedTarget._id, isOldProfessional, isPersonalTargetSelected, currentUser]
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

export default React.memo(PersonalFolders);
