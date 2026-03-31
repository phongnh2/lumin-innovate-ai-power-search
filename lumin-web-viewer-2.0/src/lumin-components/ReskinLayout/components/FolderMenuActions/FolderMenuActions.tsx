/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { capitalize, snakeCase } from 'lodash';
import { Divider, IconButton, Menu, MenuItem } from 'lumin-ui/kiwi-ui';
import React, { forwardRef, Ref, useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';

import { DocumentContext } from 'luminComponents/Document/context';
import StopPropagation from 'luminComponents/StopPropagation';

import { useDesktopMatch, useGetFolderPermissions, useGetFolderType, useTranslation } from 'hooks';
import useDeleteFolder from 'hooks/useDeleteFolder';
import useClickMenu from 'hooks/useSelectItems/useClickMenu';

import { FolderServices } from 'services';

import { ObjectType, QuickAction } from 'utils/Factory/EventCollection/constants/DocumentActionsEvent';
import docActionsEvent from 'utils/Factory/EventCollection/DocActionsEventCollection';

import { folderType as tabType } from 'constants/documentConstants';
import { FolderType } from 'constants/folderConstant';
import { CHECKBOX_TYPE } from 'constants/lumin-common';

import { IFolder } from 'interfaces/folder/folder.interface';

export interface FolderMenuActionsProps {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  folder: IFolder;
  folderType: typeof FolderType[keyof typeof FolderType];
  isStarred: boolean;
  openEditFolderModal: () => void;
  openFolderInfoModal: () => void;
}

const FolderMenuActions = forwardRef((props: FolderMenuActionsProps, ref: Ref<HTMLButtonElement>) => {
  const { openMenu, setOpenMenu, folder, folderType, isStarred, openEditFolderModal, openFolderInfoModal } = props;
  const isDesktopMatch = useDesktopMatch();
  const folderServices = new FolderServices(folderType);

  const { handleSelectedItems, shiftHoldingRef, lastSelectedDocIdRef, setRemoveFolderList } =
    useContext(DocumentContext);
  const { onClickMenu } = useClickMenu({ item: folder, handleSelectedItems, shiftHoldingRef, lastSelectedDocIdRef });
  const { openDeleteModal } = useDeleteFolder(folderType, folder, setRemoveFolderList);
  const { bodyScrollRef } = useContext(AppLayoutContext);
  const currentFolderType = useGetFolderType();
  const { editable, deletable } = useGetFolderPermissions();

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleOpenMenu = () => {
    setOpenMenu(true);
    onClickMenu();
  };

  const withClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, callback?: () => void) => {
    e.stopPropagation();
    callback?.();
    setOpenMenu(false);
  };

  const handleClickStar = useCallback(async () => {
    const newFolder = await folderServices.starFolder(folder._id);
    dispatch(actions.updateFolderInList({ newFolder, isStarTab: currentFolderType === tabType.STARRED }));
    if (isStarred) {
      handleSelectedItems({
        currentItem: folder,
        lastSelectedDocId: lastSelectedDocIdRef.current,
        checkboxType: CHECKBOX_TYPE.DESELECT,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderType, folder, folderServices]);

  const handleClickMoreActions = () => {
    docActionsEvent
      .quickActions({
        object: ObjectType.FOLDER,
        action: QuickAction.MORE_ACTIONS,
      })
      .catch(() => {});
  };

  return (
    <StopPropagation>
      <Menu
        width={180}
        ComponentTarget={
          <IconButton
            ref={ref}
            aria-hidden="true"
            data-cy="more_actions_button"
            icon="dots-vertical-md"
            size="md"
            activated={openMenu}
            onClick={handleClickMoreActions}
            {...(!isDesktopMatch && { iconColor: 'var(--kiwi-colors-surface-on-surface-variant)' })}
          />
        }
        onClose={() => setOpenMenu(false)}
        onOpen={handleOpenMenu}
        position="bottom-end"
        closeOnScroll={{ elementRef: bodyScrollRef }}
      >
        <MenuItem leftIconProps={{ type: 'folder-md' }} onClick={(e) => withClose(e, () => openFolderInfoModal())}>
          {capitalize(t('common.folderInfo'))}
        </MenuItem>
        <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
        {editable && (
          <MenuItem leftIconProps={{ type: 'pencil-md' }} onClick={(e) => withClose(e, () => openEditFolderModal())}>
            {t('common.rename')}
          </MenuItem>
        )}
        <MenuItem
          data-cy={`${snakeCase(isStarred ? t('common.unstar') : t('common.star'))}_button`}
          leftIconProps={{
            ...(isStarred && { color: 'var(--kiwi-colors-custom-brand-tools-esign)' }),
            type: isStarred ? 'star-fill-md' : 'star-md',
          }}
          onClick={(e) => withClose(e, () => handleClickStar())}
        >
          {isStarred ? t('common.unstar') : t('common.star')}
        </MenuItem>
        {deletable && (
          <>
            <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
            <MenuItem leftIconProps={{ type: 'trash-lg' }} onClick={(e) => withClose(e, () => openDeleteModal())}>
              {t('common.delete')}
            </MenuItem>
          </>
        )}
      </Menu>
    </StopPropagation>
  );
});

export default React.memo(FolderMenuActions);
