import PropTypes from 'prop-types';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connect, useSelector } from 'react-redux';

import { leftSideBarSelectors } from '@new-ui/components/LuminLeftSideBar/slices';

import selectors from 'selectors';

import ToolbarPopover from 'luminComponents/GeneralLayout/components/LuminToolbar/components/ToolbarPopover';
import withValidUserCheck from 'luminComponents/GeneralLayout/HOCs/withValidUserCheck';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';

import getToolStyles from 'helpers/getToolStyles';

import { readAloudSelectors } from 'features/ReadAloud/slices';

import UserEventConstants from 'constants/eventConstants';
import { getDataWithKey, mapToolNameToKey } from 'constants/map';
import { TOOLS_NAME } from 'constants/toolsName';

import { HIGHLIGHT_TOOL_NAMES, HIGHLIGHT_TOOL_VALUES } from './constants';
import PopoverContent from './PopoverContent';
import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';
import { switchTool, StaticShortcutID } from '../../utils';

const getColor = (toolName, isActive) => {
  const { iconColor } = getDataWithKey(mapToolNameToKey(toolName));

  let color = '';
  if (isActive) {
    const toolStyles = getToolStyles(toolName);
    color = toolStyles?.[iconColor]?.toHexString?.();
  }

  return color;
};

export const HighlightTool = ({ activeToolName, isToolAvailable, toggleCheckPopper, type }) => {
  const { t } = useTranslation();

  const toolbarContext = useToolbarContext();

  const { collapsibleOrder, renderAsMenuItem, onChangeNavigationTab } = useContext(ToolbarItemContext);

  const [currentTool, setCurrentTool] = useState(type || HIGHLIGHT_TOOL_VALUES.TEXT_HIGHLIGHT.value);

  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const isLeftSidebarPopoverOpened = useSelector(leftSideBarSelectors.isLeftSidebarPopoverOpened);
  const navigationTabPopoverRef = useRef(isLeftSidebarPopoverOpened && renderAsMenuItem);

  const icon = useMemo(
    () => Object.values(HIGHLIGHT_TOOL_VALUES).find(({ value }) => value === currentTool).icon,
    [currentTool]
  );

  const elementName = useMemo(
    () => Object.values(HIGHLIGHT_TOOL_VALUES).find(({ value }) => value === currentTool).elementName,
    [currentTool]
  );

  const isToolActive = useMemo(() => {
    if (type) {
      return activeToolName === type;
    }
    return activeToolName === currentTool;
  }, [activeToolName, currentTool, type]);

  const onBtnClick = (toolName) => {
    if (isToolAvailable) {
      switchTool({ toolName, isActive: isToolActive, eventElementName: elementName, toolGroup: 'highlightTools' });
    } else {
      toggleCheckPopper();
    }
  };

  const renderActiveShapeTooltip = () => {
    if (currentTool === TOOLS_NAME.FREEHAND_HIGHLIGHT) {
      return {
        title: t('annotation.freehandHighlight'),
        shortcut: null,
      };
    }
    return {
      title: t('annotation.highlight'),
      shortcut: StaticShortcutID.HighLight,
    };
  };

  const renderLabel = () => {
    if (currentTool === TOOLS_NAME.HIGHLIGHT) {
      return t('annotation.highlight');
    }
    return t('annotation.freehandHighlight');
  };

  useEffect(() => {
    if (HIGHLIGHT_TOOL_NAMES.includes(activeToolName) && activeToolName !== currentTool && !type) {
      setCurrentTool(activeToolName);
    }
  }, [activeToolName, currentTool, type]);

  const splitButtonProps = ({ handleShowPopper, ref, visible }) => ({
    shortcutId: renderActiveShapeTooltip().shortcut,
    onClick: () => onBtnClick(currentTool),
    ref,
    label: renderLabel(),
    isActive: isToolActive,
    icon,
    showArrow: true,
    eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.HIGHLIGHT,
    secondaryOnClick: () => {
      if (isToolAvailable) {
        handleShowPopper();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        !isToolActive && onBtnClick(currentTool);
      } else {
        toggleCheckPopper();
      }
    },
    isSecondaryActive: visible,
    singleButtonProps: {
      iconColor: getColor(currentTool, isToolActive),
      hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
      dataElement: 'highlightToolButton',
      tooltipProps: {
        placement: 'bottom',
        content: renderLabel(),
      },
      iconSize: 24,
    },
    activeShapeTooltip: renderActiveShapeTooltip().title,
    secondaryButtonProps: { tooltip: { title: t('toolOption.highlight') } },
  });

  return (
    <ToolbarPopover
      paperProps={{ style: { overflow: 'unset' } }}
      renderPopperContent={(contentProps) => (
        <PopoverContent currentTool={currentTool} setCurrentTool={setCurrentTool} {...contentProps} />
      )}
      renderChildren={({ handleShowPopper, ref, visible }) =>
        navigationTabPopoverRef.current ? (
          <PopoverContent
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            activeToolName={activeToolName}
            isInReadAloudMode={isInReadAloudMode}
            onChangeNavigationTab={onChangeNavigationTab}
            isNavigationTabPopover={navigationTabPopoverRef.current}
            toggleCheckPopper={toggleCheckPopper}
          />
        ) : (
          <ToolbarRightSectionItem
            toolName={currentTool}
            isSingleButton={false}
            renderAsMenuItem={renderAsMenuItem}
            buttonProps={splitButtonProps({ handleShowPopper, ref, visible })}
          />
        )
      }
    />
  );
};

HighlightTool.propTypes = {
  activeToolName: PropTypes.string.isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
  type: PropTypes.string,
};

const mapStateToProps = (state) => ({
  activeToolName: selectors.getActiveToolName(state),
});

const mapDispatchToProps = () => ({});

export default withValidUserCheck(connect(mapStateToProps, mapDispatchToProps)(HighlightTool), 'highlightTools');
