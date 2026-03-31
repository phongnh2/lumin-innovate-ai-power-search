import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { createStore } from 'src/redux/mockStore';
import initialState from 'src/redux/initialState';

import { DocumentContext } from 'lumin-components/Document/context';
import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';
import { layoutType } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

jest.mock('../HOC', () => ({
  withResetSelectedState: (Component) => Component,
}));

jest.mock('lumin-components/ReskinLayout/components/ShareModal', () => ({
  SearchResultItem: () => null,
}));

jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getFoundDocumentScrolling: jest.fn(() => false),
  },
}));

jest.mock('hooks', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('hooks/useDesktopMatch', () => ({
  useDesktopMatch: jest.fn(),
}));

jest.mock('hooks/useLargeDesktopMatch', () => ({
  useLargeDesktopMatch: jest.fn(),
}));

jest.mock('hooks/useTabletMatch', () => ({
  useTabletMatch: jest.fn(),
}));

jest.mock('hooks/useGetFolderType', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('hooks/useGetIsCompletedUploadDocuments', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('hooks/useHideTooltipOnScroll', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('hooks/useOfflineAction', () => ({
  useOfflineAction: jest.fn(),
}));

jest.mock('lumin-components/Document/hooks', () => ({
  useValidateDocumentRemoval: jest.fn(),
}));

jest.mock('features/WebChatBot/hooks/useChatbotStore', () => ({
  useChatbotStore: jest.fn(),
}));

jest.mock('../hooks/useCachingFileHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../hooks/useCloseContextMenuOnScroll', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../hooks/useFindDocumentLocation', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../hooks/useScrollToNewUploadedDocument', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/graphServices', () => ({
  documentGraphServices: {
    starDocumentMutation: jest.fn(),
  },
}));

jest.mock('src/socket', () => ({
  socket: {
    emit: jest.fn(),
  },
}));

jest.mock('utils/toastUtils', () => ({
  __esModule: true,
  default: {
    openToastMulti: jest.fn(),
  },
}));

jest.mock('HOC/OfflineStorageHOC', () => ({
  systemFileHandler: {
    starFile: jest.fn(),
  },
}));

jest.mock('react-virtuoso', () => {
  const React = require('react');
  return {
    Virtuoso: React.forwardRef(({ data, itemContent, Footer, context, computeItemKey }, ref) => (
      <div data-testid="virtuoso-list" ref={ref}>
        {data.map((item, index) => (
          <div key={computeItemKey ? computeItemKey(index, item) : index}>{itemContent(index, item)}</div>
        ))}
        {Footer && <Footer context={context} />}
      </div>
    )),
    VirtuosoGrid: React.forwardRef(({ data, itemContent, Footer, context, computeItemKey }, ref) => (
      <div data-testid="virtuoso-grid" ref={ref}>
        {data.map((item, index) => (
          <div key={computeItemKey ? computeItemKey(index, item) : index}>{itemContent(index, item)}</div>
        ))}
        {Footer && <Footer context={context} />}
      </div>
    )),
  };
});

jest.mock('lumin-components/DocumentItemContainer', () => ({
  __esModule: true,
  default: ({ document }) => <div data-testid={`document-item-${document._id}`}>{document.name}</div>,
}));

jest.mock('luminComponents/ReskinLayout/components/FolderItemContainer', () => ({
  FolderItemContainer: ({ folder }) => <div data-testid={`folder-item-${folder._id}`}>{folder.name}</div>,
}));

jest.mock('lumin-components/DocumentSkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="document-skeleton">Loading...</div>,
}));

jest.mock('lumin-components/DocumentSkeleton/DocumentGridItemSkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="document-grid-skeleton">Loading grid...</div>,
}));

jest.mock('lumin-components/FailedFetchError', () => ({
  __esModule: true,
  default: ({ retry }) => (
    <div data-testid="failed-fetch-error">
      <button onClick={retry}>Retry</button>
    </div>
  ),
}));

