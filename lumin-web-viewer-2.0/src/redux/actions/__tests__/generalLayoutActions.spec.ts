jest.mock('@new-ui/components/LuminLeftPanel/constants', () => ({
  LEFT_PANEL_VALUES: {
    THUMBNAILS: 'thumbnails',
    OUTLINES: 'outlines',
  },
  TOOL_PROPERTIES_VALUE: {
    SIGNATURE: 'signature',
    TEXT: 'text',
  },
}));

jest.mock('@new-ui/components/LuminLeftSideBar/constants', () => ({
  LEFT_SIDE_BAR_VALUES: {
    ANNOTATE: 'annotate',
    EDIT: 'edit',
  },
}));

jest.mock('@new-ui/constants', () => ({
  LayoutElements: {
    COMMENT_PANEL: 'commentPanel',
    SHARE_PANEL: 'sharePanel',
  },
}));

jest.mock('constants/documentConstants', () => ({
  COMMENT_PANEL_LAYOUT_STATE: {
    ON_DOCUMENT: 'ON_DOCUMENT',
    DETACHED: 'DETACHED',
  },
}));

import * as generalLayoutActions from '../generalLayoutActions';

describe('generalLayoutActions', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  describe('setIsRightPanelOpen', () => {
    it('should dispatch SET_IS_GENERAL_LAYOUT_RIGHT_PANEL_OPEN with true', () => {
      generalLayoutActions.setIsRightPanelOpen(true)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_IS_GENERAL_LAYOUT_RIGHT_PANEL_OPEN',
        payload: true,
      });
    });

    it('should dispatch SET_IS_GENERAL_LAYOUT_RIGHT_PANEL_OPEN with false', () => {
      generalLayoutActions.setIsRightPanelOpen(false)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_IS_GENERAL_LAYOUT_RIGHT_PANEL_OPEN',
        payload: false,
      });
    });
  });

  describe('setToolPropertiesState', () => {
    it('should dispatch SET_TOOL_PROPERTIES_STATE', () => {
      generalLayoutActions.setToolPropertiesState({ isOpen: true, value: 'signature' as any })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TOOL_PROPERTIES_STATE',
        payload: { isOpen: true, value: 'signature' },
      });
    });

    it('should dispatch with closed state', () => {
      generalLayoutActions.setToolPropertiesState({ isOpen: false, value: 'text' as any })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TOOL_PROPERTIES_STATE',
        payload: { isOpen: false, value: 'text' },
      });
    });
  });

  describe('setIsToolPropertiesOpen', () => {
    it('should dispatch SET_IS_GENERAL_LAYOUT_TOOL_PROPERTIES_OPEN', () => {
      generalLayoutActions.setIsToolPropertiesOpen(true)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_IS_GENERAL_LAYOUT_TOOL_PROPERTIES_OPEN',
        payload: true,
      });
    });
  });

  describe('setToolPropertiesValue', () => {
    it('should dispatch SET_GENERAL_LAYOUT_TOOL_PROPERTIES_VALUE', () => {
      generalLayoutActions.setToolPropertiesValue('signature' as any)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_GENERAL_LAYOUT_TOOL_PROPERTIES_VALUE',
        payload: 'signature',
      });
    });
  });

  describe('setIsLeftPanelOpen', () => {
    it('should dispatch SET_IS_GENERAL_LAYOUT_LEFT_PANEL_OPEN', () => {
      generalLayoutActions.setIsLeftPanelOpen(true)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_IS_GENERAL_LAYOUT_LEFT_PANEL_OPEN',
        payload: true,
      });
    });
  });

  describe('setToolbarValue', () => {
    it('should dispatch SET_GENERAL_TOOLBAR_VALUE', () => {
      generalLayoutActions.setToolbarValue('annotate' as any)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_GENERAL_TOOLBAR_VALUE',
        payload: 'annotate',
      });
    });
  });

  describe('setLeftPanelValue', () => {
    it('should dispatch SET_LEFT_PANEL_VALUE', () => {
      generalLayoutActions.setLeftPanelValue('thumbnails' as any)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_LEFT_PANEL_VALUE',
        payload: 'thumbnails',
      });
    });
  });

  describe('openOutlinePanel', () => {
    it('should dispatch OPEN_OUTLINE_PANEL', () => {
      generalLayoutActions.openOutlinePanel()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'OPEN_OUTLINE_PANEL',
      });
    });
  });

  describe('setRightPanelValue', () => {
    it('should dispatch SET_RIGHT_PANEL_VALUE', () => {
      generalLayoutActions.setRightPanelValue('commentPanel' as any)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_RIGHT_PANEL_VALUE',
        payload: 'commentPanel',
      });
    });
  });

  describe('setSearchOverlayValue', () => {
    it('should dispatch SET_SEARCH_OVERLAY_VALUE with true', () => {
      generalLayoutActions.setSearchOverlayValue(true)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SEARCH_OVERLAY_VALUE',
        payload: true,
      });
    });

    it('should dispatch SET_SEARCH_OVERLAY_VALUE with false', () => {
      generalLayoutActions.setSearchOverlayValue(false)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SEARCH_OVERLAY_VALUE',
        payload: false,
      });
    });
  });

  describe('setDisplayCommentPanel', () => {
    it('should dispatch SET_IS_COMMENT_PANEL_OPEN', () => {
      generalLayoutActions.setDisplayCommentPanel(true)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_IS_COMMENT_PANEL_OPEN',
        payload: true,
      });
    });
  });

  describe('resetGeneralLayout', () => {
    it('should dispatch RESET_GENERAL_LAYOUT', () => {
      generalLayoutActions.resetGeneralLayout()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'RESET_GENERAL_LAYOUT',
      });
    });
  });

  describe('closeLuminRightPanel', () => {
    it('should dispatch CLOSE_RIGHT_PANEL_CONTENT and SET_COMMENT_PANEL_LAYOUT_STATE', () => {
      generalLayoutActions.closeLuminRightPanel()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'CLOSE_RIGHT_PANEL_CONTENT',
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_COMMENT_PANEL_LAYOUT_STATE',
        payload: { state: 'ON_DOCUMENT' },
      });
    });
  });

  describe('setIsInFocusMode', () => {
    it('should return SET_IS_IN_FOCUS_MODE action with true', () => {
      const result = generalLayoutActions.setIsInFocusMode(true);

      expect(result).toEqual({
        type: 'SET_IS_IN_FOCUS_MODE',
        payload: true,
      });
    });

    it('should return SET_IS_IN_FOCUS_MODE action with false', () => {
      const result = generalLayoutActions.setIsInFocusMode(false);

      expect(result).toEqual({
        type: 'SET_IS_IN_FOCUS_MODE',
        payload: false,
      });
    });
  });
});

