import { IconButton, Menu, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from 'styled-components';

import ToolbarItem from '@new-ui/components/LuminToolbar/components/ToolbarItem';
import { ToolType } from '@new-ui/components/LuminToolbar/components/ToolbarList';
import { toolbarActions, toolbarSelectors } from '@new-ui/components/LuminToolbar/slices';

import actions from 'actions';
import selectors from 'selectors';
import { RootState } from 'store';

import { DataElements } from 'constants/dataElement';

import { useGetRightSectionTools } from '../hooks/useGetRightSectionTools';

import styles from './ToolbarRightSectionMenu.module.scss';

const ToolbarRightSectionMenu = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isToolbarPopoverOpen = useSelector((state: RootState) =>
    selectors.isElementOpen(state, DataElements.TOOLBAR_POPOVER as string)
  );
  const shouldOpenSignatureListPopover = useSelector(toolbarSelectors.shouldOpenSignatureListPopover);

  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const { menuTools } = useGetRightSectionTools();

  const toolbarItems = (): React.ReactElement[] =>
    menuTools.map((tool: ToolType) => (
      <ToolbarItem key={tool.key} renderAsMenuItem showOptionButton>
        {tool.element}
      </ToolbarItem>
    ));

  const onEnterTransitionEnd = () => {
    const signatureToolButton: HTMLButtonElement = document.querySelector(
      `[data-element=${DataElements.SIGNATURE_TOOL_BUTTON}]`
    );
    if (signatureToolButton && shouldOpenSignatureListPopover) {
      signatureToolButton.click();
    }
  };

  const onCloseMenu = () => {
    dispatch(toolbarActions.resetToolbarPopover());
    dispatch(actions.closeElement(DataElements.TOOLBAR_POPOVER));
  };

  useEffect(() => {
    setIsOpenMenu(isToolbarPopoverOpen);
  }, [isToolbarPopoverOpen]);

  return (
    <Menu
      opened={isOpenMenu}
      position="bottom-end"
      offset={{ mainAxis: 4, crossAxis: 12 }}
      width={280}
      closeOnItemClick={false}
      onEnterTransitionEnd={onEnterTransitionEnd}
      onClose={onCloseMenu}
      ComponentTarget={
        <PlainTooltip content={t('generalLayout.toolbar.moreTools')} position="bottom">
          <IconButton
            iconSize="md"
            icon="dots-md"
            iconColor={theme.kiwi_colors_surface_on_surface}
            onClick={() => dispatch(actions.toggleElement(DataElements.TOOLBAR_POPOVER))}
          />
        </PlainTooltip>
      }
      // TODO: Remove this after upgrade Mantine for using SubMenu
      styles={{ dropdown: { willChange: 'unset !important' } }}
    >
      <div className={styles.menu}>{toolbarItems()}</div>
    </Menu>
  );
};

export default ToolbarRightSectionMenu;
