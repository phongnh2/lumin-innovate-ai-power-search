import { Dispatch } from 'redux';

import { LEFT_PANEL_VALUES, TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import { LayoutElements } from '@new-ui/constants';

import { COMMENT_PANEL_LAYOUT_STATE } from 'constants/documentConstants';

type GeneralLayoutActionTypes =
  | 'SET_IS_GENERAL_LAYOUT_RIGHT_PANEL_OPEN'
  | 'SET_TOOL_PROPERTIES_STATE'
  | 'SET_IS_GENERAL_LAYOUT_TOOL_PROPERTIES_OPEN'
  | 'SET_GENERAL_LAYOUT_TOOL_PROPERTIES_VALUE'
  | 'SET_IS_GENERAL_LAYOUT_LEFT_PANEL_OPEN'
  | 'SET_GENERAL_TOOLBAR_VALUE'
  | 'SET_LEFT_PANEL_VALUE'
  | 'OPEN_OUTLINE_PANEL'
  | 'SET_RIGHT_PANEL_VALUE'
  | 'SET_SEARCH_OVERLAY_VALUE'
  | 'SET_IS_COMMENT_PANEL_OPEN'
  | 'RESET_GENERAL_LAYOUT'
  | 'CLOSE_RIGHT_PANEL_CONTENT'
  | 'SET_COMMENT_PANEL_LAYOUT_STATE'
  | 'SET_IS_IN_FOCUS_MODE';

type ToolPropertiesValue = typeof TOOL_PROPERTIES_VALUE[keyof typeof TOOL_PROPERTIES_VALUE];

type LeftPanelValue = typeof LEFT_PANEL_VALUES[keyof typeof LEFT_PANEL_VALUES];

type RightPanelValue = typeof LayoutElements[keyof typeof LayoutElements];

type LeftSidebarValue = typeof LEFT_SIDE_BAR_VALUES[keyof typeof LEFT_SIDE_BAR_VALUES];

interface GeneralLayoutAction<T = any> {
  type: GeneralLayoutActionTypes;
  payload?: T;
}

interface ToolPropertiesStatePayload {
  isOpen: boolean;
  value: ToolPropertiesValue;
}

export const setIsRightPanelOpen = (args: boolean) => (dispatch: Dispatch<GeneralLayoutAction<boolean>>) => {
  dispatch({
    type: 'SET_IS_GENERAL_LAYOUT_RIGHT_PANEL_OPEN',
    payload: args,
  });
};

export const setToolPropertiesState =
  ({ isOpen, value }: ToolPropertiesStatePayload) =>
  (dispatch: Dispatch<GeneralLayoutAction<ToolPropertiesStatePayload>>) => {
    dispatch({
      type: 'SET_TOOL_PROPERTIES_STATE',
      payload: {
        isOpen,
        value,
      },
    });
  };

export const setIsToolPropertiesOpen = (args: boolean) => (dispatch: Dispatch<GeneralLayoutAction<boolean>>) => {
  dispatch({
    type: 'SET_IS_GENERAL_LAYOUT_TOOL_PROPERTIES_OPEN',
    payload: args,
  });
};

export const setToolPropertiesValue = (value: ToolPropertiesValue) => (dispatch: Dispatch<GeneralLayoutAction>) => {
  dispatch({
    type: 'SET_GENERAL_LAYOUT_TOOL_PROPERTIES_VALUE',
    payload: value,
  });
};

export const setIsLeftPanelOpen = (args: boolean) => (dispatch: Dispatch<GeneralLayoutAction<boolean>>) => {
  dispatch({
    type: 'SET_IS_GENERAL_LAYOUT_LEFT_PANEL_OPEN',
    payload: args,
  });
};

export const setToolbarValue = (args: LeftSidebarValue) => (dispatch: Dispatch<GeneralLayoutAction>) => {
  dispatch({
    type: 'SET_GENERAL_TOOLBAR_VALUE',
    payload: args,
  });
};

export const setLeftPanelValue = (args: LeftPanelValue) => (dispatch: Dispatch<GeneralLayoutAction>) => {
  dispatch({
    type: 'SET_LEFT_PANEL_VALUE',
    payload: args,
  });
};

export const openOutlinePanel = () => (dispatch: Dispatch<GeneralLayoutAction>) => {
  dispatch({
    type: 'OPEN_OUTLINE_PANEL',
  });
};

export const setRightPanelValue = (args: RightPanelValue) => (dispatch: Dispatch<GeneralLayoutAction>) => {
  dispatch({
    type: 'SET_RIGHT_PANEL_VALUE',
    payload: args,
  });
};

export const setSearchOverlayValue = (args: boolean) => (dispatch: Dispatch<GeneralLayoutAction<boolean>>) => {
  dispatch({
    type: 'SET_SEARCH_OVERLAY_VALUE',
    payload: args,
  });
};

export const setDisplayCommentPanel = (args: boolean) => (dispatch: Dispatch<GeneralLayoutAction<boolean>>) => {
  dispatch({
    type: 'SET_IS_COMMENT_PANEL_OPEN',
    payload: args,
  });
};

export const resetGeneralLayout = () => (dispatch: Dispatch<GeneralLayoutAction>) => {
  dispatch({
    type: 'RESET_GENERAL_LAYOUT',
  });
};

export const closeLuminRightPanel = () => (dispatch: Dispatch<GeneralLayoutAction>) => {
  dispatch({
    type: 'CLOSE_RIGHT_PANEL_CONTENT',
  });
  dispatch({
    type: 'SET_COMMENT_PANEL_LAYOUT_STATE',
    payload: { state: COMMENT_PANEL_LAYOUT_STATE.ON_DOCUMENT },
  });
};

export const setIsInFocusMode = (isInFocusMode: boolean): GeneralLayoutAction<boolean> => ({
  type: 'SET_IS_IN_FOCUS_MODE',
  payload: isInFocusMode,
});
