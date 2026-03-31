import classNames from 'classnames';
import { Divider, IconButton, MenuItem, PlainTooltip, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from 'styled-components';

import { ToolbarItemContext } from '@new-ui/components/LuminToolbar/components/ToolbarItem';
import { getShortcut } from '@new-ui/components/LuminToolbar/utils';
import useToolChecker from '@new-ui/hooks/useToolChecker';
import MenuItemShortcut from 'ui/components/MenuItemShortcut';

import PremiumIcon from 'assets/lumin-svgs/badge_premium.svg';

import SystemIcomoon from 'luminComponents/Icomoon';
import { SplitButtonProps } from 'luminComponents/ViewerCommonV2/ToolButton/SplitButton/SplitButton';
import ToolButtonTooltip from 'luminComponents/ViewerCommonV2/ToolButton/ToolButtonTooltip';

import { useRenderConvertFileModal } from 'hooks/useRenderConvertFileModal';

import { quickSearchSelectors } from 'features/QuickSearch/slices';
import { readAloudActions, readAloudSelectors } from 'features/ReadAloud/slices';

import { DataElements } from 'constants/dataElement';

import styles from './ToolbarRightSectionMenu.module.scss';

interface ToolbarRightSectionMenuItemProps extends SplitButtonProps {
  toolName: string;
}

const ToolbarRightSectionMenuItem = React.forwardRef<HTMLDivElement, ToolbarRightSectionMenuItemProps>((props, ref) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { showOptionButton, onChangeNavigationTab } = useContext(ToolbarItemContext);

  const toolsOnClickShouldNotCloseMenu = [
    DataElements.SIGNATURE_TOOL_BUTTON,
    DataElements.RUBBER_STAMP_TOOL_BUTTON,
  ] as string[];

  const {
    icon,
    label,
    onClick,
    isActive,
    toolName,
    shortcutId,
    singleButtonProps,
    secondaryOnClick,
    secondaryButtonProps,
  } = props;

  const { isToolAvailable } = useToolChecker(toolName);
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const isOpenQuickSearch = useSelector(quickSearchSelectors.isOpenQuickSearch);

  const [isHoverSecondaryButton, setIsHoverSecondaryButton] = useState(false);

  const shortcut = useMemo(
    () => (shortcutId ? getShortcut(shortcutId) : singleButtonProps.tooltipProps?.shortcut),
    [shortcutId, singleButtonProps]
  );

  const { shouldOpenModalWithPageToolsHovered } = useRenderConvertFileModal();

  const onMouseEnterSecondaryButton = useCallback(() => setIsHoverSecondaryButton(true), []);
  const onMouseLeaveSecondaryButton = useCallback(() => setIsHoverSecondaryButton(false), []);

  const menuItemClick = () => {
    if (isInReadAloudMode) {
      dispatch(readAloudActions.setIsInReadAloudMode(false));
    }
    if (!singleButtonProps.shouldShowPremiumIcon) {
      onChangeNavigationTab?.();
    }
    if (!shouldOpenModalWithPageToolsHovered) {
      onClick();
    }
  };

  const renderLeftSection = () => {
    if (singleButtonProps.isUsingKiwiIcon) {
      return <KiwiIcomoon type={icon} size="lg" />;
    }
    return <SystemIcomoon className={icon} size={24} />;
  };

  const renderRightSection = () => {
    if (!isOpenQuickSearch || !shortcut) {
      return null;
    }
    return <MenuItemShortcut shortcut={shortcut} />;
  };

  return (
    <div ref={ref} className={styles.menuItem}>
      <ToolButtonTooltip
        /**
         * Since Quick Search tools already display a 'suffix tooltip' on menu items, the default tooltip is disabled to prevent duplication.
         * However, the 'disabled tooltip content' remains enabled to help users understand why an item is disabled.
         */
        disabled={isOpenQuickSearch && !singleButtonProps.disabled}
        content={singleButtonProps.tooltipProps?.content}
        shortcut={shortcut}
        {...{ disableInteractive: isHoverSecondaryButton }}
      >
        <MenuItem
          className={classNames({ [styles.menuItemHovered]: isHoverSecondaryButton })}
          ref={singleButtonProps.ref}
          activated={isActive}
          disabled={singleButtonProps.disabled}
          leftSection={renderLeftSection()}
          rightSection={renderRightSection()}
          onClick={menuItemClick}
          data-element={singleButtonProps.dataElement}
          closeMenuOnClick={
            isToolAvailable &&
            !singleButtonProps.shouldShowPremiumIcon &&
            !toolsOnClickShouldNotCloseMenu.includes(singleButtonProps.dataElement)
          }
        >
          <div className={styles.menuItemContent}>
            <span>{label}</span>
            {singleButtonProps.shouldShowPremiumIcon && <img src={PremiumIcon} alt="premium icon" width={16} />}
          </div>
        </MenuItem>
        {secondaryOnClick && showOptionButton && (
          <div className={styles.menuItemBottom}>
            <Divider orientation="vertical" />
            <PlainTooltip content={secondaryButtonProps?.tooltip.title}>
              <IconButton
                iconSize="md"
                icon="chevron-right-md"
                iconColor={theme.kiwi_colors_surface_on_surface}
                onClick={secondaryOnClick}
                onMouseEnter={onMouseEnterSecondaryButton}
                onMouseLeave={onMouseLeaveSecondaryButton}
              />
            </PlainTooltip>
          </div>
        )}
      </ToolButtonTooltip>
    </div>
  );
});

export default ToolbarRightSectionMenuItem;
