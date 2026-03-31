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

export const RotateTool = ({ withEditPermission }) => {
  const toolPropertiesValue = useShallowSelector(selectors.toolPropertiesValue);
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const { customLabel, collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);
  const { enterRotatePageTool } = useToolProperties();
  const { isDisabled, message } = usePageToolDisabled();

  const singleButtonProps = {
    icon: 'md_rotate',
    iconSize: 24,
    tooltipProps: {
      position: 'bottom',
      content: message || t('viewer.leftPanelEditMode.rotatePages'),
    },
    label: customLabel || t('action.rotate'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    onClick: ToolSwitchableChecker.createToolSwitchableHandler(withEditPermission(enterRotatePageTool)),
    isActive: toolPropertiesValue === TOOL_PROPERTIES_VALUE.ROTATE,
    disabled: isDisabled,
  };

  return <ToolbarRightSectionItem isSingleButton renderAsMenuItem={renderAsMenuItem} buttonProps={singleButtonProps} />;
};

RotateTool.propTypes = {
  withEditPermission: PropTypes.func.isRequired,
};

export default RotateTool;
