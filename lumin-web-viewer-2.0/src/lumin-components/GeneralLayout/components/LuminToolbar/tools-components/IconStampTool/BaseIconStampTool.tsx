import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { ToolName } from 'core/type';

import core from 'core';
import selectors from 'selectors';
import { RootState } from 'store';

import { switchTool } from 'lumin-components/GeneralLayout/components/LuminToolbar/utils.js';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';

import { IconStampCreateTool } from 'features/CustomRubberStamp/tool/IconStampCreateTool';

import { TOOLS_NAME } from 'constants/toolsName';

import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

export type IconStampToolProps = {
  isToolAvailable: boolean;
  toggleCheckPopper: () => void;
  activeToolName?: string | ToolName;
  toolName: string | ToolName;
  stampToolName: ToolName;
  icon?: string;
};

const getToolProps = (stampToolName: string) => {
  switch (stampToolName) {
    case TOOLS_NAME.CROSS_STAMP:
      return {
        icon: 'tool_cross_stamp',
        tooltip: 'annotation.crossStamp',
        label: 'annotation.cross',
        'data-lumin-btn-name': 'crossStamp',
      };
    case TOOLS_NAME.DOT_STAMP:
      return {
        icon: 'tool_dot_stamp',
        tooltip: 'annotation.dotStamp',
        label: 'annotation.dot',
        'data-lumin-btn-name': 'dotStamp',
      };
    case TOOLS_NAME.TICK_STAMP:
      return {
        icon: 'tool_check_stamp',
        tooltip: 'annotation.tickStamp',
        label: 'annotation.tick',
        'data-lumin-btn-name': 'tickStamp',
      };
    default:
      return {};
  }
};

export const BaseIconStampTool = ({
  activeToolName,
  isToolAvailable,
  toggleCheckPopper,
  stampToolName,
  toolName,
}: IconStampToolProps) => {
  const isToolActive = activeToolName === stampToolName;

  const { t } = useTranslation();

  const toolbarContext = useToolbarContext();

  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);

  const toolProps = getToolProps(stampToolName as string);

  const onBtnClick = async () => {
    if (isToolAvailable) {
      const { next } = switchTool({ toolName: stampToolName as string });
      if (!next) {
        return;
      }
      const tool = core.getTool(stampToolName) as IconStampCreateTool;
      await tool.setIconStamp();
      await tool.showPreview();
    } else {
      toggleCheckPopper();
    }
  };

  const singleButtonProps = {
    onClick: onBtnClick,
    icon: toolProps.icon,
    iconSize: 24,
    tooltipProps: { position: 'bottom', content: t(toolProps.tooltip) },
    label: t(toolProps.label),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    isActive: isToolActive,
    'data-lumin-btn-name': toolProps['data-lumin-btn-name'],
  };

  return (
    <ToolbarRightSectionItem
      isSingleButton
      toolName={toolName as string}
      renderAsMenuItem={renderAsMenuItem}
      buttonProps={singleButtonProps}
    />
  );
};

BaseIconStampTool.defaultProps = {};

const mapStateToProps = (state: RootState) => ({ activeToolName: selectors.getActiveToolName(state) });

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(BaseIconStampTool);
