import { act, renderHook } from '@testing-library/react';
import { produce } from 'immer';

import useFindDocumentLocation from '../useFindDocumentLocation';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('actions', () => ({
  setFoundDocumentScrolling: jest.fn(),
  setHighlightFoundDocument: jest.fn(),
  findDocumentByName: jest.fn(),
}));

jest.mock('helpers/logger', () => ({
  logInfo: jest.fn(),
}));

jest.mock('immer');

import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import actions from 'actions';
import logger from 'helpers/logger';

describe('useFindDocumentLocation', () => {
  let mockDispatch;
  let mockNavigate;
  let mockUseLocation;
  let mockFetchMore;
  let mockSetDocumentListInFolder;
  let mockVirtuosoRef;

  const createDefaultProps = (overrides = {}) => ({
    folders: [],
    documents: [],
    fetchMore: mockFetchMore,
    isHasMore: false,
    currentFolderType: 'all',
    isDocumentInFolder: false,
    setDocumentListInFolder: mockSetDocumentListInFolder,
    virtuosoRef: mockVirtuosoRef,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockDispatch = jest.fn();
    mockNavigate = jest.fn();
    mockFetchMore = jest.fn();
    mockSetDocumentListInFolder = jest.fn();
    mockVirtuosoRef = {
      current: {
        scrollToIndex: jest.fn(),
      },
    };

    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    mockUseLocation = {
      state: null,
      pathname: '/documents',
    };
    useLocation.mockReturnValue(mockUseLocation);

    produce.mockImplementation((state, updater) => {
      const draft = JSON.parse(JSON.stringify(state));
      updater(draft);
      return draft;
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should set findDocumentLoading to false when no documentId', () => {
      const props = createDefaultProps();
      const { result } = renderHook(() => useFindDocumentLocation(props));

      expect(result.current.findDocumentLoading).toBe(false);
    });

    it('should set findDocumentLoading to false when no documentName', () => {
      mockUseLocation.state = { documentId: 'doc-123' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps();
      const { result } = renderHook(() => useFindDocumentLocation(props));

      expect(result.current.findDocumentLoading).toBe(false);
    });

    it('should keep findDocumentLoading true when both documentId and documentName exist', () => {
      mockUseLocation.state = { documentId: 'doc-123', documentName: 'test.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps();
      const { result } = renderHook(() => useFindDocumentLocation(props));

      expect(result.current.findDocumentLoading).toBe(true);
    });
  });

  describe('clear location state', () => {
    it('should clear documentId from location state after finding document', () => {
      mockUseLocation.state = { documentId: 'doc-123', documentName: 'test.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [{ _id: 'doc-123', name: 'test.pdf' }],
      });

      renderHook(() => useFindDocumentLocation(props));

      act(() => {
        jest.runAllTimers();
      });

      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('findDocument', () => {
    it('should not run findDocument when no documents', () => {
      mockUseLocation.state = { documentId: 'doc-123', documentName: 'test.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps();
      renderHook(() => useFindDocumentLocation(props));

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should find document and highlight it when document exists', () => {
      mockUseLocation.state = { documentId: 'doc-123', documentName: 'test.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [{ _id: 'doc-123', name: 'test.pdf' }],
        folders: [],
      });

      renderHook(() => useFindDocumentLocation(props));

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.setFoundDocumentScrolling({ folderType: 'all', loading: true })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        actions.setHighlightFoundDocument({ documentId: 'doc-123', highlight: true })
      );
      expect(logger.logInfo).toHaveBeenCalledWith({
        reason: 'FIND_DOCUMENT_LOCATION',
        attributes: {
          attemps: 1,
          isFound: true,
        },
      });
    });

    it('should highlight document in folder when isDocumentInFolder is true', () => {
      mockUseLocation.state = { documentId: 'doc-123', documentName: 'test.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [{ _id: 'doc-123', name: 'test.pdf' }],
        isDocumentInFolder: true,
      });

      renderHook(() => useFindDocumentLocation(props));

      expect(mockSetDocumentListInFolder).toHaveBeenCalled();
    });

    it('should fetch more documents when document not found and hasMore is true', () => {
      mockUseLocation.state = { documentId: 'doc-999', documentName: 'notfound.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [{ _id: 'doc-123', name: 'test.pdf' }],
        isHasMore: true,
      });

      renderHook(() => useFindDocumentLocation(props));

      expect(mockFetchMore).toHaveBeenCalled();
    });

    it('should stop searching after MAX_FIND_DOCUMENT_ATTEMPTS', () => {
      mockUseLocation.state = { documentId: 'doc-999', documentName: 'notfound.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [{ _id: 'doc-123', name: 'test.pdf' }],
        isHasMore: true,
      });

      const { rerender } = renderHook(() => useFindDocumentLocation(props));

      expect(mockFetchMore).toHaveBeenCalled();

      act(() => {
        props.documents = [
          { _id: 'doc-123', name: 'test.pdf' },
          { _id: 'doc-456', name: 'test2.pdf' },
        ];
        rerender();
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: 'FIND_DOCUMENT_LOCATION',
          attributes: expect.objectContaining({
            isFound: false,
          }),
        })
      );
    });

    it('should trigger findDocumentByName when document not found and no more to fetch', () => {
      mockUseLocation.state = { documentId: 'doc-999', documentName: 'notfound.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [{ _id: 'doc-123', name: 'test.pdf' }],
        isHasMore: false,
      });

      renderHook(() => useFindDocumentLocation(props));

      act(() => {
        jest.runAllTimers();
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.findDocumentByName('notfound.pdf'));
    });
  });

  describe('scroll handling', () => {
    it('should scroll to document index when document is found', () => {
      mockUseLocation.state = { documentId: 'doc-123', documentName: 'test.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [{ _id: 'doc-123', name: 'test.pdf' }],
        folders: [{ id: 'folder-1' }],
      });

      renderHook(() => useFindDocumentLocation(props));

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockVirtuosoRef.current.scrollToIndex).toHaveBeenCalledWith({
        index: 1,
        align: 'center',
        behavior: 'smooth',
      });
    });

    it('should not scroll when virtuosoRef.current is null', () => {
      mockUseLocation.state = { documentId: 'doc-123', documentName: 'test.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [{ _id: 'doc-123', name: 'test.pdf' }],
        virtuosoRef: { current: null },
      });

      renderHook(() => useFindDocumentLocation(props));

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch setFoundDocumentScrolling with loading false after scroll', () => {
      mockUseLocation.state = { documentId: 'doc-123', documentName: 'test.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [{ _id: 'doc-123', name: 'test.pdf' }],
      });

      renderHook(() => useFindDocumentLocation(props));

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.setFoundDocumentScrolling({ folderType: 'all', loading: false })
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty location state', () => {
      mockUseLocation.state = null;
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps();
      const { result } = renderHook(() => useFindDocumentLocation(props));

      expect(result.current.findDocumentLoading).toBe(false);
    });

    it('should handle finding document with multiple folders', () => {
      mockUseLocation.state = { documentId: 'doc-123', documentName: 'test.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [
          { _id: 'doc-456', name: 'other.pdf' },
          { _id: 'doc-123', name: 'test.pdf' },
        ],
        folders: [{ id: 'folder-1' }, { id: 'folder-2' }, { id: 'folder-3' }],
      });

      renderHook(() => useFindDocumentLocation(props));

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockVirtuosoRef.current.scrollToIndex).toHaveBeenCalledWith({
        index: 4,
        align: 'center',
        behavior: 'smooth',
      });
    });

    it('should cleanup timeout on unmount', () => {
      mockUseLocation.state = { documentId: 'doc-123', documentName: 'test.pdf' };
      useLocation.mockReturnValue(mockUseLocation);

      const props = createDefaultProps({
        documents: [{ _id: 'doc-123', name: 'test.pdf' }],
      });

      const { unmount } = renderHook(() => useFindDocumentLocation(props));

      unmount();

      act(() => {
        jest.advanceTimersByTime(100);
      });
    });
  });
});
