import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import StrokeStylePalette from 'lumin-components/GeneralLayout/components/StrokeStylePalette';
import ToolbarPopoverComponent from 'luminComponents/GeneralLayout/components/LuminToolbar/components/ToolbarPopover';
import withValidUserCheckHOC from 'luminComponents/GeneralLayout/HOCs/withValidUserCheck';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';

import UserEventConstants from 'constants/eventConstants';
import { mapToolNameToKey } from 'constants/map';
import { TOOLS_NAME } from 'constants/toolsName';

import { useToolbarContext } from '../components/ToolbarContext';
import { ToolbarItemContext } from '../components/ToolbarItem';
import { switchTool, StaticShortcutID } from '../utils';

const switchToFreehand = ({ isActive }) => {
  switchTool({
    toolName: TOOLS_NAME.FREEHAND,
    isActive,
    eventElementName: UserEventConstants.Events.HeaderButtonsEvent.FREE_HAND_TOOL,
  });
};

const FreeHandTool = ({ activeToolName, toolStyles, iconColor, isToolAvailable, toggleCheckPopper, toolName }) => {
  const { t } = useTranslation();

  const toolbarContext = useToolbarContext();

  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);

  const isToolActive = useMemo(() => activeToolName === TOOLS_NAME.FREEHAND, [activeToolName]);

  const color = isToolActive ? toolStyles?.[iconColor]?.toHexString?.() : '';

  const popoverChecker = ({ primaryAction }) => {
    if (isToolAvailable) {
      primaryAction();
      return;
    }
    toggleCheckPopper();
  };

  const onBtnClick = (isActive) => {
    popoverChecker({
      primaryAction: () => switchToFreehand({ isActive }),
    });
  };

  const splitButtonProps = ({ handleShowPopper, ref, visible }) => ({
    shortcutId: StaticShortcutID.FreeHand,
    onClick: () => onBtnClick(isToolActive),
    label: t('action.draw'),
    ref,
    isActive: isToolActive,
    icon: 'md_freehand',
    showArrow: true,
    eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.FREE_HAND_TOOL,
    secondaryOnClick: () => {
      popoverChecker({
        primaryAction: () => {
          handleShowPopper();
          onBtnClick(false);
        },
      });
    },
    isSecondaryActive: visible,
    singleButtonProps: {
      iconSize: 24,
      iconColor: color,
      hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
      dataElement: 'freeHandToolGroupButton',
      tooltipProps: {
        position: 'bottom',
        content: t('action.draw'),
      },
    },
    secondaryButtonProps: { tooltip: { title: t('toolOption.draw') } },
  });

  return (
    <ToolbarPopoverComponent
      containerMaxWidth={304}
      renderPopperContent={(contentProps) => <StrokeStylePalette {...contentProps} />}
      renderChildren={({ handleShowPopper, ref, visible }) => (
        <ToolbarRightSectionItem
          toolName={toolName}
          isSingleButton={false}
          renderAsMenuItem={renderAsMenuItem}
          buttonProps={splitButtonProps({ handleShowPopper, ref, visible })}
        />
      )}
    />
  );
};

FreeHandTool.propTypes = {
  toolName: PropTypes.string.isRequired,
  activeToolName: PropTypes.string.isRequired,
  toolStyles: PropTypes.object.isRequired,
  iconColor: PropTypes.string,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
};

FreeHandTool.defaultProps = {
  iconColor: '',
};

const mapStateToProps = (state) => {
  const activeToolName = selectors.getActiveToolName(state);

  return {
    activeToolName,
    activeToolStyle: selectors.getActiveToolStyles(state),
    toolStyles: selectors.getActiveToolStyles(state),
    iconColor: selectors.getIconColor(state, mapToolNameToKey(activeToolName)),
  };
};

const mapDispatchToProps = () => ({});

export default withValidUserCheckHOC(connect(mapStateToProps, mapDispatchToProps)(FreeHandTool), TOOLS_NAME.FREEHAND);
