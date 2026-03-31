/* eslint-disable sonarjs/no-duplicate-string */
import PropTypes from 'prop-types';
import React, { useContext, useRef } from 'react';

import ToolbarPopover from '@new-ui/components/LuminToolbar/components/ToolbarPopover';
import withValidUserCheck from '@new-ui/HOCs/withValidUserCheck';

import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';

import { withExitFormBuildChecking } from 'helpers/toggleFormFieldCreationMode';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { useAutoDetectionStore } from 'features/FormFieldDetection/hooks/useAutoDetectionStore';

import UserEventConstants from 'constants/eventConstants';
import { TOOLS_NAME } from 'constants/toolsName';

import SignatureListPopoverContent from './components/SignatureListPopoverContent';
import { useOpenToolListener } from './hooks/useOpenToolListener';
import { useRequestSignatureAvailbility } from './hooks/useRequestSignatureAvailbility';
import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';
import { getShortcut } from '../../utils';

const SignatureTool = ({ isToolAvailable, toggleCheckPopper, toolName }) => {
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);
  const showPopperRef = useRef();
  const { canRequest } = useRequestSignatureAvailbility();
  const removeAutoDetectAnnotationId = useAutoDetectionStore((state) => state.removeAutoDetectAnnotationId);
  const onBtnClick = ToolSwitchableChecker.createToolSwitchableHandler(() => {
    if (isToolAvailable || canRequest) {
      showPopperRef.current();
    } else {
      toggleCheckPopper();
    }
  });

  useOpenToolListener(showPopperRef);

  const singleButtonProps = (handleShowPopper, ref, visible) => ({
    onClick: onBtnClick,
    ref,
    isActive: visible,
    icon: 'md_signature',
    iconSize: 24,
    dataElement: 'signatureToolButton',
    tooltipProps: { position: 'bottom', content: t('annotation.signature'), shortcut: getShortcut('overlay') },
    label: t('annotation.signature'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    'data-lumin-btn-name': UserEventConstants.Events.HeaderButtonsEvent.SIGNATURE_TOOL,
  });

  return (
    <ToolbarPopover
      onClickAway={removeAutoDetectAnnotationId}
      renderPopperContent={(contentProps) => (
        <SignatureListPopoverContent {...contentProps} onlyAllowRequest={!isToolAvailable && canRequest} />
      )}
      containerMaxWidth={400}
      renderChildren={({ handleShowPopper, ref, visible }) => {
        showPopperRef.current = withExitFormBuildChecking(() => handleShowPopper());
        return (
          <ToolbarRightSectionItem
            isSingleButton
            toolName={toolName}
            renderAsMenuItem={renderAsMenuItem}
            buttonProps={singleButtonProps(handleShowPopper, ref, visible)}
          />
        );
      }}
    />
  );
};

SignatureTool.propTypes = {
  toolName: PropTypes.string.isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
};

SignatureTool.defaultProps = {};

export default withValidUserCheck(SignatureTool, TOOLS_NAME.SIGNATURE);
