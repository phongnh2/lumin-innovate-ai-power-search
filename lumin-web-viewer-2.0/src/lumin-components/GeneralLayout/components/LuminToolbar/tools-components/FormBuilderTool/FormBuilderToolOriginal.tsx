import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';

import withValidUserCheck from '@new-ui/HOCs/withValidUserCheck';

import selectors from 'selectors';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';
import { TOOL_PROPERTIES_VALUE } from 'luminComponents/GeneralLayout/components/LuminLeftPanel/constants';
import useToolProperties from 'luminComponents/GeneralLayout/hooks/useToolProperties';
import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { useTranslation } from 'hooks';
import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';
import useShallowSelector from 'hooks/useShallowSelector';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import TOOLS_NAME from 'constants/toolsName';

import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

type FormBuilderToolProps = {
  toggleCheckPopper: () => void;
  shouldShowPremiumIcon: boolean;
  isToolAvailable: boolean;
};

const FormBuilderTool = ({ toggleCheckPopper, shouldShowPremiumIcon, isToolAvailable }: FormBuilderToolProps) => {
  const toolPropertiesValue = useShallowSelector(selectors.toolPropertiesValue);
  const isOffline = useSelector(selectors.isOffline);
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const toolItemContext = useContext(ToolbarItemContext);
  const { toggleFormBuildTool } = useToolProperties();
  const { withEditPermission } = useRequestPermissionChecker({
    permissionRequest: RequestType.EDITOR,
  });

  const onBtnClick = () => {
    if (isToolAvailable) {
      withEditPermission(toggleFormBuildTool, toggleCheckPopper)();
      return;
    }

    toggleCheckPopper();
  };

  return (
    <SingleButton
      onClick={ToolSwitchableChecker.createToolSwitchableHandler(onBtnClick)}
      icon="md_fillable_form"
      iconSize={24}
      dataElement="formBuilderButton"
      data-lumin-btn-name={ButtonName.FORM_BUILDER_OPEN}
      tooltipData={{ location: 'bottom', title: t('annotation.formBuilder') }}
      label={t('annotation.formBuilder')}
      hideLabelOnSmallScreen={toolbarContext.collapsedItem > toolItemContext.collapsibleOrder}
      isActive={toolPropertiesValue === TOOL_PROPERTIES_VALUE.FORM_BUILD}
      shouldShowPremiumIcon={shouldShowPremiumIcon}
      disabled={isOffline}
    />
  );
};

FormBuilderTool.propTypes = {
  toggleCheckPopper: PropTypes.func.isRequired,
  shouldShowPremiumIcon: PropTypes.bool.isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
};

export default withValidUserCheck(FormBuilderTool, TOOLS_NAME.FORM_BUILDER, PremiumToolsPopOverEvent.FormBuilder);
