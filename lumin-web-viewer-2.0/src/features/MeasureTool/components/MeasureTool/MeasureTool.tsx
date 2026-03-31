import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { useToolbarContext } from '@new-ui/components/LuminToolbar/components/ToolbarContext';
import { ToolbarItemContext } from '@new-ui/components/LuminToolbar/components/ToolbarItem';
import { switchTool } from '@new-ui/components/LuminToolbar/utils';
import withValidUserCheck from '@new-ui/HOCs/withValidUserCheck';
import { setToolPropertiesState } from 'actions/generalLayoutActions';
import { ToolName } from 'core/type';

import core from 'core';

import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks/useTranslation';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { measureToolActions, measureToolSelectors } from 'features/MeasureTool/slices';

import defaultTool from 'constants/defaultTool';
import { TOOLS_NAME } from 'constants/toolsName';

interface MeasureToolProps {
  isToolAvailable: boolean;
  toggleCheckPopper: () => void;
}

const MeasureTool = ({ isToolAvailable, toggleCheckPopper }: MeasureToolProps) => {
  const dispatch = useDispatch();
  const isActive = useSelector(measureToolSelectors.isActive);
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const SELECT_MEASURE_TOOL = 'Select measure tools';
  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);

  const handleActivateTool = () => {
    if (isActive) {
      core.setToolMode(defaultTool as ToolName);
      dispatch(measureToolActions.toggleActive());
      dispatch(
        setToolPropertiesState({
          isOpen: false,
          value: TOOL_PROPERTIES_VALUE.DEFAULT,
        })
      );
    } else {
      const { next } = switchTool({
        toolName: TOOLS_NAME.DISTANCE_MEASUREMENT,
      });
      if (!next) {
        return;
      }
      dispatch(measureToolActions.toggleActive());
      dispatch(
        setToolPropertiesState({
          isOpen: true,
          value: TOOL_PROPERTIES_VALUE.MEASURE,
        })
      );
    }
  };

  const singleButtonProps = {
    isActive,
    icon: 'ph-ruler',
    isUsingKiwiIcon: true,
    onClick: () =>
      isToolAvailable ? ToolSwitchableChecker.createToolSwitchableHandler(handleActivateTool)() : toggleCheckPopper(),
    label: t('viewer.measureTool.measure'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    'data-lumin-btn-name': !isActive ? 'measureTools' : null,
    'data-lumin-btn-purpose': !isActive ? SELECT_MEASURE_TOOL : null,
  };

  return <ToolbarRightSectionItem isSingleButton buttonProps={singleButtonProps} renderAsMenuItem={renderAsMenuItem} />;
};

export default withValidUserCheck(MeasureTool, TOOLS_NAME.MEASUREMENT);
