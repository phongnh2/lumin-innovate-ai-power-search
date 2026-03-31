/* eslint-disable @typescript-eslint/no-floating-promises */
import { Text } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { leftSideBarActions } from '@new-ui/components/LuminLeftSideBar/slices';
import { switchTool } from '@new-ui/components/LuminToolbar/utils';
import TextToolStylePalette from '@new-ui/components/TextToolStylePalette';
import IconButton from '@new-ui/general-components/IconButton';
import { MenuItem } from '@new-ui/general-components/Menu';
import Popper from '@new-ui/general-components/Popper';
import useToolChecker from '@new-ui/hooks/useToolChecker';
import { ToolName } from 'core/type';

import { useTranslation } from 'hooks';

import { readAloudActions } from 'features/ReadAloud/slices';

import { TOOLS_NAME } from 'constants/toolsName';

import { IPopoverContentProps } from './PopoverContent.interface';
import { HIGHLIGHT_TOOL_VALUES } from '../constants';

const TextHightlightStylePalette = (props: IPopoverContentProps): JSX.Element => {
  const {
    currentTool,
    setCurrentTool,
    activeToolName,
    isInReadAloudMode,
    isNavigationTabPopover,
    onChangeNavigationTab,
    toggleCheckPopper,
  } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { isToolAvailable } = useToolChecker('highlightTools');
  const selectedTool = isNavigationTabPopover ? activeToolName : currentTool;

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const onClick = (): void => {
    if (isNavigationTabPopover) {
      if (!isToolAvailable) {
        toggleCheckPopper({ toolName: HIGHLIGHT_TOOL_VALUES.TEXT_HIGHLIGHT.value });
        return;
      }
      if (isInReadAloudMode) {
        dispatch(readAloudActions.setIsInReadAloudMode(false));
      }
      onChangeNavigationTab();
      dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(false));
    }
    switchTool({
      toolName: TOOLS_NAME.HIGHLIGHT,
      eventElementName: HIGHLIGHT_TOOL_VALUES.TEXT_HIGHLIGHT.elementName,
      toolGroup: 'highlightTools',
      isActive: isNavigationTabPopover
        ? activeToolName === (HIGHLIGHT_TOOL_VALUES.TEXT_HIGHLIGHT.value as ToolName)
        : false,
    });
    setCurrentTool(TOOLS_NAME.HIGHLIGHT);
  };

  return (
    <>
      <MenuItem
        onClick={onClick}
        activated={selectedTool === HIGHLIGHT_TOOL_VALUES.TEXT_HIGHLIGHT.value}
        size="medium"
        icon={HIGHLIGHT_TOOL_VALUES.TEXT_HIGHLIGHT.icon}
        renderSuffix={() =>
          !isNavigationTabPopover ? (
            <IconButton
              active={open}
              icon="md_more_horizontal_menu"
              iconSize={24}
              size="medium"
              onClick={handleClick}
            />
          ) : null
        }
        disableRipple={open}
      >
        {isNavigationTabPopover ? (
          <Text type="label" size="md" color="var(--kiwi-colors-surface-on-surface)">
            {t('annotation.highlight')}
          </Text>
        ) : (
          `${t('annotation.highlight')} (H)`
        )}
      </MenuItem>

      <Popper open={open} anchorEl={anchorEl} onClose={handleClose} disablePortal>
        <TextToolStylePalette />
      </Popper>
    </>
  );
};

export default TextHightlightStylePalette;
