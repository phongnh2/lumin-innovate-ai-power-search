import { LEFT_PANEL_VALUES } from '@new-ui/components/LuminLeftPanel/constants';
import { LayoutElements } from '@new-ui/constants';

/* eslint-disable default-param-last */
export default (initialState) =>
  (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
      case 'SET_IS_GENERAL_LAYOUT_RIGHT_PANEL_OPEN': {
        return {
          ...state,
          isRightPanelOpen: payload,
          isCommentPanelOpen: !payload,
        };
      }

      case 'SET_TOOL_PROPERTIES_STATE': {
        return {
          ...state,
          isToolPropertiesOpen: payload.isOpen,
          toolPropertiesValue: payload.value,
        };
      }

      case 'SET_IS_GENERAL_LAYOUT_TOOL_PROPERTIES_OPEN': {
        return {
          ...state,
          isToolPropertiesOpen: payload,
        };
      }

      case 'SET_GENERAL_LAYOUT_TOOL_PROPERTIES_VALUE': {
        return {
          ...state,
          toolPropertiesValue: payload,
        };
      }

      case 'SET_IS_GENERAL_LAYOUT_LEFT_PANEL_OPEN': {
        return {
          ...state,
          isLeftPanelOpen: payload,
        };
      }

      case 'SET_GENERAL_TOOLBAR_VALUE': {
        return {
          ...state,
          toolbarValue: payload,
        };
      }

      case 'SET_LEFT_PANEL_VALUE': {
        return {
          ...state,
          leftPanelValue: payload,
        };
      }

      case 'OPEN_OUTLINE_PANEL': {
        return {
          ...state,
          isLeftPanelOpen: true,
          leftPanelValue: LEFT_PANEL_VALUES.OUTLINE,
        };
      }

      case 'SET_RIGHT_PANEL_VALUE': {
        return {
          ...state,
          rightPanelValue: payload,
        };
      }

      case 'SET_SEARCH_OVERLAY_VALUE': {
        return {
          ...state,
          isOpenSearchOverlay: payload,
        };
      }

      case 'SET_IS_COMMENT_PANEL_OPEN': {
        return {
          ...state,
          isCommentPanelOpen: payload,
        };
      }

      case 'RESET_GENERAL_LAYOUT':
        return { ...initialState };

      case 'CLOSE_RIGHT_PANEL_CONTENT': {
        return {
          ...state,
          isRightPanelOpen: false,
          rightPanelValue: LayoutElements.DEFAULT,
          isOpenSearchOverlay: false,
          isCommentPanelOpen: false,
        };
      }

      case 'SET_IS_IN_FOCUS_MODE': {
        return {
          ...state,
          isInFocusMode: payload,
        };
      }

      default:
        return state;
    }
  };
