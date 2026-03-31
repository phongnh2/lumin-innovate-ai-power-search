import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { TOOL_PROPERTIES_VALUE } from 'luminComponents/GeneralLayout/components/LuminLeftPanel/constants';
import useToolProperties from 'luminComponents/GeneralLayout/hooks/useToolProperties';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { usePageToolDisabled } from 'hooks/usePageToolDisabled';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { PageToolViewMode } from 'constants/documentConstants';

import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

const CropTool = ({ withEditPermission }) => {
  const dispatch = useDispatch();
  const toolbarContext = useToolbarContext();
  const { customLabel, collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);
  const toolPropertiesValue = useShallowSelector(selectors.toolPropertiesValue);
  const { t } = useTranslation();
  const { enterCropPageTool } = useToolProperties();
  const { isDisabled, message } = usePageToolDisabled();

  const onClickCropTool = () => {
    dispatch(actions.changePageEditDisplayMode(PageToolViewMode.LIST));
    enterCropPageTool();
  };

  const singleButtonProps = {
    icon: 'md_crop',
    iconSize: 24,
    tooltipProps: {
      position: 'bottom',
      content: message || t('viewer.leftPanelEditMode.cropPage'),
    },
    label: customLabel || t('viewer.leftPanelEditMode.crop'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    onClick: ToolSwitchableChecker.createToolSwitchableHandler(withEditPermission(onClickCropTool)),
    isActive: toolPropertiesValue === TOOL_PROPERTIES_VALUE.CROP,
    disabled: isDisabled,
  };

  return <ToolbarRightSectionItem isSingleButton renderAsMenuItem={renderAsMenuItem} buttonProps={singleButtonProps} />;
};

CropTool.propTypes = {
  withEditPermission: PropTypes.func.isRequired,
};

export default CropTool;
