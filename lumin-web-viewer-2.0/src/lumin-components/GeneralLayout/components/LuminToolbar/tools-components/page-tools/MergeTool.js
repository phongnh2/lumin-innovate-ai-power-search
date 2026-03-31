import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import selectors from 'selectors';

import useToolProperties from 'lumin-components/GeneralLayout/hooks/useToolProperties';
import { TOOL_PROPERTIES_VALUE } from 'luminComponents/GeneralLayout/components/LuminLeftPanel/constants';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { usePageToolDisabled } from 'hooks/usePageToolDisabled';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { ExploredFeatures } from 'features/EnableToolFromQueryParams/constants';

import withMergeToolCheck from './HOCs/withMergeToolCheck';
import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

const MergeTool = ({ disabledMessage = '', withEditPermission }) => {
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const { customLabel, collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);
  const { enterMergeTool } = useToolProperties();
  const toolPropertiesValue = useShallowSelector(selectors.toolPropertiesValue);
  const { isDisabled, message } = usePageToolDisabled();

  const singleButtonProps = {
    icon: 'md_merge',
    iconSize: 24,
    tooltipProps: {
      position: 'bottom',
      content: disabledMessage || message || t('viewer.leftPanelEditMode.mergeDocuments'),
    },
    label: customLabel || t('viewer.leftPanelEditMode.merge'),
    disabled: !!disabledMessage || isDisabled,
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    onClick: ToolSwitchableChecker.createToolSwitchableHandler(
      withEditPermission(enterMergeTool, null, ExploredFeatures.MERGE)
    ),
    isActive: toolPropertiesValue === TOOL_PROPERTIES_VALUE.MERGE,
  };

  return <ToolbarRightSectionItem isSingleButton renderAsMenuItem={renderAsMenuItem} buttonProps={singleButtonProps} />;
};

MergeTool.propTypes = {
  disabledMessage: PropTypes.string,
  withEditPermission: PropTypes.func.isRequired,
};

export default withMergeToolCheck(MergeTool);
