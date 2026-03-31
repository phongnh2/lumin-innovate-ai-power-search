/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import classNames from 'classnames';
import { TextSize, TextType, Checkbox, PlainTooltip, ButtonSize } from 'lumin-ui/kiwi-ui';
import React, { useState, useContext, useMemo } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { useNavigate } from 'react-router-dom';

import { DocumentListRendererContext } from 'luminComponents/DocumentList/Context';
import SvgElement from 'luminComponents/SvgElement';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useGetFolderType, useIsInOrgPage, usePersonalDocPathMatch, useTranslation, useNetworkStatus } from 'hooks';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import useGetFolderUrl from 'hooks/useGetFolderUrl';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { folderType } from 'constants/documentConstants';
import { DocFolderMapping, FolderType } from 'constants/folderConstant';
import { StorageLogo } from 'constants/lumin-common';

import { IFolder } from 'interfaces/folder/folder.interface';

import { FolderName } from './components/FolderName';
import { TextField, DocumentThumbnail } from '../DocumentListItem/components';
import documentListItemstyles from '../DocumentListItem/DocumentListItem.module.scss';
import { FolderItemStar } from '../FolderItemStar';
import { FolderMenuActions } from '../FolderMenuActions';

import folderListItemStyles from './FolderListItem.module.scss';

type FolderListItemProps = {
  folder: IFolder;
  isNewUpload?: boolean;
  isSelected?: boolean;
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  drop?: ConnectDropTarget;
  isOver?: boolean;
  toggleEditFolderModal: () => void;
  toggleFolderInfoModal: () => void;
};

const FolderListItem = ({
  folder,
  isNewUpload = false,
  isSelected = false,
  onCheckboxChange,
  drop,
  isOver,
  toggleEditFolderModal,
  toggleFolderInfoModal,
}: FolderListItemProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOffline } = useNetworkStatus();

  const [openMenu, setOpenMenu] = useState(false);
  const { isVisible } = useChatbotStore();

  const isPersonalDocumentsRoute = usePersonalDocPathMatch();
  const folderUrl = useGetFolderUrl({ folder });
  const { onKeyDown } = useKeyboardAccessibility();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { selectDocMode } = useContext(DocumentListRendererContext);

  const handleOpenFolder = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const elementMore = Boolean(target.closest(`[data-button-more-id="${folder._id}"]`));
    const elementStar = Boolean(target.closest(`[data-button-star-id="${folder._id}"]`));
    if (!elementMore && !elementStar && folderUrl) {
      navigate(folderUrl);
    }
  };

  const currentFolderType = useGetFolderType();
  const currentUser = useGetCurrentUser();
  const isInOrgPage = useIsInOrgPage();

  const { folderDraggingOver } = useContext(withDropDocPopup.DropDocumentPopupContext) as {
    folderDraggingOver: { _id: string; name: string };
  };
  const defaultFolderType = isInOrgPage ? FolderType.ORGANIZATION : FolderType.PERSONAL;
  const documentFolderType =
    currentFolderType === folderType.STARRED ? defaultFolderType : DocFolderMapping[currentFolderType];

  const isStarred = useMemo(
    () => folder.listUserStar.includes(currentUser._id),
    [folder.listUserStar, currentUser._id]
  );

  return (
    <div
      className={classNames(documentListItemstyles.container, {
        [documentListItemstyles.disabledSelection]: isOffline,
      })}
      ref={drop}
    >
      <div
        className={classNames(
          documentListItemstyles.checkboxWrapper,
          selectDocMode && documentListItemstyles.displayCheckbox
        )}
      >
        <Checkbox
          size="sm"
          borderColor="var(--kiwi-colors-surface-outline)"
          onChange={onCheckboxChange}
          checked={isSelected}
        />
      </div>
      <div
        role="button"
        tabIndex={0}
        data-cy="folder_item"
        className={classNames(
          documentListItemstyles.wrapper,
          documentListItemstyles.stateLayer,
          isPersonalDocumentsRoute
            ? documentListItemstyles.wrapperWithoutOwnerName
            : documentListItemstyles.wrapperWithOwnerName,
          {
            [documentListItemstyles.selected]: isSelected,
            [documentListItemstyles.dropping]: folderDraggingOver?._id === folder._id,
            [documentListItemstyles.over]: isOver,
            [documentListItemstyles.showQuickActions]: isOver,
          }
        )}
        data-chatbot-opened={isVisible}
        onClick={handleOpenFolder}
        onKeyDown={onKeyDown}
      >
        <div className={documentListItemstyles.infoContainer}>
          <DocumentThumbnail isFolder altText={folder.name} isNewUpload={isNewUpload} />
          <div className={documentListItemstyles.commonInfo}>
            <div className={documentListItemstyles.documentNameWrapper}>
              <FolderName name={folder.name} />
            </div>
            <div className={documentListItemstyles.starWrapper} data-has-column-owner={!isPersonalDocumentsRoute}>
              <FolderItemStar
                folderType={documentFolderType}
                folder={folder}
                isStarred={isStarred}
                size={ButtonSize.sm}
                disabled={isOffline}
              />
            </div>
          </div>
        </div>
        {isPersonalDocumentsRoute ? null : (
          <div className={classNames(documentListItemstyles.documentNameWrapper, documentListItemstyles.ownerName)}>
            <TextField
              tooltip
              value={folder.ownerName}
              type={TextType.body}
              size={TextSize.md}
              color="var(--kiwi-colors-surface-on-surface-variant)"
              component="span"
            />
          </div>
        )}
        <div className={documentListItemstyles.storage}>
          <SvgElement content={StorageLogo.LUMIN} height={24} maxWidth={24} isReskin />
        </div>
        <div className={classNames(documentListItemstyles.lastAccess, folderListItemStyles.lastAccessEmpty)}>-</div>
        <div className={classNames(documentListItemstyles.actionsContainer, folderListItemStyles.starAction)} />
        <div
          role="presentation"
          className={classNames(documentListItemstyles.more, openMenu && documentListItemstyles.openMenu)}
          data-button-more-id={folder._id}
        >
          <PlainTooltip content={t('documentPage.moreActions')} disabled={openMenu}>
            <FolderMenuActions
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              folder={folder}
              folderType={documentFolderType}
              isStarred={isStarred}
              openEditFolderModal={toggleEditFolderModal}
              openFolderInfoModal={toggleFolderInfoModal}
            />
          </PlainTooltip>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FolderListItem);
