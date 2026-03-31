import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { getShortcut, switchTool } from 'lumin-components/GeneralLayout/components/LuminToolbar/utils.js';
import withValidUserCheck from 'luminComponents/GeneralLayout/HOCs/withValidUserCheck';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';

import DataElements from 'constants/dataElement';
import UserEventConstants from 'constants/eventConstants';
import TOOLS_NAME from 'constants/toolsName';

import { useToolbarContext } from '../components/ToolbarContext';
import { ToolbarItemContext } from '../components/ToolbarItem';

export const ImageTool = ({ isToolAvailable, toggleCheckPopper, toolName }) => {
  const { t } = useTranslation();

  const toolbarContext = useToolbarContext();

  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);

  const onBtnClick = () => {
    if (isToolAvailable) {
      switchTool({
        toolName: TOOLS_NAME.STAMP,
        eventElementName: UserEventConstants.Events.HeaderButtonsEvent.IMAGE,
      });
    } else {
      toggleCheckPopper();
    }
  };

  const singleButtonProps = {
    onClick: onBtnClick,
    icon: 'md_image',
    eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.IMAGE,
    tooltipProps: { position: 'bottom', content: t('annotation.image'), shortcut: getShortcut('stamp') },
    label: t('annotation.image'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    iconSize: 24,
    dataElement: DataElements.STAMP_TOOL_BUTTON,
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

ImageTool.propTypes = {
  toolName: PropTypes.string.isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
};

ImageTool.defaultProps = {};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default withValidUserCheck(connect(mapStateToProps, mapDispatchToProps)(ImageTool), 'AnnotationCreateStamp');
