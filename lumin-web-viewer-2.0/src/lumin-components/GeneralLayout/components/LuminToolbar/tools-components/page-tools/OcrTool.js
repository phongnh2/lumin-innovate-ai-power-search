import PropTypes from 'prop-types';
import React, { useContext, useCallback } from 'react';

import { AvailabilityToolCheckProvider } from '@new-ui/HOCs/withValidUserCheck';

import selectors from 'selectors';

import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { usePageToolDisabled } from 'hooks/usePageToolDisabled';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { withExitFormBuildChecking } from 'helpers/toggleFormFieldCreationMode';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import useApplyOcrTool from 'features/DocumentOCR/useApplyOcrTool';

import { documentStorage } from 'constants/documentConstants';
import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';

import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

const OcrTool = ({ withEditPermission }) => {
  const toolbarContext = useToolbarContext();
  const { customLabel, collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { isDisabled, message } = usePageToolDisabled();
  const isValidStorage = [documentStorage.s3, documentStorage.caching, documentStorage.google].includes(
    currentDocument.service
  );
  const isNotAvailable = !isValidStorage || isDisabled;

  const { t } = useTranslation();
  const applyOcr = useApplyOcrTool();

  const handleOcrAction = useCallback(
    (shouldShowPremiumIcon, toggleCheckPopper) => {
      if (shouldShowPremiumIcon) {
        toggleCheckPopper();
        return;
      }

      const ocrWithPermission = withEditPermission(applyOcr);
      const ocrWithFormCheck = withExitFormBuildChecking(ocrWithPermission);
      ToolSwitchableChecker.createToolSwitchableHandler(ocrWithFormCheck)();
    },
    [applyOcr, withEditPermission]
  );

  const singleButtonProps = ({ shouldShowPremiumIcon, toggleCheckPopper }) => ({
    icon: 'md_OCR',
    iconSize: 24,
    tooltipProps: { position: 'bottom', content: message || t('viewer.ocr.actionButton') },
    label: customLabel || t('viewer.ocr.actionButton'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    onClick: () => handleOcrAction(shouldShowPremiumIcon, toggleCheckPopper),
    shouldShowPremiumIcon,
  });

  if (isNotAvailable) {
    return null;
  }
  return (
    <AvailabilityToolCheckProvider
      toolName={TOOLS_NAME.OCR}
      useModal
      eventName={PremiumToolsPopOverEvent.OCR}
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

OcrTool.propTypes = {
  withEditPermission: PropTypes.func.isRequired,
};

export default OcrTool;
