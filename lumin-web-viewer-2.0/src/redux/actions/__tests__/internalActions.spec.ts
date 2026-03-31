// Mock dependencies
jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getDisabledElementPriority: jest.fn(),
    getActiveToolGroup: jest.fn(),
    getActiveHeaderItems: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('helpers/device', () => ({
  isIOS: false,
  isAndroid: false,
}));

jest.mock('helpers/getFilteredDataElements', () => jest.fn());

jest.mock('constants/banner', () => ({
  AnimationBanner: {
    SHOW: 'show',
    HIDE: 'hide',
  },
}));

jest.mock('constants/localStorageKey', () => ({
  LocalStorageKey: {
    SHOWED_RATING_APP: 'showedRatingApp',
  },
}));

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockLocalStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockLocalStorage[key];
    },
  },
  writable: true,
});

import * as internalActions from '../internalActions';
import selectors from 'selectors';
import getFilteredDataElements from 'helpers/getFilteredDataElements';

const mockGetDisabledElementPriority = selectors.getDisabledElementPriority as jest.Mock;
const mockGetFilteredDataElements = getFilteredDataElements as jest.Mock;
const mockGetActiveToolGroup = selectors.getActiveToolGroup as jest.Mock;
const mockGetActiveHeaderItems = selectors.getActiveHeaderItems as jest.Mock;
const mockGetCurrentUser = selectors.getCurrentUser as jest.Mock;

