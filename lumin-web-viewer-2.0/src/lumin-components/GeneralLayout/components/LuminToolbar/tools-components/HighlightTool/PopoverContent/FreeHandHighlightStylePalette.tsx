/* eslint-disable @typescript-eslint/no-floating-promises */
import { Text } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { leftSideBarActions } from '@new-ui/components/LuminLeftSideBar/slices';
import { switchTool } from '@new-ui/components/LuminToolbar/utils';
import StrokeStylePalette from '@new-ui/components/StrokeStylePalette';
import IconButton from '@new-ui/general-components/IconButton';
import { MenuItem } from '@new-ui/general-components/Menu';
import Popper from '@new-ui/general-components/Popper';
import { ClickAwayTouchEvent } from '@new-ui/general-components/Popper/Popper.enum';
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
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const { isToolAvailable } = useToolChecker('highlightTools');

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorElement(event.currentTarget);
  };

  const onClose = (): void => {
    setAnchorElement(null);
  };

  const open = Boolean(anchorElement);

  const onClick = (): void => {
    if (isNavigationTabPopover) {
      if (!isToolAvailable) {
        toggleCheckPopper({ toolName: HIGHLIGHT_TOOL_VALUES.FREEHAND_HIGHLIGHT.value });
        return;
      }
      if (isInReadAloudMode) {
        dispatch(readAloudActions.setIsInReadAloudMode(false));
      }
      onChangeNavigationTab();
      dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(false));
    }
    switchTool({
      toolName: TOOLS_NAME.FREEHAND_HIGHLIGHT,
      eventElementName: HIGHLIGHT_TOOL_VALUES.FREEHAND_HIGHLIGHT.elementName,
      toolGroup: 'highlightTools',
      isActive: isNavigationTabPopover
        ? activeToolName === (HIGHLIGHT_TOOL_VALUES.FREEHAND_HIGHLIGHT.value as ToolName)
        : false,
    });

    setCurrentTool(TOOLS_NAME.FREEHAND_HIGHLIGHT);
  };

  return (
    <>
      <MenuItem
        onClick={onClick}
        activated={currentTool === HIGHLIGHT_TOOL_VALUES.FREEHAND_HIGHLIGHT.value}
        size="medium"
        icon={HIGHLIGHT_TOOL_VALUES.FREEHAND_HIGHLIGHT.icon}
        desc={!isNavigationTabPopover ? t('viewer.freehandHighlightTooltip') : null}
        renderSuffix={() =>
          !isNavigationTabPopover ? (
            <IconButton icon="md_more_horizontal_menu" iconSize={24} size="medium" onClick={handleClick} />
          ) : null
        }
      >
        {isNavigationTabPopover ? (
          <Text type="label" size="md" color="var(--kiwi-colors-surface-on-surface)">
            {t('annotation.freehandHighlight')}
          </Text>
        ) : (
          t('annotation.freehandHighlight')
        )}
      </MenuItem>

      <Popper
        open={open}
        anchorEl={anchorElement}
        onClose={onClose}
        touchEvent={ClickAwayTouchEvent.ON_TOUCH_START}
        disablePortal
      >
        <StrokeStylePalette />
      </Popper>
    </>
  );
};

export default TextHightlightStylePalette;
