import classNames from 'classnames';
import { Button, Icomoon, PlainTooltip, Checkbox, Text, Divider, IconButton } from 'lumin-ui/kiwi-ui';
import React, { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { DocumentContext } from 'lumin-components/Document/context';
import { DocumentListContext } from 'lumin-components/DocumentList/Context';

import {
  useAvailablePersonalWorkspace,
  useGetCurrentOrganization,
  useGetCurrentTeam,
  useGetFolderType,
  useTranslation,
} from 'hooks';

import { organizationServices, teamServices } from 'services';

import { ActionName } from 'utils/Factory/EventCollection/constants/DocumentActionsEvent';
import docActionsEvent from 'utils/Factory/EventCollection/DocActionsEventCollection';

import { MultipleDownLoadButton } from 'features/MultipleDownLoad';
import MultipleMergeButton from 'features/MultipleMerge/components/MultipleMergeButton/MultipleMergeButton';
import { MAX_MERGE_DOCUMENTS_SELECTION } from 'features/MultipleMerge/constants';
import { useBulkActionIconButton } from 'features/WebChatBot/hooks/useBulkActionIconButton';

import { folderType } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { ITeam } from 'interfaces/team/team.interface';

import styles from './DocumentSelectionBar.module.scss';

type DocumentSelectionBarProps = {
  totalDoc?: number;
  totalSelected?: number;
  currentTotalDoc?: number;
  isDisabled?: boolean;
  isDisplay: boolean;
  isChecked?: boolean;
  onMove?: () => void;
  onRemove?: () => void;
  onChangeCheckbox?: () => void;
  onCancelSelectMode?: () => void;
  currentTotalFolder?: number;
  onMerge?: () => void;
};

type MultipleActionsMappingType = {
  canPerformMove: boolean;
  canPerformDelete: boolean;
  canPerformMerge: boolean;
  canPerformDownload: boolean;
  tooltipContent: string;
};

const DocumentSelectionBar = ({
  isDisplay,
  isDisabled,
  totalSelected = 0,
  currentTotalDoc = 0,
  isChecked,
  onRemove,
  onMove,
  onChangeCheckbox,
  onCancelSelectMode,
  currentTotalFolder,
  onMerge,
  totalDoc = 0,
}: DocumentSelectionBarProps) => {
  const { t } = useTranslation();
  const currentFolderType = useGetFolderType();
  const currentOrganization = useGetCurrentOrganization();
  const currentTeam = useGetCurrentTeam() as ITeam;
  const isPersonalWorkspaceAvailable = useAvailablePersonalWorkspace();
  const isInSharedTab = useMemo(() => currentFolderType === folderType.SHARED, [currentFolderType]);

  const isBulkActionIconButton = useBulkActionIconButton();

  const isOffline = useSelector(selectors.isOffline);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { onMoveDocumentsDecorator, onHandleDocumentOvertimeLimit, onMergeDocumentsDecorator } =
    useContext(DocumentListContext);

  const { selectedDocList, selectedFolders } = useContext(DocumentContext);
  const isSelectedDocument = selectedDocList.length > 0;
  const isSelectedFolder = selectedFolders.length > 0;
  const isMergeOperationAllowed = selectedDocList.length <= MAX_MERGE_DOCUMENTS_SELECTION;

  const isIndeterminateState = totalSelected > 0 && totalSelected < currentTotalFolder + currentTotalDoc;

  const handleHeaderAction = ({
    actionHandler,
    decoratorHandler,
    actionName,
  }: {
    actionHandler: () => void;
    decoratorHandler: (documents: IDocumentBase[], onSuccess?: () => void) => void;
    actionName: ActionName;
  }) => {
    docActionsEvent
      .bulkActions({
        actionName,
        numberSelectedDocs: selectedDocList.length,
        numberSelectedFolders: selectedFolders.length,
      })
      .catch(() => {});
    const documentLimited = selectedDocList.find((doc) => doc.isOverTimeLimit);
    if (documentLimited) {
      onHandleDocumentOvertimeLimit(documentLimited);
      return;
    }

    decoratorHandler(selectedDocList, actionHandler);
  };

  const canPerformMergeOperation = () => isSelectedDocument && !isSelectedFolder && isMergeOperationAllowed;

  const commonMultipleActionsMapping = (): MultipleActionsMappingType => {
    const isSelectedDocumentAndFolder = isSelectedDocument && isSelectedFolder;

    let tooltipContent = null;
    if (isSelectedDocumentAndFolder) {
      tooltipContent = t('documentPage.reskin.actionCannotPerformedOnFoldersAndDocuments');
    } else if (isSelectedFolder) {
      tooltipContent = t('documentPage.reskin.actionCannotPerformedOnFolders');
    } else if (!isMergeOperationAllowed) {
      tooltipContent = t('multipleMerge.totalDocumentsExceed');
    }
    return {
      canPerformMove: isSelectedDocument && !isSelectedFolder,
      canPerformDelete: !isSelectedDocumentAndFolder,
      canPerformDownload: true,
      canPerformMerge: canPerformMergeOperation(),
      tooltipContent,
    };
  };

  const multipleActionsMappingForOrgAndTeam = (): MultipleActionsMappingType => {
    let isMemberOrganizationOrTeam = !organizationServices.isManager(currentOrganization.userRole);
    if (currentTeam._id) {
      isMemberOrganizationOrTeam = !teamServices.isOrgTeamAdmin(currentTeam.roleOfUser);
    }
    if (isMemberOrganizationOrTeam) {
      return {
        canPerformMove: false,
        canPerformDelete: false,
        canPerformDownload: true,
        canPerformMerge: canPerformMergeOperation(),
        tooltipContent: t('documentPage.adminCanPerform'),
      };
    }
    return commonMultipleActionsMapping();
  };

  const multipleActionsMapping = useMemo((): MultipleActionsMappingType => {
    if (
      !isPersonalWorkspaceAvailable &&
      (!currentOrganization || !currentTeam || !currentFolderType || (!isSelectedDocument && !isSelectedFolder))
    ) {
      return {} as MultipleActionsMappingType;
    }

    switch (currentFolderType) {
      case folderType.SHARED: {
        return {
          canPerformMove: false,
          canPerformDelete: true,
          canPerformMerge: false,
          canPerformDownload: true,
          tooltipContent: t('documentPage.reskin.actionCannotPerformedOnSharedDocuments'),
        };
      }
      case folderType.STARRED: {
        return {
          canPerformMove: false,
          canPerformDelete: false,
          canPerformMerge: false,
          canPerformDownload: true,
          tooltipContent: t('documentPage.reskin.actionCannotPerformedOnStarredFoldersAndDocuments'),
        };
      }
      case folderType.ORGANIZATION:
      case folderType.TEAMS: {
        return multipleActionsMappingForOrgAndTeam();
      }
      default: {
        return commonMultipleActionsMapping();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderType, currentOrganization, currentTeam, isSelectedDocument, isSelectedFolder]);

  const renderMoveButton = () => {
    if (isBulkActionIconButton) {
      return (
        <IconButton
          icon="move-md"
          onClick={() =>
            handleHeaderAction({
              actionHandler: onMove,
              decoratorHandler: onMoveDocumentsDecorator,
              actionName: ActionName.MOVE,
            })
          }
          variant="elevated"
          data-cy="move_button"
          disabled={!multipleActionsMapping.canPerformMove}
          className="kiwi-button--elevated-without-shadow"
        />
      );
    }
    return (
      <Button
        variant="elevated"
        disabled={!multipleActionsMapping.canPerformMove}
        onClick={() =>
          handleHeaderAction({
            actionHandler: onMove,
            decoratorHandler: onMoveDocumentsDecorator,
            actionName: ActionName.MOVE,
          })
        }
        startIcon={<Icomoon size="md" type="move-md" color="var(--kiwi-colors-core-secondary)" />}
        data-cy="move_button"
        className="kiwi-button--elevated-without-shadow"
      >
        {t('common.move')}
      </Button>
    );
  };

  const renderDeleteButton = () => {
    if (isBulkActionIconButton) {
      return (
        <IconButton
          icon="trash-md"
          onClick={onRemove}
          variant="elevated"
          data-cy="delete_button"
          disabled={isDisabled || !multipleActionsMapping.canPerformDelete}
          className="kiwi-button--elevated-without-shadow"
        />
      );
    }
    return (
      <Button
        variant="elevated"
        disabled={isDisabled || !multipleActionsMapping.canPerformDelete}
        startIcon={<Icomoon size="md" type="trash-md" color="var(--kiwi-colors-core-secondary)" />}
        onClick={onRemove}
        data-cy="delete_button"
        className="kiwi-button--elevated-without-shadow"
      >
        {t(isInSharedTab ? 'common.remove' : 'common.delete')}
      </Button>
    );
  };

  return (
    <div className={classNames(styles.container, { [styles.display]: isDisplay })}>
      <Checkbox
        size="sm"
        className={styles.checkbox}
        borderColor="var(--kiwi-colors-surface-outline)"
        checked={isChecked}
        onChange={onChangeCheckbox}
        indeterminate={isIndeterminateState}
      />
      <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
        {t('common.textSelected', {
          totalSelectDoc: totalSelected,
          totalDoc: currentTotalFolder + totalDoc,
        })}
      </Text>
      <Divider className={styles.divider} orientation="vertical" mx="var(--kiwi-spacing-1)" />
      <div className={styles.buttonWrapper}>
        <MultipleMergeButton
          tooltipContent={multipleActionsMapping.tooltipContent}
          disableTooltipInteractive={
            !multipleActionsMapping.tooltipContent || multipleActionsMapping.canPerformMerge || isOffline
          }
          disabled={isDisabled || !multipleActionsMapping.canPerformMerge}
          onMergeDocuments={() =>
            handleHeaderAction({
              actionHandler: onMerge,
              decoratorHandler: onMergeDocumentsDecorator,
              actionName: ActionName.MERGE,
            })
          }
        />
        <MultipleDownLoadButton disabled={isOffline || isDisabled || !multipleActionsMapping.canPerformDownload} />
        <PlainTooltip
          maw={224}
          content={multipleActionsMapping.tooltipContent}
          disabled={
            !multipleActionsMapping.tooltipContent || multipleActionsMapping.canPerformMove || isOffline
          }
          position="top"
        >
          {renderMoveButton()}
        </PlainTooltip>
        <PlainTooltip
          maw={224}
          content={multipleActionsMapping.tooltipContent}
          disabled={!multipleActionsMapping.tooltipContent || multipleActionsMapping.canPerformDelete || isOffline}
          position="top"
        >
          {renderDeleteButton()}
        </PlainTooltip>
      </div>
      <span
        role="none"
        className={classNames(styles.cancelBtn, 'kiwi-typography-label-md')}
        onClick={onCancelSelectMode}
      >
        {t('common.cancel')}
      </span>
    </div>
  );
};

export default DocumentSelectionBar;
