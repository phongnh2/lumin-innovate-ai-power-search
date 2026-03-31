// Mock core
jest.mock('core', () => ({
  getTotalPages: jest.fn(),
}));

// Mock helpers
jest.mock('helpers/fireEvent', () => jest.fn());
jest.mock('helpers/isDataElementPanel', () => jest.fn());
jest.mock('helpers/toolSwitchableChecker', () => ({
  ToolSwitchableChecker: {
    isAnnotationLoaded: jest.fn(),
    showWarningMessage: jest.fn(),
  },
}));

jest.mock('constants/dataElement', () => ({
  TOOLS_TRIGGER_LOAD_DOCUMENT: ['signatureTool', 'stampTool'],
}));

jest.mock('constants/zoomFactors', () => ({
  getMinZoomLevel: () => 0.1,
  getMaxZoomLevel: () => 10,
}));

// Suppress console.warn
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});
afterAll(() => {
  console.warn = originalWarn;
});

import * as exposedActions from '../exposedActions';
import core from 'core';
import fireEvent from 'helpers/fireEvent';
import isDataElementPanel from 'helpers/isDataElementPanel';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

const mockGetTotalPages = core.getTotalPages as jest.Mock;
const mockFireEvent = fireEvent as jest.Mock;
const mockIsDataElementPanel = isDataElementPanel as jest.Mock;
const mockToolSwitchableChecker = ToolSwitchableChecker as {
  isAnnotationLoaded: jest.Mock;
  showWarningMessage: jest.Mock;
};

