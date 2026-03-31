import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import StylePalette from 'lumin-components/GeneralLayout/components/StylePalette';
import ToolbarPopover from 'luminComponents/GeneralLayout/components/LuminToolbar/components/ToolbarPopover';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';

import DataElements from 'constants/dataElement';
import UserEventConstants from 'constants/eventConstants';
import { mapToolNameToKey } from 'constants/map';
import { TOOLS_NAME } from 'constants/toolsName';

import { useToolbarContext } from '../components/ToolbarContext';
import { ToolbarItemContext } from '../components/ToolbarItem';
import { switchTool } from '../utils';

const DATA_FREE_TOOL_MAPPING = {
  [TOOLS_NAME.FREETEXT]: {
    toolName: TOOLS_NAME.FREETEXT,
    tooltipTitle: 'action.type',
    icon: 'md_text_tool',
    elementName: UserEventConstants.Events.HeaderButtonsEvent.FREE_TEXT,
    dataElement: DataElements.FREETEXT_TOOL_BUTTON,
    label: 'action.type',
    secondaryTooltip: 'toolOption.type',
  },
  [TOOLS_NAME.FREEHAND]: {
    toolName: TOOLS_NAME.FREEHAND,
    tooltipTitle: 'documentPage.tooltipFreehandOptions',
    icon: 'md_freehand',
    elementName: UserEventConstants.Events.HeaderButtonsEvent.FREE_HAND_TOOL,
    dataElement: 'freeHandToolGroupButton',
    label: 'action.draw',
  },
  [TOOLS_NAME.ERASER]: {
    toolName: TOOLS_NAME.ERASER,
    tooltipTitle: 'annotation.eraser',
    icon: 'md_eraser',
    elementName: UserEventConstants.Events.HeaderButtonsEvent.ERASER,
    dataElement: DataElements.ERASER_TOOL_BUTTON,
    label: 'annotation.eraser',
  },
};

// NOTE: For Draw(FreeHand), Eraser and FreeText tool

export const BaseFreeTool = ({
  toolName,
  shortcutId,
  activeToolName,
  activeToolStyle,
  toolStyles,
  iconColor,
  forTool,
  isToolAvailable,
  toggleCheckPopper,
}) => {
  const colorMapKey = mapToolNameToKey(DATA_FREE_TOOL_MAPPING[forTool].toolName);
  const { t } = useTranslation();

  const toolbarContext = useToolbarContext();

  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);

  const isToolActive = activeToolName === DATA_FREE_TOOL_MAPPING[forTool].toolName;

  const color = isToolActive ? toolStyles?.[iconColor]?.toHexString?.() : '';

  const onBtnClick = (isActive) => {
    if (isToolAvailable) {
      const { toolName } = DATA_FREE_TOOL_MAPPING[forTool];
      switchTool({
        toolName,
        isActive,
        eventElementName: DATA_FREE_TOOL_MAPPING[forTool].elementName,
      });
    } else {
      toggleCheckPopper();
    }
  };

  const handleStyleChange = (property, value) => {
    core.getTool(activeToolName).setStyles({
      [property]: value,
    });
  };

  const handleSecondaryOnClick = (showPopper) => (args) => {
    if (isToolAvailable) {
      showPopper(args);
      onBtnClick(false);
    } else {
      toggleCheckPopper();
    }
  };

  const hideLabelByToolRank = () => {
    if (DATA_FREE_TOOL_MAPPING[forTool].toolName === TOOLS_NAME.FREETEXT) {
      return toolbarContext.collapsedItem > collapsibleOrder;
    }
    return false;
  };

  const singleButtonProps = {
    iconSize: 24,
    iconColor: color,
    hideLabelOnSmallScreen: hideLabelByToolRank(),
    dataElement: DATA_FREE_TOOL_MAPPING[forTool].dataElement,
    tooltipProps: {
      position: 'bottom',
      content: t(DATA_FREE_TOOL_MAPPING[forTool].tooltipTitle),
    },
  };

  const splitButtonProps = ({ handleShowPopper, ref, visible }) => ({
    shortcutId,
    onClick: () => onBtnClick(isToolActive),
    label: t(DATA_FREE_TOOL_MAPPING[forTool].label),
    ref,
    isActive: isToolActive,
    icon: DATA_FREE_TOOL_MAPPING[forTool].icon,
    showArrow: true,
    eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.FREE_TEXT,
    secondaryOnClick: handleSecondaryOnClick(() => handleShowPopper()),
    isSecondaryActive: visible,
    singleButtonProps,
    secondaryButtonProps: { tooltip: { title: t(DATA_FREE_TOOL_MAPPING[forTool].secondaryTooltip) } },
  });

  return (
    <ToolbarPopover
      containerMaxWidth={312}
      renderPopperContent={(contentProps) => (
        <StylePalette
          colorMapKey={colorMapKey}
          style={activeToolStyle}
          isFreeText={forTool === TOOLS_NAME.FREETEXT}
          onStyleChange={handleStyleChange}
          hideOpacitySlider={false}
          activeToolName={activeToolName}
          {...contentProps}
        />
      )}
      renderChildren={({ handleShowPopper, ref, visible }) => (
        <ToolbarRightSectionItem
          toolName={toolName}
          isSingleButton={false}
          renderAsMenuItem={renderAsMenuItem}
          buttonProps={splitButtonProps({ handleShowPopper, ref, visible })}
        />
      )}
    />
  );
};

BaseFreeTool.propTypes = {
  shortcutId: PropTypes.string,
  toolName: PropTypes.string.isRequired,
  activeToolName: PropTypes.string.isRequired,
  activeToolStyle: PropTypes.object.isRequired,
  toolStyles: PropTypes.object.isRequired,
  iconColor: PropTypes.string,
  forTool: PropTypes.oneOf([TOOLS_NAME.FREEHAND, TOOLS_NAME.FREETEXT, TOOLS_NAME.ERASER]).isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
};

BaseFreeTool.defaultProps = {
  iconColor: '',
  shortcutId: '',
};

const mapStateToProps = (state) => {
  const activeToolName = selectors.getActiveToolName(state);

  return {
    activeToolName,
    activeToolStyle: selectors.getActiveToolStyles(state),
    toolStyles: selectors.getActiveToolStyles(state),
    iconColor: selectors.getIconColor(state, mapToolNameToKey(activeToolName)),
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BaseFreeTool);
