import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import selectors from 'selectors';

import { TOOL_PROPERTIES_VALUE } from 'luminComponents/GeneralLayout/components/LuminLeftPanel/constants';
import useToolProperties from 'luminComponents/GeneralLayout/hooks/useToolProperties';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { usePageToolDisabled } from 'hooks/usePageToolDisabled';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

const MovePageTool = ({ withEditPermission }) => {
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const { customLabel, collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);
  const { enterMovePageTool } = useToolProperties();
  const toolPropertiesValue = useShallowSelector(selectors.toolPropertiesValue);
  const { isDisabled, message } = usePageToolDisabled();

  const singleButtonProps = {
    icon: 'md_move',
    iconSize: 24,
    tooltipProps: {
      position: 'bottom',
      content: message || t('viewer.leftPanelEditMode.movePage'),
    },
    label: customLabel || t('common.move'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    onClick: ToolSwitchableChecker.createToolSwitchableHandler(withEditPermission(enterMovePageTool)),
    isActive: toolPropertiesValue === TOOL_PROPERTIES_VALUE.MOVE,
    disabled: isDisabled,
  };

  return <ToolbarRightSectionItem isSingleButton renderAsMenuItem={renderAsMenuItem} buttonProps={singleButtonProps} />;
};

MovePageTool.propTypes = {
  withEditPermission: PropTypes.func.isRequired,
};

export default MovePageTool;