describe('exposedActions', () => {
  let dispatch: jest.Mock;
  let getState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }
      return action;
    });
    getState = jest.fn();
  });

  describe('enableAllElements', () => {
    it('should return ENABLE_ALL_ELEMENTS action', () => {
      const result = exposedActions.enableAllElements();
      expect(result).toEqual({ type: 'ENABLE_ALL_ELEMENTS', payload: {} });
    });
  });

  describe('openElement', () => {
    it('should dispatch OPEN_ELEMENT when element is not disabled and not open', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { testElement: false },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.openElement('testElement')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'OPEN_ELEMENT',
        payload: { dataElement: 'testElement' },
      });
      expect(mockFireEvent).toHaveBeenCalledWith('visibilityChanged', { element: 'testElement', isVisible: true });
    });

    it('should not dispatch when element is disabled', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: { testElement: { disabled: true } },
          openElements: {},
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.openElement('testElement')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch when element is already open', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { testElement: true },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.openElement('testElement')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should show warning for tool not loaded', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { signatureTool: false },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);
      mockToolSwitchableChecker.isAnnotationLoaded.mockReturnValue(false);

      exposedActions.openElement('signatureTool')(dispatch, getState);

      expect(mockToolSwitchableChecker.showWarningMessage).toHaveBeenCalled();
    });

    it('should open left panel when opening a panel element', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { leftPanel: false },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(true);

      exposedActions.openElement('notesPanel')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'OPEN_ELEMENT',
        payload: { dataElement: 'leftPanel' },
      });
    });

    it('should fire event for leftPanel when opening it', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { leftPanel: false },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.openElement('leftPanel')(dispatch, getState);

      expect(mockFireEvent).toHaveBeenCalledWith('visibilityChanged', { element: 'thumbnailsPanel', isVisible: true });
    });
  });

  describe('openElements', () => {
    it('should handle string input', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: {},
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.openElements('testElement')(dispatch);

      expect(dispatch).toHaveBeenCalled();
    });

    it('should handle array input', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: {},
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.openElements(['element1', 'element2'])(dispatch);

      // dispatch is called once per element in the array
      expect(dispatch).toHaveBeenCalled();
    });
  });

  describe('closeElement', () => {
    it('should dispatch CLOSE_ELEMENT', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { testElement: true, leftPanel: false },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.closeElement('testElement')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'CLOSE_ELEMENT',
        payload: { dataElement: 'testElement' },
      });
    });

    it('should not dispatch when element is disabled', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: { testElement: { disabled: true } },
          openElements: { testElement: true },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.closeElement('testElement')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should close leftPanel when closing a panel element', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { leftPanel: true },
          activeLeftPanel: 'notesPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(true);

      exposedActions.closeElement('notesPanel')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'CLOSE_ELEMENT',
        payload: { dataElement: 'leftPanel' },
      });
    });
  });

  describe('closeElements', () => {
    it('should handle string input', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { testElement: true },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.closeElements('testElement')(dispatch);

      expect(dispatch).toHaveBeenCalled();
    });

    it('should handle array input', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { element1: true, element2: true },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.closeElements(['element1', 'element2'])(dispatch);

      // dispatch is called once per element in the array
      expect(dispatch).toHaveBeenCalled();
    });
  });

  describe('toggleElement', () => {
    it('should close element when it is open', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { testElement: true },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.toggleElement('testElement')(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });

    it('should open element when it is closed', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { testElement: false },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.toggleElement('testElement')(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });

    it('should not toggle disabled element', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: { testElement: { disabled: true } },
          openElements: {},
          activeLeftPanel: 'thumbnailsPanel',
        },
      });

      exposedActions.toggleElement('testElement')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('setActiveHeaderGroup', () => {
    it('should return SET_ACTIVE_HEADER_GROUP action', () => {
      const result = exposedActions.setActiveHeaderGroup('toolbar');
      expect(result).toEqual({
        type: 'SET_ACTIVE_HEADER_GROUP',
        payload: { headerGroup: 'toolbar' },
      });
    });
  });

  describe('setActiveLeftPanel', () => {
    it('should dispatch when changing to a different panel', () => {
      getState.mockReturnValue({
        viewer: {
          activeLeftPanel: 'thumbnailsPanel',
          customPanels: [],
        },
      });
      mockIsDataElementPanel.mockReturnValue(true);

      exposedActions.setActiveLeftPanel('notesPanel')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ACTIVE_LEFT_PANEL',
        payload: { dataElement: 'notesPanel' },
      });
    });

    it('should set empty panel', () => {
      getState.mockReturnValue({
        viewer: {
          activeLeftPanel: 'thumbnailsPanel',
          customPanels: [],
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.setActiveLeftPanel('')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ACTIVE_LEFT_PANEL',
        payload: { dataElement: '' },
      });
    });

    it('should not dispatch when panel is same', () => {
      getState.mockReturnValue({
        viewer: {
          activeLeftPanel: 'notesPanel',
          customPanels: [],
        },
      });
      mockIsDataElementPanel.mockReturnValue(true);

      exposedActions.setActiveLeftPanel('notesPanel')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('setSortStrategy', () => {
    it('should return SET_SORT_STRATEGY action', () => {
      const result = exposedActions.setSortStrategy('date');
      expect(result).toEqual({
        type: 'SET_SORT_STRATEGY',
        payload: { sortStrategy: 'date' },
      });
    });
  });

  describe('setSortNotesBy', () => {
    it('should call setSortStrategy (deprecated)', () => {
      const result = exposedActions.setSortNotesBy('date');
      expect(result).toEqual({
        type: 'SET_SORT_STRATEGY',
        payload: { sortStrategy: 'date' },
      });
    });
  });

  describe('Simple action creators', () => {
    it('setShowNotesOption', () => {
      expect(exposedActions.setShowNotesOption('all')).toEqual({
        type: 'SET_SHOW_NOTES_OPTION',
        payload: { showNotesOption: 'all' },
      });
    });

    it('setNoteDateFormat', () => {
      expect(exposedActions.setNoteDateFormat('MM/DD/YYYY')).toEqual({
        type: 'SET_NOTE_DATE_FORMAT',
        payload: { noteDateFormat: 'MM/DD/YYYY' },
      });
    });

    it('setCustomPanel', () => {
      const panel = { dataElement: 'custom' };
      expect(exposedActions.setCustomPanel(panel)).toEqual({
        type: 'SET_CUSTOM_PANEL',
        payload: { newPanel: panel },
      });
    });

    it('setSelectedPageThumbnails', () => {
      expect(exposedActions.setSelectedPageThumbnails([1, 2])).toEqual({
        type: 'SET_SELECTED_THUMBNAIL_PAGE_INDEXES',
        payload: { selectedThumbnailPageIndexes: [1, 2] },
      });
    });

    it('setSelectedPageThumbnails default', () => {
      expect(exposedActions.setSelectedPageThumbnails()).toEqual({
        type: 'SET_SELECTED_THUMBNAIL_PAGE_INDEXES',
        payload: { selectedThumbnailPageIndexes: [] },
      });
    });

    it('setSwipeOrientation', () => {
      expect(exposedActions.setSwipeOrientation('horizontal')).toEqual({
        type: 'SET_SWIPE_ORIENTATION',
        payload: { swipeOrientation: 'horizontal' },
      });
    });

    it('setCustomNoteFilter', () => {
      const fn = () => true;
      expect(exposedActions.setCustomNoteFilter(fn)).toEqual({
        type: 'SET_CUSTOM_NOTE_FILTER',
        payload: { customNoteFilter: fn },
      });
    });

    it('useEmbeddedPrint default', () => {
      expect(exposedActions.useEmbeddedPrint()).toEqual({
        type: 'USE_EMBEDDED_PRINT',
        payload: { useEmbeddedPrint: true },
      });
    });

    it('setMaxSignaturesCount', () => {
      expect(exposedActions.setMaxSignaturesCount(5)).toEqual({
        type: 'SET_MAX_SIGNATURES_COUNT',
        payload: { maxSignaturesCount: 5 },
      });
    });

    it('setIsSavingSignature', () => {
      expect(exposedActions.setIsSavingSignature(true)).toEqual({
        type: 'SET_IS_SAVING_SIGNATURE',
        payload: { isSavingSignature: true },
      });
    });

    it('setUserData', () => {
      const userData = { name: 'Test' };
      expect(exposedActions.setUserData(userData)).toEqual({
        type: 'SET_USER_DATA',
        payload: { userData },
      });
    });

    it('setSearchResults', () => {
      const results = [{ id: 1 }];
      expect(exposedActions.setSearchResults(results)).toEqual({
        type: 'SET_SEARCH_RESULTS',
        payload: results,
      });
    });

    it('setActiveResult', () => {
      expect(exposedActions.setActiveResult({ id: 1 })).toEqual({
        type: 'SET_ACTIVE_RESULT',
        payload: { activeResult: { id: 1 } },
      });
    });

    it('setActiveResultIndex', () => {
      expect(exposedActions.setActiveResultIndex(5)).toEqual({
        type: 'SET_ACTIVE_RESULT_INDEX',
        payload: { index: 5 },
      });
    });

    it('setAnnotationsLoaded', () => {
      expect(exposedActions.setAnnotationsLoaded(true)).toEqual({
        type: 'SET_ANNOTATIONS_LOADED',
        payload: { annotationsLoaded: true },
      });
    });

    it('setDocumentNotFound', () => {
      expect(exposedActions.setDocumentNotFound()).toEqual({
        type: 'SET_DOCUMENT_NOT_FOUND',
      });
    });

    it('resetDocumentNotFound', () => {
      expect(exposedActions.resetDocumentNotFound()).toEqual({
        type: 'RESET_DOCUMENT_NOT_FOUND',
      });
    });

    it('setAutoSyncStatus', () => {
      expect(exposedActions.setAutoSyncStatus('syncing')).toEqual({
        type: 'SET_AUTO_SYNC_STATUS',
        payload: { autoSyncStatus: 'syncing' },
      });
    });

    it('setIsLoadingDocument', () => {
      expect(exposedActions.setIsLoadingDocument(true)).toEqual({
        type: 'SET_IS_LOADING_DOCUMENT',
        payload: { isLoadingDocument: true },
      });
    });

    it('setIsDocumentLoaded', () => {
      expect(exposedActions.setIsDocumentLoaded(true)).toEqual({
        type: 'SET_IS_DOCUMENT_LOADED',
        payload: { isDocumentLoaded: true },
      });
    });

    it('setDownloadType', () => {
      expect(exposedActions.setDownloadType('pdf')).toEqual({
        type: 'SET_DOWNLOAD_TYPE',
        payload: { downloadType: 'pdf' },
      });
    });

    it('setIsDocumentReady', () => {
      expect(exposedActions.setIsDocumentReady(true)).toEqual({
        type: 'SET_IS_DOCUMENT_READY',
        payload: { isDocumentReady: true },
      });
    });

    it('setIsSummarizing', () => {
      expect(exposedActions.setIsSummarizing(true)).toEqual({
        type: 'SET_IS_SUMMARIZING',
        payload: { isSummarizing: true },
      });
    });
  });

  describe('setPageLabels', () => {
    it('should dispatch when page count matches', () => {
      mockGetTotalPages.mockReturnValue(3);

      exposedActions.setPageLabels(['1', '2', '3'])(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_PAGE_LABELS',
        payload: { pageLabels: ['1', '2', '3'] },
      });
    });

    it('should not dispatch when page count does not match', () => {
      mockGetTotalPages.mockReturnValue(5);

      exposedActions.setPageLabels(['1', '2', '3'])(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('showWarningMessage', () => {
    it('should dispatch SET_WARNING_MESSAGE and open warningModal', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { warningModal: false },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      const options = { title: 'Warning' };
      exposedActions.showWarningMessage(options)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_WARNING_MESSAGE',
        payload: options,
      });
    });
  });

  describe('showErrorMessage', () => {
    it('should dispatch SET_ERROR_MESSAGE and open errorModal', () => {
      getState.mockReturnValue({
        viewer: {
          disabledElements: {},
          openElements: { errorModal: false },
          activeLeftPanel: 'thumbnailsPanel',
        },
      });
      mockIsDataElementPanel.mockReturnValue(false);

      exposedActions.showErrorMessage('An error occurred')(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ERROR_MESSAGE',
        payload: { message: 'An error occurred' },
      });
    });
  });

  describe('setZoomList', () => {
    it('should dispatch filtered zoom list', () => {
      exposedActions.setZoomList([0.5, 1, 2])(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ZOOM_LIST',
        payload: { zoomList: [0.5, 1, 2] },
      });
    });

    it('should filter out of range zooms', () => {
      exposedActions.setZoomList([0.05, 0.5, 1, 15])(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ZOOM_LIST',
        payload: { zoomList: [0.5, 1] },
      });
    });
  });
});

