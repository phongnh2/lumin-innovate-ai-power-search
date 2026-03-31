import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import actions from 'actions';
import core from 'core';

import Icomoon from 'lumin-components/Icomoon';
import ToolStylePalette from 'lumin-components/ToolStylePalette';
import MaterialPopper from 'luminComponents/MaterialPopper';
import { ButtonIconColor } from 'luminComponents/Shared/ButtonIcon';
import Tooltip from 'luminComponents/Tooltip';

import { useThemeMode, useTranslation } from 'hooks';

import DATA_ELEMENTS from 'constants/dataElement';
import UserEventConstants from 'constants/eventConstants';
import TOOLS_NAME from 'constants/toolsName';

import * as Styled from '../ToolOverlayLumin.styled';

import '../ToolsOverlayLumin.scss';

const HighlightToolsOverlay = ({ setCurrentTool, currentTool }) => {
  const { t } = useTranslation();
  const [openPopper, setOpenPopper] = useState(false);
  const dispatch = useDispatch();
  const themeMode = useThemeMode();
  const ref = useRef();
  const currentToolName = core.getToolMode()?.name;

  const renderItem = ({ toolName, dataElement, icon, title, eventTrackingName }) => (
    <Styled.HighlightItem
      active={currentTool ? currentTool === toolName : currentToolName === toolName}
      onClick={() => {
        core.setToolMode(toolName);
        setCurrentTool?.(toolName);
        dispatch(actions.setActiveToolGroup('highlightTools'));
        dispatch(actions.closeElement('toolStylePopup', 'searchOverlay', 'viewControlsOverlay'));
      }}
      data-lumin-btn-name={eventTrackingName}
    >
      <Styled.ToolIcon>
        <Icomoon className={icon} size="18" />
      </Styled.ToolIcon>
      <Styled.ToolTitle>{title}</Styled.ToolTitle>
      <div className="divider" />
      <Styled.MenuButton
        icon="more"
        iconSize={16}
        color={ButtonIconColor.SECONDARY}
        data-element={dataElement}
        onClick={(e) => {
          e.preventDefault();
          core.setToolMode(toolName);
          if (!openPopper) {
            setOpenPopper(true);
          }
        }}
        data-lumin-btn-name={eventTrackingName}
      />
    </Styled.HighlightItem>
  );

  return (
    <ThemeProvider theme={Styled.theme[themeMode]}>
      <div data-element="toolsOverlay" ref={ref}>
        <Styled.HighlightList alignMenuItems="top">
          {renderItem({
            toolName: TOOLS_NAME.HIGHLIGHT,
            icon: 'tool-highlight',
            dataElement: DATA_ELEMENTS.HIGHLIGHT_TOOL_BUTTON,
            title: `${t('annotation.highlight')} (H)`,
            eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.HIGHLIGHT,
          })}
          {renderItem({
            toolName: TOOLS_NAME.FREEHAND_HIGHLIGHT,
            icon: 'tool-freehand-highlight',
            dataElement: DATA_ELEMENTS.FREEHAND_HIGHLIGHT_TOOL_BUTTON,
            title: (
              <span>
                {t('annotation.freehandHighlight')}{' '}
                <Tooltip content={t('viewer.freehandHighlightTooltip')} placement="bottom-start">
                  <Icomoon className="exclamation-circle" size="12" />
                </Tooltip>
              </span>
            ),
            eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.FREEHAND_HIGHLIGHT,
          })}
        </Styled.HighlightList>
        <MaterialPopper
          className="highlightToolStylePoppper"
          placement="right-start"
          parentOverflow="viewport"
          open={openPopper}
          anchorEl={ref.current}
          hasDropDownList
        >
          <ToolStylePalette />
        </MaterialPopper>
      </div>
    </ThemeProvider>
  );
};
HighlightToolsOverlay.propTypes = {
  setCurrentTool: PropTypes.func.isRequired,
  currentTool: PropTypes.string.isRequired,
};

HighlightToolsOverlay.defaultProps = {};
export default HighlightToolsOverlay;
