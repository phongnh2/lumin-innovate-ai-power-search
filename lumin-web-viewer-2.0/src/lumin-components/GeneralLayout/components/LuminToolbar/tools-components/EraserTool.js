import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect } from 'react-redux';

import StrokeWidthSlider from '@new-ui/components/StrokeWidthSlider';
import withValidUserCheck from '@new-ui/HOCs/withValidUserCheck';

import selectors from 'selectors';

import ToolbarPopover from 'luminComponents/GeneralLayout/components/LuminToolbar/components/ToolbarPopover';
import withBaseStylePaletteWrap from 'luminComponents/GeneralLayout/HOCs/withBaseStylePaletteWrap';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';

import DataElements from 'constants/dataElement';
import UserEventConstants from 'constants/eventConstants';
import { TOOLS_NAME } from 'constants/toolsName';

import { useToolbarContext } from '../components/ToolbarContext';
import { ToolbarItemContext } from '../components/ToolbarItem';
import { switchTool, StaticShortcutID } from '../utils';

const MAX_ERASER_STROKE_THICKNESS = 32;
const MIN_ERASER_STROKE_THICKNESS = 8;

const StrokeStylePalette = ({ style, onChange }) => (
  <StrokeWidthSlider
    onChange={onChange}
    style={style}
    max={MAX_ERASER_STROKE_THICKNESS}
    min={MIN_ERASER_STROKE_THICKNESS}
    hideInput
    sliderProps={{
      step: 8,
      marks: true,
    }}
  />
);

const EnhancedStrokeStylePalette = withBaseStylePaletteWrap(StrokeStylePalette, 304);

export const EraserTool = ({ activeToolName, isToolAvailable, toggleCheckPopper, toolName }) => {
  const { t } = useTranslation();

  const toolbarContext = useToolbarContext();

  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);

  const isToolActive = activeToolName === TOOLS_NAME.ERASER;

  const onBtnClick = (isActive) => {
    if (isToolAvailable) {
      switchTool({
        toolName: TOOLS_NAME.ERASER,
        isActive,
        eventElementName: UserEventConstants.Events.HeaderButtonsEvent.ERASER,
      });
    } else {
      toggleCheckPopper();
    }
  };

  const handleSecondaryOnClick = (showPopper) => (args) => {
    if (isToolAvailable) {
      showPopper(args);
      onBtnClick(false);
    } else {
      toggleCheckPopper();
    }
  };

  const singleButtonProps = {
    iconSize: 24,
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    dataElement: DataElements.ERASER_TOOL_BUTTON,
    tooltipProps: {
      position: 'bottom',
      content: t('annotation.eraser'),
    },
  };

  const splitButtonProps = ({ handleShowPopper, ref, visible }) => ({
    shortcutId: StaticShortcutID.Eraser,
    onClick: () => onBtnClick(isToolActive),
    label: t('annotation.eraser'),
    ref,
    isActive: isToolActive,
    icon: 'md_eraser',
    showArrow: true,
    eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.ERASER,
    secondaryOnClick: handleSecondaryOnClick(() => handleShowPopper()),
    isSecondaryActive: visible,
    singleButtonProps,
    secondaryButtonProps: { tooltip: { title: t('toolOption.eraser') } },
  });

  return (
    <ToolbarPopover
      containerMaxWidth={312}
      renderPopperContent={() => <EnhancedStrokeStylePalette />}
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

StrokeStylePalette.propTypes = {
  style: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

EraserTool.propTypes = {
  toolName: PropTypes.string.isRequired,
  activeToolName: PropTypes.string.isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
};

EraserTool.defaultProps = {};

const mapStateToProps = (state) => ({
  activeToolName: selectors.getActiveToolName(state),
});

const mapDispatchToProps = () => ({});

export default withValidUserCheck(connect(mapStateToProps, mapDispatchToProps)(EraserTool), TOOLS_NAME.ERASER);
