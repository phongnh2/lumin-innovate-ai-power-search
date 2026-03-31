/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import classNames from 'classnames';
import { Checkbox, TextType, TextSize, PlainTooltip, ButtonSize } from 'lumin-ui/kiwi-ui';
import React, { useState, useContext, useMemo } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { useNavigate } from 'react-router-dom';

import Folder from 'assets/reskin/lumin-svgs/folder-xl.svg';

import { DocumentListRendererContext } from 'luminComponents/DocumentList/Context';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useGetFolderType, useIsInOrgPage, useTranslation, useNetworkStatus } from 'hooks';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import useGetFolderUrl from 'hooks/useGetFolderUrl';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { folderType } from 'constants/documentConstants';
import { DocFolderMapping, FolderType } from 'constants/folderConstant';

import { IFolder } from 'interfaces/folder/folder.interface';

import documentGridItemStyles from '../DocumentGridItem/DocumentGridItem.module.scss';
import { TextField } from '../DocumentListItem/components';
import { FolderItemStar } from '../FolderItemStar';
import { FolderMenuActions } from '../FolderMenuActions';

import folderGridItemStyles from './FolderGridItem.module.scss';

type FolderGridItemProps = {
  folder: IFolder;
  isNewUpload?: boolean;
  isSelected?: boolean;
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  drop?: ConnectDropTarget;
  isOver?: boolean;
  toggleEditFolderModal: () => void;
  toggleFolderInfoModal: () => void;
};

const FolderGridItem = ({
  folder,
  isNewUpload,
  isSelected,
  onCheckboxChange,
  drop,
  isOver,
  toggleEditFolderModal,
  toggleFolderInfoModal,
}: FolderGridItemProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOffline } = useNetworkStatus();

  const [openMenu, setOpenMenu] = useState(false);

  const { selectDocMode } = useContext(DocumentListRendererContext);
  const { folderDraggingOver } = useContext(withDropDocPopup.DropDocumentPopupContext) as {
    folderDraggingOver: { _id: string; name: string };
  };
  const { onKeyDown } = useKeyboardAccessibility();

  const folderUrl = useGetFolderUrl({ folder });

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const elementMore = target.closest(`[data-button-more-id="${folder._id}"]`);
    const elementStar = target.closest(`[data-button-star-id="${folder._id}"]`);
    if (folderUrl && !elementMore && !elementStar) {
      navigate(folderUrl);
    }
  };

  const currentFolderType = useGetFolderType();
  const currentUser = useGetCurrentUser();
  const isInOrgPage = useIsInOrgPage();

  const defaultFolderType = isInOrgPage ? FolderType.ORGANIZATION : FolderType.PERSONAL;
  const documentFolderType =
    currentFolderType === folderType.STARRED ? defaultFolderType : DocFolderMapping[currentFolderType];

  const isStarred = useMemo(
    () => folder.listUserStar.includes(currentUser._id),
    [folder.listUserStar, currentUser._id]
  );

  return (
    <div
      className={classNames(documentGridItemStyles.container, {
        [documentGridItemStyles.containerSelected]: isSelected,
        [documentGridItemStyles.showQuickActions]: isOver,
        [documentGridItemStyles.over]: isOver,
        [documentGridItemStyles.disabledSelection]: isOffline,
      })}
      ref={drop}
    >
      <div
        className={classNames(documentGridItemStyles.checkboxWrapper, {
          [documentGridItemStyles.displayCheckboxWrapper]: selectDocMode,
        })}
      >
        <Checkbox
          size="md"
          borderColor="var(--kiwi-colors-surface-outline)"
          onChange={onCheckboxChange}
          checked={isSelected}
        />
      </div>
      <div onClick={onClick} onKeyDown={onKeyDown} role="button" tabIndex={0} data-cy="folder_item">
        <div className={documentGridItemStyles.thumbnailContainer}>
          <div
            className={classNames(documentGridItemStyles.overlay, {
              [documentGridItemStyles.displayOverlay]: selectDocMode || folderDraggingOver?._id === folder._id,
            })}
          />
          {isNewUpload && <div className={documentGridItemStyles.documentStatus} />}
          <div className={folderGridItemStyles.thumbnailWrapper}>
            <img className={folderGridItemStyles.folderThumbnail} src={Folder} alt={folder.name} />
          </div>
        </div>
        <div className={documentGridItemStyles.docInfoWrapper}>
          <div className={documentGridItemStyles.docInfo}>
            <TextField
              value={folder.name}
              type={TextType.body}
              size={TextSize.md}
              tooltip
              color="var(--kiwi-colors-surface-on-surface)"
            />
          </div>
          <div className={documentGridItemStyles.toolsWrapper}>
            <FolderItemStar
              folderType={documentFolderType}
              folder={folder}
              isStarred={isStarred}
              size={ButtonSize.md}
              disabled={isOffline}
            />
            <div
              role="presentation"
              data-button-more-id={folder._id}
              className={classNames(documentGridItemStyles.buttonMoreWrapper, {
                [documentGridItemStyles.displayBlock]: openMenu || isSelected,
              })}
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
      </div>
    </div>
  );
};

export default FolderGridItem;
