import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import selectors from 'selectors';

import { POPPER_SCROLL_CN } from 'lumin-components/RubberStampOverlay/constants';
import RubberStampOverlayContent from 'lumin-components/RubberStampOverlay/RubberStampOverlayContent';
import ToolbarPopover from 'luminComponents/GeneralLayout/components/LuminToolbar/components/ToolbarPopover';
import withValidUserCheck from 'luminComponents/GeneralLayout/HOCs/withValidUserCheck';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';
import useShallowSelector from 'hooks/useShallowSelector';

import { withExitFormBuildChecking } from 'helpers/toggleFormFieldCreationMode';

import UserEventConstants from 'constants/eventConstants';
import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';

import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

const RubberStampTool = ({ isToolAvailable, toggleCheckPopper, shouldShowPremiumIcon, toolName }) => {
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);
  const activeToolName = useShallowSelector(selectors.getActiveToolName);

  const onBtnClick = (_handleShowPopper) => {
    if (isToolAvailable) {
      const handleShowPopper = withExitFormBuildChecking(_handleShowPopper);
      handleShowPopper();
    } else {
      toggleCheckPopper();
    }
  };

  const singleButtonProps = (handleShowPopper, ref, visible) => ({
    onClick: () => onBtnClick(handleShowPopper),
    ref,
    isActive: renderAsMenuItem || activeToolName !== TOOLS_NAME.EDIT ? false : visible,
    icon: 'md_stamp',
    iconSize: 24,
    dataElement: 'rubberStampToolButton',
    tooltipProps: { position: 'bottom', content: t('annotation.rubberStamp') },
    label: t('annotation.stamp'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    shouldShowPremiumIcon,
    'data-lumin-btn-name': UserEventConstants.Events.HeaderButtonsEvent.RUBBER_STAMP,
  });

  return (
    <ToolbarPopover
      containerMaxWidth={304}
      contentClassName={POPPER_SCROLL_CN}
      renderPopperContent={(contentProps) => <RubberStampOverlayContent {...contentProps} />}
      renderChildren={({ handleShowPopper, ref, visible }) => (
        <ToolbarRightSectionItem
          isSingleButton
          toolName={toolName}
          renderAsMenuItem={renderAsMenuItem}
          buttonProps={singleButtonProps(handleShowPopper, ref, visible)}
        />
      )}
    />
  );
};

RubberStampTool.propTypes = {
  toolName: PropTypes.string.isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
  shouldShowPremiumIcon: PropTypes.bool.isRequired,
};

RubberStampTool.defaultProps = {};

export default withValidUserCheck(RubberStampTool, TOOLS_NAME.RUBBER_STAMP, PremiumToolsPopOverEvent.RubberStamp);
