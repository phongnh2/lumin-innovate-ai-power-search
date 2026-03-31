import { find } from 'lodash';
import { IconButton, Divider, MenuItem, MenuItemProps, MenuProps } from 'lumin-ui/kiwi-ui';
import React, { ReactNode, useMemo, useState } from 'react';

import { ScrollableMenu } from 'luminComponents/ReskinLayout/components/ScrollableMenu';

import { useDesktopMatch, useGetCurrentOrganization, useGetCurrentUser, useTranslation } from 'hooks';

import { ObjectType, QuickAction } from 'utils/Factory/EventCollection/constants/DocumentActionsEvent';
import docActionsEvent from 'utils/Factory/EventCollection/DocActionsEventCollection';
import { FolderPermissions } from 'utils/Factory/FolderPermissions';

import { FolderActionsType } from 'features/DocumentList/types';

import {
  FolderAction,
  FolderLocationType,
  FolderLocationTypeMapping,
  FolderPermission,
} from 'constants/folderConstant';

import { IFolder } from 'interfaces/folder/folder.interface';

import styles from './FolderMoreActionsButton.module.scss';

type MenuOptionsMappingValueType = {
  title: string;
  icon: MenuItemProps['leftIconProps'];
  clickAction: (...args: unknown[]) => void;
  hasPermission: boolean;
  dividerElementPosition?: 'above' | 'below';
};

type MenuOptionsMappingType = {
  [key: typeof FolderAction[keyof typeof FolderAction]]: MenuOptionsMappingValueType;
};

type FolderMoreActionsButtonProps = {
  folder: IFolder;
  containerScrollRef: React.MutableRefObject<HTMLElement>;
  onToggle?: (value: boolean) => void;
  actions: FolderActionsType;
  children?: ReactNode;
  menuProps?: MenuProps;
};

const FolderMoreActionsButton = (props: FolderMoreActionsButtonProps) => {
  const { folder, actions, containerScrollRef, onToggle, menuProps, children } = props;

  const [openedMenu, setOpenedMenu] = useState(false);

  const { t } = useTranslation();
  const isDesktopMatch = useDesktopMatch();
  const currentUser = useGetCurrentUser();
  const currentOrganization = useGetCurrentOrganization();
  const foundTeam = useMemo(() => {
    if (!currentOrganization || folder.belongsTo.type !== FolderLocationType.ORGANIZATION_TEAM) {
      return undefined;
    }

    const { teams } = currentOrganization;
    return find(teams, { _id: folder.belongsTo.location._id });
  }, [currentOrganization, folder.belongsTo]);

  const folderType = useMemo(() => FolderLocationTypeMapping[folder.belongsTo.type], [folder.belongsTo.type]);

  const folderPermissions = useMemo(
    () =>
      new FolderPermissions({
        type: folderType,
        team: foundTeam,
        folder,
      }),
    [folder, folderType, foundTeam]
  );

  const editable = useMemo(() => folderPermissions.hasPermission(FolderPermission.EDIT), [folderPermissions]);
  const deletable = useMemo(() => folderPermissions.hasPermission(FolderPermission.DELETE), [folderPermissions]);

  // [START] star action
  const isStarred = useMemo(
    () => folder.listUserStar.includes(currentUser._id),
    [folder.listUserStar, currentUser._id]
  );
  // [END] star action

  const menuOptionsMapping: MenuOptionsMappingType = {
    [FolderAction.INFO]: {
      title: t('common.folderInfo'),
      icon: { type: 'folder-md' },
      clickAction: actions.viewInfo,
      hasPermission: true,
      dividerElementPosition: 'below',
    },
    [FolderAction.EDIT]: {
      title: t('common.rename'),
      icon: { type: 'pencil-md' },
      clickAction: actions.rename,
      hasPermission: editable,
    },
    [FolderAction.STAR]: {
      title: isStarred ? t('common.unstar') : t('common.star'),
      icon: {
        type: isStarred ? 'star-fill-md' : 'star-md',
        ...(isStarred && { color: 'var(--kiwi-colors-custom-brand-tools-esign)' }),
      },
      clickAction: actions.markFavorite,
      hasPermission: true,
    },
    [FolderAction.REMOVE]: {
      title: t('common.delete'),
      icon: { type: 'trash-md' },
      clickAction: actions.remove,
      hasPermission: deletable,
      dividerElementPosition: deletable ? 'above' : undefined,
    },
  };

  const withClosePopper = (callback: (...args: unknown[]) => void) => {
    if (typeof callback !== 'function') {
      return;
    }
    callback();
    setOpenedMenu(false);
    onToggle?.(false);
  };

  const onClickItem = (item: MenuOptionsMappingValueType) => {
    withClosePopper((...rest) => {
      item.clickAction(...rest);
    });
  };

  const renderMenuItem = (action: typeof FolderAction[keyof typeof FolderAction]) => {
    const item = menuOptionsMapping[action];
    const { title, icon } = item;
    const onClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      onClickItem(item);
    };

    return (
      <>
        {item.dividerElementPosition === 'above' && (
          <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
        )}
        {item && item.hasPermission && (
          <MenuItem leftIconProps={icon} onClick={onClick}>
            {title}
          </MenuItem>
        )}
        {item.dividerElementPosition === 'below' && (
          <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
        )}
      </>
    );
  };

  const onClickMoreActionsButton = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    docActionsEvent
      .quickActions({
        object: ObjectType.FOLDER,
        action: QuickAction.MORE_ACTIONS,
      })
      .catch(() => {});
  };

  const renderComponentTarget = (): ReactNode => {
    if (children) {
      return children;
    }
    return (
      <IconButton
        data-cy="more_actions_button"
        icon="dots-vertical-md"
        size="md"
        activated={openedMenu}
        {...(!isDesktopMatch && { iconColor: 'var(--kiwi-colors-surface-on-surface-variant)' })}
        onClick={onClickMoreActionsButton}
      />
    );
  };

  return (
    <ScrollableMenu
      ComponentTarget={renderComponentTarget()}
      opened={openedMenu}
      onChange={(value) => {
        setOpenedMenu(value);
        onToggle?.(value);
      }}
      position="bottom-end"
      closeOnScroll={{ elementRef: containerScrollRef }}
      classNames={{
        dropdown: styles.dropdown,
      }}
      {...menuProps}
    >
      {renderMenuItem(FolderAction.INFO)}
      {renderMenuItem(FolderAction.EDIT)}
      {renderMenuItem(FolderAction.STAR)}
      {renderMenuItem(FolderAction.REMOVE)}
    </ScrollableMenu>
  );
};

export default FolderMoreActionsButton;