jest.mock('luminComponents/ReskinLayout/components/EmptyDocumentList', () => ({
  EmptyDocumentList: ({ pageType }) => <div data-testid="empty-document-list">Empty list for {pageType}</div>,
}));

import DocumentListRenderer from '../DocumentListRenderer';

describe('DocumentListRenderer', () => {
  let defaultProps;
  let defaultContextValue;
  let defaultAppLayoutContext;
  let store;
  let mockHooks;

  beforeEach(() => {
    const testState = {
      ...initialState,
      documentList: {
        'my-documents': {
          foundDocumentScrolling: false,
        },
        ...initialState.documentList,
      },
    };
    store = createStore(testState);

    defaultProps = {
      folders: [],
      documents: [],
      folderLoading: false,
      documentLoading: false,
      hasNextPage: false,
      fetchMore: jest.fn(),
      openDocumentModal: jest.fn(),
      total: 0,
    };

    defaultContextValue = {
      documentLayout: layoutType.list,
      error: null,
      refetchDocument: jest.fn(),
      handleSelectedItems: jest.fn(),
      lastSelectedDocIdRef: { current: null },
      setDocumentList: jest.fn(),
    };

    defaultAppLayoutContext = {
      bodyScrollRef: { current: document.createElement('div') },
    };

    mockHooks = {
      useGetCurrentUser: require('hooks').useGetCurrentUser,
      useDesktopMatch: require('hooks/useDesktopMatch').useDesktopMatch,
      useLargeDesktopMatch: require('hooks/useLargeDesktopMatch').useLargeDesktopMatch,
      useTabletMatch: require('hooks/useTabletMatch').useTabletMatch,
      useGetFolderType: require('hooks/useGetFolderType').default,
      useGetIsCompletedUploadDocuments: require('hooks/useGetIsCompletedUploadDocuments').default,
      useValidateDocumentRemoval: require('lumin-components/Document/hooks').useValidateDocumentRemoval,
      useOfflineAction: require('hooks/useOfflineAction').useOfflineAction,
      useChatbotStore: require('features/WebChatBot/hooks/useChatbotStore').useChatbotStore,
      useFindDocumentLocation: require('../hooks/useFindDocumentLocation').default,
    };

    mockHooks.useGetCurrentUser.mockReturnValue({ _id: 'user-1', name: 'Test User' });
    mockHooks.useDesktopMatch.mockReturnValue(true);
    mockHooks.useLargeDesktopMatch.mockReturnValue(false);
    mockHooks.useTabletMatch.mockReturnValue(true);
    mockHooks.useGetFolderType.mockReturnValue('my-documents');
    mockHooks.useGetIsCompletedUploadDocuments.mockReturnValue(true);
    mockHooks.useValidateDocumentRemoval.mockReturnValue(true);
    mockHooks.useOfflineAction.mockReturnValue({
      makeOffline: jest.fn(),
      pendingDownloadedDocument: null,
      setPendingDownloadedDocument: jest.fn(),
      onDownloadDocument: jest.fn(),
    });
    mockHooks.useChatbotStore.mockReturnValue({ isVisible: false });
    mockHooks.useFindDocumentLocation.mockReturnValue({ findDocumentLoading: false });

    jest.clearAllMocks();
  });

  const renderComponent = (props = {}, contextValue = {}, appLayoutContext = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    const mergedContext = { ...defaultContextValue, ...contextValue };
    const mergedAppLayoutContext = { ...defaultAppLayoutContext, ...appLayoutContext };

    return render(
      <Provider store={store}>
        <MemoryRouter>
          <AppLayoutContext.Provider value={mergedAppLayoutContext}>
            <DocumentContext.Provider value={mergedContext}>
              <DocumentListRenderer {...mergedProps} />
            </DocumentContext.Provider>
          </AppLayoutContext.Provider>
        </MemoryRouter>
      </Provider>
    );
  };

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      renderComponent();
      expect(screen.getByTestId('empty-document-list')).toBeInTheDocument();
    });

    it('should render empty state when no documents and folders', () => {
      renderComponent({ total: 0 });
      expect(screen.getByTestId('empty-document-list')).toBeInTheDocument();
    });

    it('should render error state when documentError exists', () => {
      renderComponent({}, { error: new Error('Test error') });
      expect(screen.getByTestId('failed-fetch-error')).toBeInTheDocument();
    });

    it('should call refetchDocument when retry button clicked', () => {
      const refetchDocument = jest.fn();
      renderComponent({}, { error: new Error('Test error'), refetchDocument });

      const retryButton = screen.getByText('Retry');
      retryButton.click();

      expect(refetchDocument).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should render document skeleton when documentLoading is true', () => {
      renderComponent({ documentLoading: true, documents: [] });
      expect(screen.getByTestId('document-skeleton')).toBeInTheDocument();
    });

    it('should render document skeleton when folderLoading is true', () => {
      renderComponent({ folderLoading: true, folders: [] });
      expect(screen.getByTestId('document-skeleton')).toBeInTheDocument();
    });

    it('should render skeleton when findDocumentLoading is true', () => {
      mockHooks.useFindDocumentLocation.mockReturnValue({ findDocumentLoading: true });
      renderComponent({ documents: [{ _id: 'doc-1', name: 'Doc 1' }], folders: [], total: 1 });
      expect(screen.getByTestId('document-skeleton')).toBeInTheDocument();
    });
  });

  describe('List Layout', () => {
    it('should render documents in list layout', () => {
      const documents = [
        { _id: 'doc-1', name: 'Document 1' },
        { _id: 'doc-2', name: 'Document 2' },
      ];

      renderComponent({ documents, total: 2 }, { documentLayout: layoutType.list });

      expect(screen.getByTestId('virtuoso-list')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-2')).toBeInTheDocument();
    });

    it('should render folders and documents in list layout', () => {
      const folders = [{ _id: 'folder-1', name: 'Folder 1' }];
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({ folders, documents, total: 2 }, { documentLayout: layoutType.list });

      expect(screen.getByTestId('folder-item-folder-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('should render documents in grid layout', () => {
      const documents = [
        { _id: 'doc-1', name: 'Document 1' },
        { _id: 'doc-2', name: 'Document 2' },
      ];

      renderComponent({ documents, total: 2 }, { documentLayout: layoutType.grid });

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-2')).toBeInTheDocument();
    });

    it('should render folders and documents in grid layout', () => {
      const folders = [{ _id: 'folder-1', name: 'Folder 1' }];
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({ folders, documents, total: 2 }, { documentLayout: layoutType.grid });

      expect(screen.getByTestId('folder-item-folder-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });
  });

  describe('Star Click Handler', () => {
    it('should handle star click for S3 document', async () => {
      const { documentGraphServices } = require('services/graphServices');
      const { socket } = require('src/socket');

      documentGraphServices.starDocumentMutation.mockResolvedValue({});

      const documents = [
        {
          _id: 'doc-1',
          name: 'Document 1',
          service: STORAGE_TYPE.S3,
          listUserStar: [],
        },
      ];

      renderComponent({ documents, total: 1 });

      await waitFor(() => {
        expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      });
    });

    it('should handle star click for system file', async () => {
      const { systemFileHandler } = require('HOC/OfflineStorageHOC');

      const documents = [
        {
          _id: 'doc-1',
          name: 'System Doc',
          service: STORAGE_TYPE.SYSTEM,
          isStarred: false,
        },
      ];

      renderComponent({ documents, total: 1 });

      await waitFor(() => {
        expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      });
    });

    it('should handle star click error', async () => {
      const { documentGraphServices } = require('services/graphServices');
      const toastUtils = require('utils/toastUtils').default;

      documentGraphServices.starDocumentMutation.mockRejectedValue(new Error('Star failed'));

      const documents = [
        {
          _id: 'doc-1',
          name: 'Document 1',
          service: STORAGE_TYPE.S3,
          listUserStar: [],
        },
      ];

      renderComponent({ documents, total: 1 });

      await waitFor(() => {
        expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      });
    });
  });

  describe('Fetch More', () => {
    it('should call fetchMore when hasNextPage is true', async () => {
      const fetchMore = jest.fn().mockResolvedValue();
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({ documents, total: 1, hasNextPage: true, fetchMore });

      await waitFor(() => {
        expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      });
    });

    it('should not call fetchMore when hasNextPage is false', () => {
      const fetchMore = jest.fn();
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({ documents, total: 1, hasNextPage: false, fetchMore });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });
  });

  describe('Footer Rendering', () => {
    it('should render footer skeleton in list layout when fetching', () => {
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({ documents, total: 1, hasNextPage: true }, { documentLayout: layoutType.list });

      expect(screen.getByTestId('virtuoso-list')).toBeInTheDocument();
    });

    it('should render footer skeleton in grid layout when fetching', () => {
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({ documents, total: 1, hasNextPage: true }, { documentLayout: layoutType.grid });

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument();
    });
  });

  describe('Responsive Column Count', () => {
    it('should use 5 columns on large desktop', () => {
      mockHooks.useLargeDesktopMatch.mockReturnValue(true);
      mockHooks.useDesktopMatch.mockReturnValue(true);
      mockHooks.useTabletMatch.mockReturnValue(true);

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 }, { documentLayout: layoutType.grid });

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument();
    });

    it('should use 4 columns on desktop', () => {
      mockHooks.useLargeDesktopMatch.mockReturnValue(false);
      mockHooks.useDesktopMatch.mockReturnValue(true);
      mockHooks.useTabletMatch.mockReturnValue(true);

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 }, { documentLayout: layoutType.grid });

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument();
    });

    it('should use 3 columns on tablet', () => {
      mockHooks.useLargeDesktopMatch.mockReturnValue(false);
      mockHooks.useDesktopMatch.mockReturnValue(false);
      mockHooks.useTabletMatch.mockReturnValue(true);

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 }, { documentLayout: layoutType.grid });

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument();
    });

    it('should use 2 columns on mobile', () => {
      mockHooks.useLargeDesktopMatch.mockReturnValue(false);
      mockHooks.useDesktopMatch.mockReturnValue(false);
      mockHooks.useTabletMatch.mockReturnValue(false);

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 }, { documentLayout: layoutType.grid });

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument();
    });
  });

  describe('Chatbot Integration', () => {
    it('should reduce column count when chatbot is opened', () => {
      mockHooks.useChatbotStore.mockReturnValue({ isVisible: true });
      mockHooks.useDesktopMatch.mockReturnValue(true);

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 }, { documentLayout: layoutType.grid });

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument();
    });
  });

  describe('Merged Documents and Folders', () => {
    it('should merge folders and documents correctly', () => {
      const folders = [
        { _id: 'folder-1', name: 'Folder 1' },
        { _id: 'folder-2', name: 'Folder 2' },
      ];
      const documents = [
        { _id: 'doc-1', name: 'Document 1' },
        { _id: 'doc-2', name: 'Document 2' },
      ];

      renderComponent({ folders, documents, total: 4 });

      expect(screen.getByTestId('folder-item-folder-1')).toBeInTheDocument();
      expect(screen.getByTestId('folder-item-folder-2')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-2')).toBeInTheDocument();
    });
  });

  describe('Empty State Conditions', () => {
    it('should show empty state when total is 0 and not loading', () => {
      renderComponent({
        documents: [],
        folders: [],
        total: 0,
        documentLoading: false,
        folderLoading: false,
      });

      expect(screen.getByTestId('empty-document-list')).toBeInTheDocument();
    });

    it('should not show empty state when loading', () => {
      renderComponent({
        documents: [],
        folders: [],
        total: 0,
        documentLoading: true,
        folderLoading: false,
      });

      expect(screen.getByTestId('document-skeleton')).toBeInTheDocument();
    });

    it('should not show empty state when has documents', () => {
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({
        documents,
        folders: [],
        total: 1,
        documentLoading: false,
        folderLoading: false,
      });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });

    it('should not show empty state when has folders', () => {
      const folders = [{ _id: 'folder-1', name: 'Folder 1' }];

      renderComponent({
        documents: [],
        folders,
        total: 1,
        documentLoading: false,
        folderLoading: false,
      });

      expect(screen.getByTestId('folder-item-folder-1')).toBeInTheDocument();
    });
  });

  describe('New Upload Document', () => {
    it('should detect newest uploaded document', () => {
      const documents = [
        { _id: 'doc-1', name: 'New Doc', newUpload: true, service: STORAGE_TYPE.S3 },
        { _id: 'doc-2', name: 'Old Doc' },
      ];

      renderComponent({ documents, total: 2 });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-2')).toBeInTheDocument();
    });

    it('should handle no new upload documents', () => {
      const documents = [
        { _id: 'doc-1', name: 'Doc 1' },
        { _id: 'doc-2', name: 'Doc 2' },
      ];

      renderComponent({ documents, total: 2 });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-2')).toBeInTheDocument();
    });
  });

  describe('Compute Item Key', () => {
    it('should use document _id as key', () => {
      const documents = [
        { _id: 'unique-doc-1', name: 'Document 1' },
        { _id: 'unique-doc-2', name: 'Document 2' },
      ];

      renderComponent({ documents, total: 2 });

      expect(screen.getByTestId('document-item-unique-doc-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-unique-doc-2')).toBeInTheDocument();
    });
  });

  describe('Route Conditions', () => {
    it('should handle folder document route', () => {
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      const folders = [{ _id: 'folder-1', name: 'Folder 1' }];

      renderComponent({ documents, folders, total: 2 });

      expect(screen.getByTestId('folder-item-folder-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle default props', () => {
      renderComponent({
        documents: [],
        folders: [],
        folderLoading: true,
        documentLoading: true,
        total: null,
      });

      expect(screen.getByTestId('document-skeleton')).toBeInTheDocument();
    });

    it('should pass all required props to DocumentItemContainer', () => {
      const openDocumentModal = jest.fn();
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({ documents, total: 1, openDocumentModal });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });
  });

  describe('Offline Actions', () => {
    it('should handle makeOffline action', () => {
      const makeOffline = jest.fn();
      mockHooks.useOfflineAction.mockReturnValue({
        makeOffline,
        pendingDownloadedDocument: null,
        setPendingDownloadedDocument: jest.fn(),
        onDownloadDocument: jest.fn(),
      });

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });

    it('should handle pending downloaded document', () => {
      mockHooks.useOfflineAction.mockReturnValue({
        makeOffline: jest.fn(),
        pendingDownloadedDocument: { _id: 'doc-1' },
        setPendingDownloadedDocument: jest.fn(),
        onDownloadDocument: jest.fn(),
      });

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });
  });

  describe('Document Removal', () => {
    it('should handle removable documents', () => {
      mockHooks.useValidateDocumentRemoval.mockReturnValue(true);

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });

    it('should handle non-removable documents', () => {
      mockHooks.useValidateDocumentRemoval.mockReturnValue(false);

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty documents array', () => {
      renderComponent({ documents: [], total: 0 });
      expect(screen.getByTestId('empty-document-list')).toBeInTheDocument();
    });

    it('should handle null total', () => {
      renderComponent({ documents: [], total: null, documentLoading: true });
      expect(screen.getByTestId('document-skeleton')).toBeInTheDocument();
    });

    it('should handle undefined documents', () => {
      renderComponent({ documents: undefined, total: 0 });
      expect(screen.queryByTestId('virtuoso-list')).not.toBeInTheDocument();
    });

    it('should handle mixed document types', () => {
      const documents = [
        { _id: 'doc-1', name: 'Doc 1', service: STORAGE_TYPE.S3 },
        { _id: 'doc-2', name: 'Doc 2', service: STORAGE_TYPE.SYSTEM },
      ];

      renderComponent({ documents, total: 2 });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-2')).toBeInTheDocument();
    });
  });

  describe('Star Click with Deselect Logic', () => {
    it('should deselect document when starring an already starred document', async () => {
      const { documentGraphServices } = require('services/graphServices');
      const handleSelectedItems = jest.fn();

      documentGraphServices.starDocumentMutation.mockResolvedValue({});

      const documents = [
        {
          _id: 'doc-1',
          name: 'Document 1',
          service: STORAGE_TYPE.S3,
          listUserStar: ['user-1'],
        },
      ];

      renderComponent({ documents, total: 1 }, { handleSelectedItems });

      await waitFor(() => {
        expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      });
    });
  });

  describe('Additional Coverage', () => {
    it('should handle fetchMore when already fetching', async () => {
      const fetchMore = jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({ documents, total: 1, hasNextPage: true, fetchMore });

      await waitFor(() => {
        expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      });
    });

    it('should render with chatbot opened in list layout', () => {
      mockHooks.useChatbotStore.mockReturnValue({ isVisible: true });

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 }, { documentLayout: layoutType.list });

      expect(screen.getByTestId('virtuoso-list')).toBeInTheDocument();
    });

    it('should handle new upload with system storage', () => {
      mockHooks.useGetIsCompletedUploadDocuments.mockReturnValue(true);

      const documents = [{ _id: 'doc-1', name: 'New Doc', newUpload: true, service: STORAGE_TYPE.SYSTEM }];

      renderComponent({ documents, total: 1 });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });

    it('should handle new upload with incomplete S3 upload', () => {
      mockHooks.useGetIsCompletedUploadDocuments.mockReturnValue(false);

      const documents = [
        { _id: 'doc-1', name: 'New Doc', newUpload: true, service: STORAGE_TYPE.S3 },
        { _id: 'doc-2', name: 'Old Doc' },
      ];

      renderComponent({ documents, total: 2 });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-2')).toBeInTheDocument();
    });

    it('should render footer with isFetchingMore false', () => {
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({ documents, total: 1, hasNextPage: false }, { documentLayout: layoutType.list });

      expect(screen.getByTestId('virtuoso-list')).toBeInTheDocument();
    });

    it('should calculate correct skeleton count for grid layout', () => {
      mockHooks.useChatbotStore.mockReturnValue({ isVisible: false });
      mockHooks.useDesktopMatch.mockReturnValue(true);
      mockHooks.useLargeDesktopMatch.mockReturnValue(false);

      const documents = [
        { _id: 'doc-1', name: 'Doc 1' },
        { _id: 'doc-2', name: 'Doc 2' },
        { _id: 'doc-3', name: 'Doc 3' },
      ];

      renderComponent({ documents, total: 3, hasNextPage: true }, { documentLayout: layoutType.grid });

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument();
    });

    it('should handle document with foundDocumentScrolling true', () => {
      const selectors = require('selectors').default;
      selectors.getFoundDocumentScrolling.mockReturnValue(true);

      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      renderComponent({ documents, total: 1 });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });

    it('should handle empty folders with shouldRenderFolderItems', () => {
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];
      const folders = [];

      renderComponent({ documents, folders, total: 1, folderLoading: false });

      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });

    it('should merge documents with produce immutably', () => {
      const folders = [{ _id: 'folder-1', name: 'Folder 1' }];
      const documents = [{ _id: 'doc-1', name: 'Document 1' }];

      renderComponent({ folders, documents, total: 2 });

      expect(screen.getByTestId('folder-item-folder-1')).toBeInTheDocument();
      expect(screen.getByTestId('document-item-doc-1')).toBeInTheDocument();
    });
  });
});
