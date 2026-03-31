import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';

import { useLeftSideBarFeatureValidation } from '@new-ui/components/LuminLeftSideBar/hooks/useLeftSideBarFeatureValidation';

import core from 'core';
import selectors from 'selectors';

import { switchTool } from 'lumin-components/GeneralLayout/components/LuminToolbar/utils.js';
import withValidUserCheck from 'lumin-components/GeneralLayout/HOCs/withValidUserCheck';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useNetworkStatus } from 'hooks/useNetworkStatus';
import { useTranslation } from 'hooks/useTranslation';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { documentSyncSelectors } from 'features/Document/slices';

import defaultTool from 'constants/defaultTool';
import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';

import { useToolbarContext } from '../components/ToolbarContext';
import { ToolbarItemContext } from '../components/ToolbarItem';

const RedactionTool = ({ isToolAvailable, toggleCheckPopper, toolName, shouldShowPremiumIcon }) => {
  const activeToolName = useSelector(selectors.getActiveToolName);
  const isToolActive = activeToolName === TOOLS_NAME.REDACTION;
  const { isOffline } = useNetworkStatus();
  const isDocumentSyncing = useSelector(documentSyncSelectors.isSyncing);
  const { isFeatureDisabled: isDisabledRedactionTool, getTooltipContent: getRedactValidationTooltipContent } =
    useLeftSideBarFeatureValidation();

  const { t } = useTranslation();

  const toolbarContext = useToolbarContext();

  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);

  const onBtnClick = () => {
    if (!isToolAvailable) {
      toggleCheckPopper();
      return;
    }

    if (isToolActive) {
      core.setToolMode(defaultTool);
      return;
    }

    switchTool({
      toolName: TOOLS_NAME.REDACTION,
      eventElementName: ButtonName.REDACTION,
    });
  };

  const getTooltipContent = () => {
    if (isDocumentSyncing) {
      return t('viewer.waitingForDocumentEdit');
    }

    if (isDisabledRedactionTool) {
      return getRedactValidationTooltipContent({ validateMimeType: true, allowInTempEditMode: false });
    }

    return t('component.redaction');
  };

  const singleButtonProps = {
    onClick: onBtnClick,
    icon: 'md_redaction',
    iconSize: 24,
    isActive: isToolActive,
    eventTrackingName: ButtonName.REDACTION,
    tooltipProps: {
      placement: 'bottom',
      content: getTooltipContent(),
    },
    label: t('component.redaction'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    shouldShowPremiumIcon,
    disabled: isOffline || isDocumentSyncing || isDisabledRedactionTool,
    'data-cy': 'redact_text_button',
  };

  return (
    <ToolbarRightSectionItem
      isSingleButton
      toolName={toolName}
      renderAsMenuItem={renderAsMenuItem}
      buttonProps={singleButtonProps}
    />
  );
};

RedactionTool.propTypes = {
  toolName: PropTypes.string.isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
  shouldShowPremiumIcon: PropTypes.bool.isRequired,
};

export default withValidUserCheck(RedactionTool, 'AnnotationCreateRedaction', PremiumToolsPopOverEvent.Redaction);
