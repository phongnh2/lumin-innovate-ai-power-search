import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { isMac } from 'helpers/device';
import getToolStyles from 'helpers/getToolStyles';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import { eventTracking } from 'utils/recordUtil';

import { measureToolActions, measureToolSelectors } from 'features/MeasureTool/slices';

import UserEventConstants from 'constants/eventConstants';
import { getDataWithKey, mapToolNameToKey } from 'constants/map';
import { MEASUREMENT_TOOLS, TOOLS_NAME } from 'constants/toolsName';

export const getColor = (toolName, isActive) => {
  const { iconColor } = getDataWithKey(mapToolNameToKey(toolName));
  let color = '';
  if (isActive) {
    const toolStyles = getToolStyles(toolName);
    color = toolStyles?.[iconColor]?.toHexString?.();
  }
  return color;
};

export const PaletteColorType = {
  Stroke: 'stroke',
  Fill: 'fill',
  Text: 'text',
};

export const extractPaletteColor = (colorModel, type) => {
  if (!colorModel) {
    return null;
  }
  let model = null;
  switch (type) {
    case PaletteColorType.Stroke:
      model = colorModel.StrokeColor;
      break;
    case PaletteColorType.Text:
      model = colorModel.TextColor;
      break;
    case PaletteColorType.Fill:
      model = colorModel.FillColor;
      break;
    default:
      break;
  }
  if (model) {
    return { r: model.R, g: model.G, b: model.B, a: model.A };
  }
  return null;
};

export const ModeTypes = {
  FORM_BUILDER: 'FORM_BUILDER',
  EDIT: 'EDIT',
  REDACTION: 'REDACTION',
};

export const isToolModeActive = (modeType) => {
  switch (modeType) {
    case ModeTypes.FORM_BUILDER: {
      const formFieldCreationManager = core.getFormFieldCreationManager();
      return formFieldCreationManager.isInFormFieldCreationMode();
    }
    case ModeTypes.EDIT: {
      const { getState } = store;
      return selectors.isInContentEditMode(getState());
    }
    case ModeTypes.REDACTION: {
      const state = store.getState();
      const activeToolName = selectors.getActiveToolName(state);
      return activeToolName === TOOLS_NAME.REDACTION;
    }
    default:
      return false;
  }
};

const shouldCloseMeasureTool = (toolName) => {
  const isMeasureToolActive = measureToolSelectors.isActive(store.getState());
  const keepMeasureToolOpen = isMeasureToolActive && MEASUREMENT_TOOLS.includes(toolName);
  return !keepMeasureToolOpen;
};

const closeMeasureTool = () => {
  const { dispatch } = store;
  dispatch(measureToolActions.setIsActive(false));
  dispatch(actions.setIsToolPropertiesOpen(false));
  dispatch(actions.setToolPropertiesValue(TOOL_PROPERTIES_VALUE.DEFAULT));
};

export const switchTool = ({ toolName, toolGroup = '', isActive, eventElementName }) => {
  const shouldBlockNextAction = toggleFormFieldCreationMode();
  if (shouldBlockNextAction) {
    return {
      next: false,
    };
  }
  const isBlockedModeActive =
    isToolModeActive(ModeTypes.FORM_BUILDER) ||
    isToolModeActive(ModeTypes.EDIT) ||
    isToolModeActive(ModeTypes.REDACTION);
  if (isBlockedModeActive) {
    return {
      next: false,
    };
  }
  if (shouldCloseMeasureTool(toolName)) {
    closeMeasureTool();
  }
  if (isActive) {
    core.setToolMode(TOOLS_NAME.EDIT);
    return {
      next: true,
    };
  }
  if (eventElementName) {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: eventElementName,
    });
  }
  store.dispatch(actions.setActiveToolGroup(toolGroup));
  core.setToolMode(toolName);
  return {
    next: true,
  };
};

export const StaticShortcutID = {
  Sticky: 'sticky',
  Eraser: 'eraser',
  FreeHand: 'freeHand',
  FreeText: 'freeText',
  HighLight: 'highlight',
  Default: '',
};

const shortcutsObject = {
  rotate: isMac ? '⌘⇧-' : 'Ctrl Shift -',
  zoomOut: isMac ? '⌘-' : 'Ctrl -',
  zoomIn: isMac ? '⌘+' : 'Ctrl +',
  fitHeight: isMac ? '⌘0' : 'Ctrl 0',
  undo: isMac ? '⌘Z' : 'Ctrl Z',
  redo: isMac ? '⌘⇧Z' : 'Ctrl Shift Z',
  focusMode: isMac ? '⌘\\' : 'Ctrl \\',
  escape: 'ESC',
  pan: 'P',
  arrowToolButton: 'A',
  callout: 'C',
  eraser: 'E',
  freeHand: 'F',
  stamp: 'I',
  lineToolButton: 'L',
  sticky: 'N',
  ellipseToolButton: 'O',
  rectangleToolButton: 'R',
  rubberStamp: 'Q',
  freeText: 'T',
  overlay: 'S',
  squigglyToolButton: 'G',
  highlight: 'H',
  strikeoutToolButton: 'K',
  underlineToolButton: 'U',
  fullScreen: isMac ? '⌘ Enter' : 'Ctrl Enter',
  chatbot: isMac ? '⌘ /' : 'Ctrl /',
  quickSearch: isMac ? 'Option /' : 'Alt /',
};

export const getShortcut = (target) => shortcutsObject[target] || '';