describe('internalActions', () => {
  let dispatch: jest.Mock;
  let getState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
    dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }
      return action;
    });
    getState = jest.fn();
  });

  describe('resetViewer', () => {
    it('should return RESET_VIEWER action', () => {
      const result = internalActions.resetViewer();
      expect(result).toEqual({ type: 'RESET_VIEWER' });
    });
  });

  describe('disableElement', () => {
    it('should dispatch DISABLE_ELEMENT', () => {
      mockGetDisabledElementPriority.mockReturnValue(null);

      internalActions.disableElement('testElement', 1)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'DISABLE_ELEMENT',
        payload: { dataElement: 'testElement', priority: 1 },
      });
    });

    it('should disable leftPanel and button together', () => {
      mockGetFilteredDataElements.mockReturnValue(['leftPanel', 'leftPanelButton']);

      internalActions.disableElement('leftPanel', 1)(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });

    it('should disable stylePopup as both toolStylePopup and annotationStylePopup', () => {
      mockGetFilteredDataElements.mockReturnValue(['toolStylePopup', 'annotationStylePopup']);

      internalActions.disableElement('stylePopup', 1)(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });

    it('should not dispatch when current priority is higher', () => {
      mockGetDisabledElementPriority.mockReturnValue(5);

      internalActions.disableElement('testElement', 1)(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('disableElements', () => {
    it('should dispatch DISABLE_ELEMENTS', () => {
      mockGetFilteredDataElements.mockReturnValue(['element1', 'element2']);

      internalActions.disableElements(['element1', 'element2'], 1)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'DISABLE_ELEMENTS',
        payload: { dataElements: ['element1', 'element2'], priority: 1 },
      });
    });
  });

  describe('enableElement', () => {
    it('should dispatch ENABLE_ELEMENT', () => {
      mockGetDisabledElementPriority.mockReturnValue(null);

      internalActions.enableElement('testElement', 1)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'ENABLE_ELEMENT',
        payload: { dataElement: 'testElement', priority: 1 },
      });
    });

    it('should enable leftPanel and button together', () => {
      mockGetFilteredDataElements.mockReturnValue(['leftPanel', 'leftPanelButton']);

      internalActions.enableElement('leftPanel', 1)(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });

    it('should enable stylePopup as both toolStylePopup and annotationStylePopup', () => {
      mockGetFilteredDataElements.mockReturnValue(['toolStylePopup', 'annotationStylePopup']);

      internalActions.enableElement('stylePopup', 1)(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });
  });

  describe('enableElements', () => {
    it('should dispatch ENABLE_ELEMENTS', () => {
      mockGetFilteredDataElements.mockReturnValue(['element1', 'element2']);

      internalActions.enableElements(['element1', 'element2'], 1)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'ENABLE_ELEMENTS',
        payload: { dataElements: ['element1', 'element2'], priority: 1 },
      });
    });
  });

  describe('setThumbnailMerging', () => {
    it('should return SET_THUMBNAIL_MERGING action with default true', () => {
      const result = internalActions.setThumbnailMerging();
      expect(result).toEqual({
        type: 'SET_THUMBNAIL_MERGING',
        payload: { useThumbnailMerging: true },
      });
    });

    it('should return SET_THUMBNAIL_MERGING action with false', () => {
      const result = internalActions.setThumbnailMerging(false);
      expect(result).toEqual({
        type: 'SET_THUMBNAIL_MERGING',
        payload: { useThumbnailMerging: false },
      });
    });
  });

  describe('setThumbnailReordering', () => {
    it('should return SET_THUMBNAIL_REORDERING action', () => {
      expect(internalActions.setThumbnailReordering()).toEqual({
        type: 'SET_THUMBNAIL_REORDERING',
        payload: { useThumbnailReordering: true },
      });
    });
  });

  describe('setThumbnailMultiselect', () => {
    it('should return SET_THUMBNAIL_MULTISELECT action', () => {
      expect(internalActions.setThumbnailMultiselect()).toEqual({
        type: 'SET_THUMBNAIL_MULTISELECT',
        payload: { useThumbnailMultiselect: true },
      });
    });
  });

  describe('setIsMultipleViewerMerging', () => {
    it('should return SET_MULTI_VIEWER_MERGING action', () => {
      expect(internalActions.setIsMultipleViewerMerging(true)).toEqual({
        type: 'SET_MULTI_VIEWER_MERGING',
        payload: { isMultipleViewerMerging: true },
      });
    });

    it('should default to false', () => {
      expect(internalActions.setIsMultipleViewerMerging()).toEqual({
        type: 'SET_MULTI_VIEWER_MERGING',
        payload: { isMultipleViewerMerging: false },
      });
    });
  });

  describe('setAllowPageNavigation', () => {
    it('should return SET_ALLOW_PAGE_NAVIGATION action', () => {
      expect(internalActions.setAllowPageNavigation(false)).toEqual({
        type: 'SET_ALLOW_PAGE_NAVIGATION',
        payload: { allowPageNavigation: false },
      });
    });

    it('should default to true', () => {
      expect(internalActions.setAllowPageNavigation()).toEqual({
        type: 'SET_ALLOW_PAGE_NAVIGATION',
        payload: { allowPageNavigation: true },
      });
    });
  });

  describe('setActiveToolNameAndStyle', () => {
    it('should dispatch SET_ACTIVE_TOOL_NAME_AND_STYLES', () => {
      getState.mockReturnValue({
        viewer: { activeToolName: 'OldTool' },
      });

      internalActions.setActiveToolNameAndStyle({ name: 'NewTool', defaults: { color: 'red' } })(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ACTIVE_TOOL_NAME_AND_STYLES',
        payload: { toolName: 'NewTool', toolStyles: { color: 'red' } },
      });
    });

    it('should convert TextSelect to AnnotationEdit', () => {
      getState.mockReturnValue({
        viewer: { activeToolName: 'OldTool' },
      });

      internalActions.setActiveToolNameAndStyle({ name: 'TextSelect' })(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ACTIVE_TOOL_NAME_AND_STYLES',
        payload: { toolName: 'AnnotationEdit', toolStyles: {} },
      });
    });

    it('should not dispatch when tool name is same', () => {
      getState.mockReturnValue({
        viewer: { activeToolName: 'AnnotationEdit' },
      });

      internalActions.setActiveToolNameAndStyle({ name: 'TextSelect' })(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('setActiveToolStyles', () => {
    it('should return SET_ACTIVE_TOOL_STYLES action', () => {
      expect(internalActions.setActiveToolStyles({ color: 'blue' })).toEqual({
        type: 'SET_ACTIVE_TOOL_STYLES',
        payload: { toolStyles: { color: 'blue' } },
      });
    });

    it('should default to empty object', () => {
      expect(internalActions.setActiveToolStyles()).toEqual({
        type: 'SET_ACTIVE_TOOL_STYLES',
        payload: { toolStyles: {} },
      });
    });
  });

  describe('setActiveToolGroup', () => {
    it('should dispatch SET_ACTIVE_TOOL_GROUP', () => {
      mockGetActiveToolGroup.mockReturnValue('oldGroup');

      internalActions.setActiveToolGroup('newGroup')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ACTIVE_TOOL_GROUP',
        payload: { toolGroup: 'newGroup' },
      });
    });

    it('should not dispatch when tool group is same', () => {
      mockGetActiveToolGroup.mockReturnValue('sameGroup');

      internalActions.setActiveToolGroup('sameGroup')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('Simple action creators', () => {
    it('setNotePopupId', () => {
      expect(internalActions.setNotePopupId('note-123')).toEqual({
        type: 'SET_NOTE_POPUP_ID',
        payload: { id: 'note-123' },
      });
    });

    it('triggerNoteEditing', () => {
      expect(internalActions.triggerNoteEditing()).toEqual({
        type: 'SET_NOTE_EDITING',
        payload: { isNoteEditing: true },
      });
    });

    it('finishNoteEditing', () => {
      expect(internalActions.finishNoteEditing()).toEqual({
        type: 'SET_NOTE_EDITING',
        payload: { isNoteEditing: false },
      });
    });

    it('setNoteEditingAnnotationId', () => {
      expect(internalActions.setNoteEditingAnnotationId('anno-123')).toEqual({
        type: 'SET_NOTE_EDITING_ANNOTATION_ID',
        payload: { noteEditingAnnotationId: 'anno-123' },
      });
    });

    it('setFitMode', () => {
      expect(internalActions.setFitMode('fitWidth')).toEqual({
        type: 'SET_FIT_MODE',
        payload: { fitMode: 'fitWidth' },
      });
    });

    it('setZoom', () => {
      expect(internalActions.setZoom(1.5)).toEqual({
        type: 'SET_ZOOM',
        payload: { zoom: 1.5 },
      });
    });

    it('setRotation', () => {
      expect(internalActions.setRotation(90)).toEqual({
        type: 'SET_ROTATION',
        payload: { rotation: 90 },
      });
    });

    it('setDisplayMode', () => {
      expect(internalActions.setDisplayMode('single')).toEqual({
        type: 'SET_DISPLAY_MODE',
        payload: { displayMode: 'single' },
      });
    });

    it('setCurrentPage', () => {
      expect(internalActions.setCurrentPage(5)).toEqual({
        type: 'SET_CURRENT_PAGE',
        payload: { currentPage: 5 },
      });
    });

    it('setFullScreen', () => {
      expect(internalActions.setFullScreen(true)).toEqual({
        type: 'SET_FULL_SCREEN',
        payload: { isFullScreen: true },
      });
    });

    it('enterPresenterMode', () => {
      const restoreState = { zoom: 1 };
      expect(internalActions.enterPresenterMode(restoreState)).toEqual({
        type: 'ENTER_PRESENTER_MODE',
        payload: { restoreState: { zoom: 1 } },
      });
    });

    it('exitPresenterMode', () => {
      expect(internalActions.exitPresenterMode()).toEqual({
        type: 'EXIT_PRESENTER_MODE',
        payload: {},
      });
    });

    it('setReadOnly', () => {
      expect(internalActions.setReadOnly(true)).toEqual({
        type: 'SET_READ_ONLY',
        payload: { isReadOnly: true },
      });
    });

    it('registerTool', () => {
      const tool = { name: 'custom', icon: 'icon.svg' };
      expect(internalActions.registerTool(tool)).toEqual({
        type: 'REGISTER_TOOL',
        payload: { name: 'custom', icon: 'icon.svg' },
      });
    });

    it('unregisterTool', () => {
      expect(internalActions.unregisterTool('custom')).toEqual({
        type: 'UNREGISTER_TOOL',
        payload: { toolName: 'custom' },
      });
    });

    it('setPopupItems', () => {
      const items = [{ name: 'item1' }];
      expect(internalActions.setPopupItems('popup', items)).toEqual({
        type: 'SET_POPUP_ITEMS',
        payload: { dataElement: 'popup', items },
      });
    });

    it('setColorPalette', () => {
      expect(internalActions.setColorPalette('freeHand', ['red', 'blue'])).toEqual({
        type: 'SET_COLOR_PALETTE',
        payload: { colorMapKey: 'freeHand', colorPalette: ['red', 'blue'] },
      });
    });

    it('setActivePalette', () => {
      expect(internalActions.setActivePalette('freeHand', 'primary')).toEqual({
        type: 'SET_ACTIVE_PALETTE',
        payload: { colorMapKey: 'freeHand', colorPalette: 'primary' },
      });
    });

    it('setIconColor', () => {
      expect(internalActions.setIconColor('freeHand', 'red')).toEqual({
        type: 'SET_ICON_COLOR',
        payload: { colorMapKey: 'freeHand', color: 'red' },
      });
    });

    it('setColorMap', () => {
      const colorMap = { freeHand: ['red'] };
      expect(internalActions.setColorMap(colorMap)).toEqual({
        type: 'SET_COLOR_MAP',
        payload: { colorMap },
      });
    });

    it('setLeftPanelWidth', () => {
      expect(internalActions.setLeftPanelWidth(300)).toEqual({
        type: 'SET_LEFT_PANEL_WIDTH',
        payload: { width: 300 },
      });
    });

    it('disableReplyForAnnotations', () => {
      const fn = () => false;
      expect(internalActions.disableReplyForAnnotations(fn)).toEqual({
        type: 'SET_REPLY_DISABLED_FUNC',
        payload: { func: fn },
      });
    });

    it('setMouseWheelZoom default', () => {
      expect(internalActions.setMouseWheelZoom()).toEqual({
        type: 'SET_MOUSE_WHEEL_ZOOM',
        payload: { enableMouseWheelZoom: true },
      });
    });

    it('setTotalPages', () => {
      expect(internalActions.setTotalPages(100)).toEqual({
        type: 'SET_TOTAL_PAGES',
        payload: { totalPages: 100 },
      });
    });

    it('setOutlines', () => {
      const outlines = [{ title: 'Chapter 1' }];
      expect(internalActions.setOutlines(outlines)).toEqual({
        type: 'SET_OUTLINES',
        payload: { outlines },
      });
    });

    it('setBookmarks', () => {
      const bookmarks = [{ page: 1 }];
      expect(internalActions.setBookmarks(bookmarks)).toEqual({
        type: 'SET_BOOKMARKS',
        payload: { bookmarks },
      });
    });

    it('setPasswordAttempts', () => {
      expect(internalActions.setPasswordAttempts(3)).toEqual({
        type: 'SET_PASSWORD_ATTEMPTS',
        payload: { attempt: 3 },
      });
    });

    it('setPasswordMessage', () => {
      expect(internalActions.setPasswordMessage('Wrong password')).toEqual({
        type: 'SET_PASSWORD_MESSAGE',
        payload: { message: 'Wrong password' },
      });
    });

    it('setPasswordModalSource', () => {
      expect(internalActions.setPasswordModalSource('open')).toEqual({
        type: 'SET_PASSWORD_MODAL_SOURCE',
        payload: { source: 'open' },
      });
    });

    it('setPasswordProtectedDocumentName', () => {
      expect(internalActions.setPasswordProtectedDocumentName('secret.pdf')).toEqual({
        type: 'SET_PASSWORD_PROTECTED_DOCUMENT_NAME',
        payload: { name: 'secret.pdf' },
      });
    });

    it('setPrintQuality', () => {
      expect(internalActions.setPrintQuality(2)).toEqual({
        type: 'SET_PRINT_QUALITY',
        payload: { quality: 2 },
      });
    });

    it('setLoadingProgress', () => {
      expect(internalActions.setLoadingProgress(50)).toEqual({
        type: 'SET_LOADING_PROGRESS',
        payload: { progress: 50 },
      });
    });

    it('resetLoadingProgress', () => {
      expect(internalActions.resetLoadingProgress()).toEqual({
        type: 'SET_LOADING_PROGRESS',
        payload: { progress: 0 },
      });
    });

    it('resetDocument', () => {
      expect(internalActions.resetDocument()).toEqual({
        type: 'RESET_DOCUMENT',
      });
    });

    it('setUserName', () => {
      expect(internalActions.setUserName('John')).toEqual({
        type: 'SET_USER_NAME',
        payload: { userName: 'John' },
      });
    });

    it('setAdminUser', () => {
      expect(internalActions.setAdminUser(true)).toEqual({
        type: 'SET_ADMIN_USER',
        payload: { isAdminUser: true },
      });
    });

    it('searchText', () => {
      expect(internalActions.searchText('query', { caseSensitive: true })).toEqual({
        type: 'SEARCH_TEXT',
        payload: { searchValue: 'query', options: { caseSensitive: true } },
      });
    });

    it('searchTextFull', () => {
      expect(internalActions.searchTextFull('query', {})).toEqual({
        type: 'SEARCH_TEXT_FULL',
        payload: { searchValue: 'query', options: {} },
      });
    });

    it('addSearchListener', () => {
      const fn = () => {};
      expect(internalActions.addSearchListener(fn)).toEqual({
        type: 'ADD_SEARCH_LISTENER',
        payload: { func: fn },
      });
    });

    it('removeSearchListener', () => {
      const fn = () => {};
      expect(internalActions.removeSearchListener(fn)).toEqual({
        type: 'REMOVE_SEARCH_LISTENER',
        payload: { func: fn },
      });
    });

    it('setSearchValue', () => {
      expect(internalActions.setSearchValue('test')).toEqual({
        type: 'SET_SEARCH_VALUE',
        payload: { value: 'test' },
      });
    });

    it('addResult', () => {
      const result = { page: 1 };
      expect(internalActions.addResult(result)).toEqual({
        type: 'ADD_RESULT',
        payload: { result },
      });
    });

    it('addResults', () => {
      const results = [{ page: 1 }];
      expect(internalActions.addResults(results)).toEqual({
        type: 'ADD_RESULTS',
        payload: { results },
      });
    });

    it('setCaseSensitive', () => {
      expect(internalActions.setCaseSensitive(true)).toEqual({
        type: 'SET_CASE_SENSITIVE',
        payload: { isCaseSensitive: true },
      });
    });

    it('setWholeWord', () => {
      expect(internalActions.setWholeWord(true)).toEqual({
        type: 'SET_WHOLE_WORD',
        payload: { isWholeWord: true },
      });
    });

    it('setWildcard', () => {
      expect(internalActions.setWildcard(true)).toEqual({
        type: 'SET_WILD_CARD',
        payload: { isWildcard: true },
      });
    });

    it('setIsSearching', () => {
      expect(internalActions.setIsSearching(true)).toEqual({
        type: 'SET_IS_SEARCHING',
        payload: { isSearching: true },
      });
    });

    it('setNoResult', () => {
      expect(internalActions.setNoResult(true)).toEqual({
        type: 'SET_NO_RESULT',
        payload: { noResult: true },
      });
    });

    it('setSearchError', () => {
      expect(internalActions.setSearchError('Error')).toEqual({
        type: 'SET_SEARCH_ERROR',
        payload: { errorMessage: 'Error' },
      });
    });

    it('resetSearch', () => {
      expect(internalActions.resetSearch()).toEqual({
        type: 'RESET_SEARCH',
        payload: {},
      });
    });

    it('setIsProgrammaticSearch', () => {
      expect(internalActions.setIsProgrammaticSearch(true)).toEqual({
        type: 'SET_IS_PROG_SEARCH',
        payload: { isProgrammaticSearch: true },
      });
    });

    it('setIsProgrammaticSearchFull', () => {
      expect(internalActions.setIsProgrammaticSearchFull(true)).toEqual({
        type: 'SET_IS_PROG_SEARCH_FULL',
        payload: { isProgrammaticSearchFull: true },
      });
    });

    it('setNoteTransformFunction', () => {
      const fn = () => {};
      expect(internalActions.setNoteTransformFunction(fn)).toEqual({
        type: 'SET_NOTE_TRANSFORM_FUNCTION',
        payload: { noteTransformFunction: fn },
      });
    });

    it('setUsingRichtext', () => {
      expect(internalActions.setUsingRichtext()).toEqual({
        type: 'SET_IS_USING_RICHTEXT',
        payload: { isUsingRichText: true },
      });
    });

    it('setUnusedRichtext', () => {
      expect(internalActions.setUnusedRichtext()).toEqual({
        type: 'SET_IS_USING_RICHTEXT',
        payload: { isUsingRichText: false },
      });
    });

    it('setEditPdfVersion', () => {
      expect(internalActions.setEditPdfVersion('v2')).toEqual({
        type: 'SET_EDIT_PDF_VERSION',
        payload: { editPdfVersion: 'v2' },
      });
    });
  });

  describe('setDeactiveHeaderItem', () => {
    it('should filter out items and dispatch', () => {
      mockGetActiveHeaderItems.mockReturnValue(['item1', 'item2', 'item3']);
      getState.mockReturnValue({
        viewer: { activeHeaderGroup: 'default' },
      });

      internalActions.setDeactiveHeaderItem(['item1'])(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_HEADER_ITEMS',
        payload: {
          header: 'default',
          headerItems: ['item2', 'item3'],
        },
      });
    });
  });

  describe('setShouldShowRating', () => {
    it('should dispatch HIDE when passed HIDE', () => {
      internalActions.setShouldShowRating('hide')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SHOULD_SHOW_RATING',
        payload: { shouldShowRating: 'hide' },
      });
    });

    it('should dispatch SHOW when user has not rated and not shown before', () => {
      mockGetCurrentUser.mockReturnValue({ metadata: { ratedApp: false } });

      internalActions.setShouldShowRating('show')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SHOULD_SHOW_RATING',
        payload: { shouldShowRating: 'show' },
      });
    });

    it('should not dispatch when user has already rated', () => {
      mockGetCurrentUser.mockReturnValue({ metadata: { ratedApp: true } });

      internalActions.setShouldShowRating('show')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch when already shown rating', () => {
      mockLocalStorage['showedRatingApp'] = 'true';
      mockGetCurrentUser.mockReturnValue({ metadata: { ratedApp: false } });

      internalActions.setShouldShowRating('show')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});

