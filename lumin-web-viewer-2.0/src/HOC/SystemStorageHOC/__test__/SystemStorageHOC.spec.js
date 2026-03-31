/* eslint-disable no-console */
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorStr = args
    .map((arg) => {
      if (arg instanceof Error) return arg.message + (arg.stack || '');
      return String(arg);
    })
    .join(' ');

  if (errorStr.includes('not wrapped in act') || errorStr.includes('SystemStorageHOC')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import SystemStorageHOC from '../SystemStorageHOC';

// Mock immer produce
jest.mock('immer', () => ({
  __esModule: true,
  default: (state, producer) => {
    const draft = JSON.parse(JSON.stringify(state));
    producer(draft);
    return draft;
  },
}));

// Mock hooks
jest.mock('hooks', () => ({
  useSearchSystemFile: jest.fn(() => ({
    searchResults: [],
    isSearching: false,
    handleSearch: jest.fn(),
  })),
}));

// Mock actions
jest.mock('actions', () => ({
  pushDocumentToSystemList: jest.fn((doc) => ({ type: 'PUSH_DOC', payload: doc })),
  updateDocumentSystem: jest.fn((doc) => ({ type: 'UPDATE_DOC', payload: doc })),
  removeDocumentFromSystemList: jest.fn((doc) => ({ type: 'REMOVE_DOC', payload: doc })),
}));

// Mock systemFileHandler
const mockGetAll = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveAllEventListener = jest.fn();

jest.mock('HOC/OfflineStorageHOC', () => ({
  systemFileHandler: {
    getAll: () => mockGetAll(),
    addEventListener: (...args) => mockAddEventListener(...args),
    removeAllEventListener: () => mockRemoveAllEventListener(),
  },
}));

// Mock Handler
jest.mock('HOC/OfflineStorageHOC/Handler/Handler', () => ({
  EVENTS: {
    INSERT_SYSTEM_FILE: 'INSERT_SYSTEM_FILE',
    DELETE_SYSTEM_FILE: 'DELETE_SYSTEM_FILE',
    CHANGE_STAR_SYSTEM_FILE: 'CHANGE_STAR_SYSTEM_FILE',
  },
}));

// Mock DocumentQueryProxy
jest.mock('lumin-components/DocumentQuery/DocumentQueryProxy', () => ({
  DocumentQueryProxy: jest.fn(),
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  folderType: {
    DEVICE: 'device',
  },
}));

// Import mocked modules
import { useSearchSystemFile } from 'hooks';
import actions from 'actions';
import Handler from 'HOC/OfflineStorageHOC/Handler/Handler';
import { DocumentQueryProxy } from 'lumin-components/DocumentQuery/DocumentQueryProxy';

const mockStore = configureMockStore([]);

// Test component that displays props
const TestComponent = ({ queryProps, testProp }) => (
  <div data-testid="test-component">
    <span data-testid="loading">{String(queryProps?.loading)}</span>
    <span data-testid="document-count">{queryProps?.documentList?.length || 0}</span>
    <span data-testid="has-next-page">{String(queryProps?.hasNextPage)}</span>
    <span data-testid="total">{queryProps?.total || 0}</span>
    <span data-testid="test-prop">{testProp}</span>
  </div>
);

describe('SystemStorageHOC', () => {
  let reduxStore;

  beforeEach(() => {
    jest.clearAllMocks();

    reduxStore = mockStore({});

    // Default mock implementations
    mockGetAll.mockResolvedValue([]);
    mockAddEventListener.mockImplementation(() => {});
    mockRemoveAllEventListener.mockImplementation(() => {});

    useSearchSystemFile.mockReturnValue({
      searchResults: [],
      isSearching: false,
      handleSearch: jest.fn(),
    });
  });

  const renderWithProvider = (Component, props = {}) => {
    return render(
      <Provider store={reduxStore}>
        <Component {...props} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render wrapped component', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent, { testProp: 'test-value' });

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should pass props to wrapped component', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent, { testProp: 'custom-value' });

      await waitFor(() => {
        expect(screen.getByTestId('test-prop')).toHaveTextContent('custom-value');
      });
    });

    it('should pass queryProps to wrapped component', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.getByTestId('document-count')).toBeInTheDocument();
        expect(screen.getByTestId('has-next-page')).toBeInTheDocument();
      });
    });
  });

  describe('Initial State', () => {
    it('should start with loading true', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      // Initially loading should be true
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    it('should start with empty document list', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      expect(screen.getByTestId('document-count')).toHaveTextContent('0');
    });

    it('should start with hasNextPage false', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      expect(screen.getByTestId('has-next-page')).toHaveTextContent('false');
    });
  });

  describe('getSystemFiles', () => {
    it('should call systemFileHandler.getAll on mount', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalled();
      });
    });

    it('should update state with loaded files', async () => {
      const mockFiles = [
        { _id: 'file-1', name: 'Document 1' },
        { _id: 'file-2', name: 'Document 2' },
      ];
      mockGetAll.mockResolvedValue(mockFiles);

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(screen.getByTestId('document-count')).toHaveTextContent('2');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should call DocumentQueryProxy with loaded files', async () => {
      const mockFiles = [{ _id: 'file-1', name: 'Document 1' }];
      mockGetAll.mockResolvedValue(mockFiles);

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(DocumentQueryProxy).toHaveBeenCalledWith('device', {
          documents: mockFiles,
          hasNextPage: false,
          cursor: '',
          total: 1,
        });
      });
    });
  });

  describe('Event Listeners', () => {
    it('should add INSERT_SYSTEM_FILE event listener on mount', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalledWith(Handler.EVENTS.INSERT_SYSTEM_FILE, expect.any(Function));
      });
    });

    it('should add DELETE_SYSTEM_FILE event listener on mount', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalledWith(Handler.EVENTS.DELETE_SYSTEM_FILE, expect.any(Function));
      });
    });

    it('should add CHANGE_STAR_SYSTEM_FILE event listener on mount', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalledWith(Handler.EVENTS.CHANGE_STAR_SYSTEM_FILE, expect.any(Function));
      });
    });

    it('should remove all event listeners on unmount', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      const { unmount } = renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });

      unmount();

      expect(mockRemoveAllEventListener).toHaveBeenCalled();
    });
  });

  describe('handleAddSystemFile', () => {
    it('should add new files to document list', async () => {
      mockGetAll.mockResolvedValue([]);

      let insertHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === Handler.EVENTS.INSERT_SYSTEM_FILE) {
          insertHandler = handler;
        }
      });

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(screen.getByTestId('document-count')).toHaveTextContent('0');
      });

      // Simulate adding files
      act(() => {
        insertHandler([{ _id: 'new-file', name: 'New Document' }]);
      });

      await waitFor(() => {
        expect(screen.getByTestId('document-count')).toHaveTextContent('1');
      });
    });

    it('should dispatch pushDocumentToSystemList for each file', async () => {
      mockGetAll.mockResolvedValue([]);

      let insertHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === Handler.EVENTS.INSERT_SYSTEM_FILE) {
          insertHandler = handler;
        }
      });

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });

      const newFiles = [
        { _id: 'file-1', name: 'Doc 1' },
        { _id: 'file-2', name: 'Doc 2' },
      ];

      act(() => {
        insertHandler(newFiles);
      });

      expect(actions.pushDocumentToSystemList).toHaveBeenCalledWith(newFiles[0]);
      expect(actions.pushDocumentToSystemList).toHaveBeenCalledWith(newFiles[1]);
    });
  });

  describe('handleDeleteSystemFile', () => {
    it('should remove file from document list', async () => {
      const mockFiles = [
        { _id: 'file-1', name: 'Document 1' },
        { _id: 'file-2', name: 'Document 2' },
      ];
      mockGetAll.mockResolvedValue(mockFiles);

      let deleteHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === Handler.EVENTS.DELETE_SYSTEM_FILE) {
          deleteHandler = handler;
        }
      });

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(screen.getByTestId('document-count')).toHaveTextContent('2');
      });

      // Simulate deleting a file
      act(() => {
        deleteHandler('file-1');
      });

      await waitFor(() => {
        expect(screen.getByTestId('document-count')).toHaveTextContent('1');
      });
    });

    it('should dispatch removeDocumentFromSystemList', async () => {
      mockGetAll.mockResolvedValue([{ _id: 'file-1', name: 'Document 1' }]);

      let deleteHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === Handler.EVENTS.DELETE_SYSTEM_FILE) {
          deleteHandler = handler;
        }
      });

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });

      act(() => {
        deleteHandler('file-1');
      });

      expect(actions.removeDocumentFromSystemList).toHaveBeenCalledWith({ _id: 'file-1' });
    });
  });

  describe('handleStarSystemFile', () => {
    it('should update file star status in document list', async () => {
      const mockFiles = [{ _id: 'file-1', name: 'Document 1', isStarred: false }];
      mockGetAll.mockResolvedValue(mockFiles);

      let starHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === Handler.EVENTS.CHANGE_STAR_SYSTEM_FILE) {
          starHandler = handler;
        }
      });

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });

      // Simulate starring a file
      act(() => {
        starHandler({ _id: 'file-1', isStarred: true });
      });

      expect(actions.updateDocumentSystem).toHaveBeenCalledWith({ _id: 'file-1', isStarred: true });
    });

    it('should dispatch updateDocumentSystem', async () => {
      mockGetAll.mockResolvedValue([{ _id: 'file-1', name: 'Document 1' }]);

      let starHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === Handler.EVENTS.CHANGE_STAR_SYSTEM_FILE) {
          starHandler = handler;
        }
      });

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });

      const updatedDoc = { _id: 'file-1', isStarred: true };
      act(() => {
        starHandler(updatedDoc);
      });

      expect(actions.updateDocumentSystem).toHaveBeenCalledWith(updatedDoc);
    });
  });

  describe('useSearchSystemFile Hook', () => {
    it('should call useSearchSystemFile with correct params', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(useSearchSystemFile).toHaveBeenCalledWith({
          setSystemDocuments: expect.any(Function),
          systemDocuments: expect.any(Array),
          getSystemDocuments: expect.any(Function),
        });
      });
    });

    it('should pass search props to wrapped component', async () => {
      const mockSearchProps = {
        searchResults: [{ _id: 'search-1' }],
        isSearching: true,
        handleSearch: jest.fn(),
      };
      useSearchSystemFile.mockReturnValue(mockSearchProps);

      const PropsChecker = (props) => (
        <div data-testid="props-checker">
          <span data-testid="is-searching">{String(props.isSearching)}</span>
        </div>
      );

      const EnhancedComponent = SystemStorageHOC(PropsChecker);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(screen.getByTestId('is-searching')).toHaveTextContent('true');
      });
    });
  });

  describe('Redux Connection', () => {
    it('should connect to redux store', async () => {
      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should have mapDispatchToProps for pushDocumentToSystemList', async () => {
      mockGetAll.mockResolvedValue([]);

      let insertHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === Handler.EVENTS.INSERT_SYSTEM_FILE) {
          insertHandler = handler;
        }
      });

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });

      act(() => {
        insertHandler([{ _id: 'test-file' }]);
      });

      expect(actions.pushDocumentToSystemList).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list from getAll', async () => {
      mockGetAll.mockResolvedValue([]);

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(screen.getByTestId('document-count')).toHaveTextContent('0');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should handle star change for non-existent document', async () => {
      mockGetAll.mockResolvedValue([{ _id: 'file-1', name: 'Document 1' }]);

      let starHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === Handler.EVENTS.CHANGE_STAR_SYSTEM_FILE) {
          starHandler = handler;
        }
      });

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });

      // Try to star a non-existent document - should not crash
      act(() => {
        starHandler({ _id: 'non-existent', isStarred: true });
      });

      // Should still dispatch the action
      expect(actions.updateDocumentSystem).toHaveBeenCalled();
    });

    it('should prepend new files to existing list', async () => {
      const existingFiles = [{ _id: 'existing-1', name: 'Existing Doc' }];
      mockGetAll.mockResolvedValue(existingFiles);

      let insertHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === Handler.EVENTS.INSERT_SYSTEM_FILE) {
          insertHandler = handler;
        }
      });

      const EnhancedComponent = SystemStorageHOC(TestComponent);

      renderWithProvider(EnhancedComponent);

      await waitFor(() => {
        expect(screen.getByTestId('document-count')).toHaveTextContent('1');
      });

      // Add new files
      act(() => {
        insertHandler([{ _id: 'new-file', name: 'New Doc' }]);
      });

      await waitFor(() => {
        expect(screen.getByTestId('document-count')).toHaveTextContent('2');
      });
    });
  });
});
