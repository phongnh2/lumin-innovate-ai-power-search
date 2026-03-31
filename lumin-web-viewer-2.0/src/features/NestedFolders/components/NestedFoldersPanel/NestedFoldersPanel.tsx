import { ScrollArea } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useMemo } from 'react';

import RightPanelSkeleton from 'luminComponents/TransferDocument/components/RightPanel/RightPanelSkeleton';
import { useTransferDocumentContext } from 'luminComponents/TransferDocument/hooks';
import { ITransferDocumentContext } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useTranslation } from 'hooks';

import { useEnterToSelectNode } from 'features/NestedFolders/hooks';
import { GetTooltipContentProps, TreeNodeData } from 'features/NestedFolders/types';
import { findPathToIdIterative } from 'features/NestedFolders/utils';

import { documentStorage } from 'constants/documentConstants';

import { OrganizationFolders, PersonalFolders, TeamFolders } from './components';

import styles from './NestedFoldersPanel.module.scss';

type NestedFoldersPanelProps = {
  loading: boolean;
  fullWidth: boolean;
};

const NestedFoldersPanel = ({ loading, fullWidth }: NestedFoldersPanelProps) => {
  const { t } = useTranslation();

  const { getter }: ITransferDocumentContext = useTransferDocumentContext();
  const { getTeamsOfSelectedOrg, isPersonalTargetSelected, documents, context, destination, nestedFolderData } = getter;

  useEnterToSelectNode();

  const teams = useMemo(() => getTeamsOfSelectedOrg(), [getTeamsOfSelectedOrg]);

  const documentsNotStoredInS3 = useMemo(
    () => documents.filter((doc) => doc.service !== documentStorage.s3),
    [documents]
  );

  const getExpandedNodesValues = useCallback(
    (treeNodeData: TreeNodeData[]) => {
      const { scrollTo } = destination;
      if (!scrollTo || !treeNodeData.length) {
        return [];
      }
      const path = findPathToIdIterative(treeNodeData, scrollTo);
      return path || [];
    },
    [destination.scrollTo]
  );

  const getTooltipContent = useCallback(
    (props?: GetTooltipContentProps) => {
      const { informFileAlreadyHere = false, informChangingStorage = true } = props || {};
      if (informFileAlreadyHere || (documentsNotStoredInS3.length && informChangingStorage)) {
        const alreadyExistTitle =
          documents.length > 1 ? t('modalMove.tooltipFilesAreAlreadyHere') : t('modalMove.tooltipFileIsAlreadyHere');
        const changingStorageTitle = context.isCopyModal
          ? t('modalMakeACopy.changingStorageTooltip')
          : t('modalMove.changingStorageTooltip');
        return informFileAlreadyHere ? alreadyExistTitle : changingStorageTitle;
      }
      return '';
    },
    [documentsNotStoredInS3, context.isCopyModal]
  );

  const renderContent = () => {
    if (loading) {
      return <RightPanelSkeleton />;
    }
    return (
      <div className={styles.wrapper}>
        <PersonalFolders
          data={nestedFolderData.personal}
          getTooltipContent={getTooltipContent}
          getExpandedNodesValues={getExpandedNodesValues}
        />
        {!isPersonalTargetSelected && (
          <OrganizationFolders
            data={nestedFolderData.organization}
            getTooltipContent={getTooltipContent}
            getExpandedNodesValues={getExpandedNodesValues}
          />
        )}
        {!isPersonalTargetSelected && teams.length > 0 && (
          <>
            <p className={styles.spacesHeadline}>{t('teams', { ns: 'terms' })}</p>
            {teams.map((team) => (
              <TeamFolders
                key={team._id}
                team={team}
                data={nestedFolderData.team.find((item) => item._id === team._id)?.children || []}
                getTooltipContent={getTooltipContent}
                getExpandedNodesValues={getExpandedNodesValues}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <ScrollArea
      classNames={{
        root: styles.root,
        viewport: styles.viewport,
        scrollbar: styles.scrollbar,
      }}
      type="auto"
      data-full-width={fullWidth}
    >
      {renderContent()}
    </ScrollArea>
  );
};

export default React.memo(NestedFoldersPanel);
