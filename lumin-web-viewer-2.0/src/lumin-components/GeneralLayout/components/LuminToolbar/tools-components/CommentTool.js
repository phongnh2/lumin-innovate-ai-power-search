/* eslint-disable sonarjs/no-duplicate-string */
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import ToolbarPopover from '@new-ui/components/LuminToolbar/components/ToolbarPopover';
import { getColor, switchTool, StaticShortcutID } from '@new-ui/components/LuminToolbar/utils.js';
import withValidUserCheck from '@new-ui/HOCs/withValidUserCheck';

import actions from 'actions';
import selectors from 'selectors';

import ToolStylePalette from 'lumin-components/ToolStylePalette';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';

import { measureToolActions, measureToolSelectors } from 'features/MeasureTool/slices';
import { useToolLabels } from 'features/QuickSearch/hooks/useToolLabels';

import { DataElements } from 'constants/dataElement';
import { TOOLS_NAME } from 'constants/toolsName';

import { useToolbarContext } from '../components/ToolbarContext';
import { ToolbarItemContext } from '../components/ToolbarItem';

const CommentTool = ({ activeToolName, isToolAvailable, toggleCheckPopper, toolName }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const toolbarContext = useToolbarContext();
  const isMeasureToolActive = useSelector(measureToolSelectors.isActive);

  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);

  const { getToolLabel } = useToolLabels();

  const isToolActive = activeToolName === TOOLS_NAME.STICKY;

  const onBtnClick = (toolName, isActive) => {
    if (isToolAvailable) {
      if (isMeasureToolActive) {
        dispatch(measureToolActions.setIsActive(false));
      }
      if (isActive) {
        dispatch(actions.setIsToolPropertiesOpen(false));
        dispatch(actions.setToolPropertiesValue(TOOL_PROPERTIES_VALUE.DEFAULT));
      }
      switchTool({ toolName, isActive, eventElementName: 'stickyToolButton' });
    } else {
      toggleCheckPopper();
    }
  };

  const splitButtonProps = ({ handleShowPopper, ref, visible }) => ({
    shortcutId: StaticShortcutID.Sticky,
    onClick: () => onBtnClick(TOOLS_NAME.STICKY, isToolActive),
    label: getToolLabel('common.comment', 'action.addComment'),
    ref,
    isActive: isToolActive,
    icon: 'md_comment_teardrop_text',
    secondaryOnClick: () => {
      if (isToolAvailable) {
        handleShowPopper();
        onBtnClick(TOOLS_NAME.STICKY, false);
      } else {
        toggleCheckPopper();
      }
    },
    isSecondaryActive: visible,
    singleButtonProps: {
      iconSize: 24,
      iconColor: getColor(activeToolName, isToolActive),
      onClick: () => onBtnClick(TOOLS_NAME.STICKY, isToolActive),
      isActive: isToolActive,
      label: t('action.addComment'),
      hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
      tooltipProps: { position: 'bottom', content: t('common.comment') },
      dataElement: DataElements.STICKY_TOOL_BUTTON,
    },
  });

  return (
    <ToolbarPopover
      renderPopperContent={(contentProps) => <ToolStylePalette {...contentProps} />}
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

CommentTool.propTypes = {
  toolName: PropTypes.string.isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
  activeToolName: PropTypes.string.isRequired,
  activeToolStyles: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  activeToolName: selectors.getActiveToolName(state),
  activeToolStyles: selectors.getActiveToolStyles(state),
});

const mapDispatchToProps = () => ({});

export default withValidUserCheck(connect(mapStateToProps, mapDispatchToProps)(CommentTool), TOOLS_NAME.STICKY);
