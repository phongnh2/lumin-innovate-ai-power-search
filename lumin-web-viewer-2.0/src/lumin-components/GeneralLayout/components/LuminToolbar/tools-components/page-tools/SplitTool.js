/* eslint-disable sonarjs/no-duplicate-string */
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { AvailabilityToolCheckProvider } from '@new-ui/HOCs/withValidUserCheck';

import selectors from 'selectors';

import { TOOL_PROPERTIES_VALUE } from 'luminComponents/GeneralLayout/components/LuminLeftPanel/constants';
import useToolProperties from 'luminComponents/GeneralLayout/hooks/useToolProperties';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { usePageToolDisabled } from 'hooks/usePageToolDisabled';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';

import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

const SplitTool = ({ withEditPermission }) => {
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);
  const { enterSplitExtractPageTool } = useToolProperties();
  const toolPropertiesValue = useShallowSelector(selectors.toolPropertiesValue);
  const { isDisabled, message } = usePageToolDisabled();

  const singleButtonProps = ({ shouldShowPremiumIcon, toggleCheckPopper }) => ({
    icon: 'md_split',
    iconSize: 24,
    tooltipProps: {
      position: 'bottom',
      content: message || t('generalLayout.toolbar.splitNExtract'),
    },
    label: t('generalLayout.toolbar.splitNExtract'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    onClick: () => {
      if (shouldShowPremiumIcon) {
        toggleCheckPopper();
      } else {
        ToolSwitchableChecker.createToolSwitchableHandler(withEditPermission(enterSplitExtractPageTool))();
      }
    },
    isActive: toolPropertiesValue === TOOL_PROPERTIES_VALUE.SPLIT_EXTRACT,
    shouldShowPremiumIcon,
    disabled: isDisabled,
  });

  return (
    <AvailabilityToolCheckProvider
      toolName={TOOLS_NAME.SPLIT_PAGE}
      eventName={PremiumToolsPopOverEvent.SplitPage}
      useModal
      render={({ shouldShowPremiumIcon, toggleCheckPopper }) => (
        <ToolbarRightSectionItem
          isSingleButton
          renderAsMenuItem={renderAsMenuItem}
          buttonProps={singleButtonProps({ shouldShowPremiumIcon, toggleCheckPopper })}
        />
      )}
    />
  );
};

SplitTool.propTypes = {
  withEditPermission: PropTypes.func.isRequired,
};

export default SplitTool;
