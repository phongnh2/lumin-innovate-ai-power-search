/* eslint-disable sonarjs/no-duplicate-string */
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import selectors from 'selectors';

import { TOOL_PROPERTIES_VALUE } from 'luminComponents/GeneralLayout/components/LuminLeftPanel/constants';
import useToolProperties from 'luminComponents/GeneralLayout/hooks/useToolProperties';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';
import { usePageToolDisabled } from 'hooks/usePageToolDisabled';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

export const InsertTool = ({ withEditPermission }) => {
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const { customLabel, collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);
  const { enterInserBlankPageTool } = useToolProperties();
  const toolPropertiesValue = useShallowSelector(selectors.toolPropertiesValue);
  const { isDisabled, message } = usePageToolDisabled();

  const singleButtonProps = {
    icon: 'md_insert',
    iconSize: 24,
    tooltipProps: {
      position: 'bottom',
      content: message || t('viewer.leftPanelEditMode.insertBlankPage'),
    },
    label: customLabel || t('viewer.leftPanelEditMode.insertBlankPage'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    onClick: ToolSwitchableChecker.createToolSwitchableHandler(withEditPermission(enterInserBlankPageTool)),
    disabled: isDisabled,
    isActive: toolPropertiesValue === TOOL_PROPERTIES_VALUE.INSERT,
  };

  return <ToolbarRightSectionItem isSingleButton renderAsMenuItem={renderAsMenuItem} buttonProps={singleButtonProps} />;
};

InsertTool.propTypes = {
  withEditPermission: PropTypes.func.isRequired,
};

export default InsertTool;
