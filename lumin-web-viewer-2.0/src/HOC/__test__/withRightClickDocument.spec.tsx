import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable mock state
const mockState = {
  cookiesDisabled: false,
  isHomePage: false,
};

// Mock react-router
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock ContextMenu
jest.mock('luminComponents/ContextMenu', () => ({
  __esModule: true,
  default: ({ children, id, openInNewTab, openInCurrentTab }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'context-menu', 'data-id': id },
      React.createElement('button', { 'data-testid': 'open-in-new-tab', onClick: openInNewTab }, 'New Tab'),
      React.createElement('button', { 'data-testid': 'open-in-current-tab', onClick: openInCurrentTab }, 'Current Tab'),
      children
    );
  },
}));

// Mock CookieWarningContext
jest.mock('luminComponents/CookieWarningModal/Context', () => ({
  __esModule: true,
  default: require('react').createContext({
    setCookieModalVisible: jest.fn(),
    cookiesDisabled: false,
  }),
}));

// Mock DocumentListContext
jest.mock('luminComponents/DocumentList/Context', () => ({
  DocumentListContext: require('react').createContext({
    externalDocumentExistenceGuard: jest.fn((doc: any, callback: any) => callback()),
  }),
}));

// Define mock functions after jest.mock calls
const mockSetCookieModalVisible = jest.fn();
const mockExternalDocumentExistenceGuard = jest.fn((doc, callback) => callback());

// Mock hooks
jest.mock('hooks', () => ({
  useHomeMatch: () => ({ isHomePage: mockState.isHomePage }),
}));

// Mock utils
jest.mock('utils/Factory/EventCollection/constants/DocumentEvent', () => ({
  DocumentViewerOpenFrom: {
    HOMEPAGE: 'homepage',
    DOC_LIST: 'doc_list',
  },
}));

// Mock features
jest.mock('features/FeatureConfigs', () => ({
  featureStoragePolicy: {
    externalStorages: ['google', 'dropbox', 'oneDrive'],
  },
}));

// Mock constants
jest.mock('constants/Routers', () => ({
  Routers: {
    VIEWER: '/viewer',
  },
}));

jest.mock('constants/UrlSearchParam', () => ({
  UrlSearchParam: {
    OPEN_FROM: 'openFrom',
  },
}));

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', { value: mockWindowOpen, writable: true });

// Import after mocks
import withRightClickDocument from '../withRightClickDocument';
import CookieWarningContext from 'luminComponents/CookieWarningModal/Context';
import { DocumentListContext } from 'luminComponents/DocumentList/Context';

// Test component
const MockComponent = ({ document }: any) => (
  <div data-testid="mock-component" data-document-id={document._id}>
    Document: {document.name}
  </div>
);

const WrappedComponent = withRightClickDocument(MockComponent);

// Helper to render with contexts
const renderWithContexts = (props: any, contextOverrides: any = {}) => {
  const cookieContext = {
    setCookieModalVisible: mockSetCookieModalVisible,
    cookiesDisabled: contextOverrides.cookiesDisabled ?? false,
  };
  
  const docListContext = {
    externalDocumentExistenceGuard: contextOverrides.externalDocumentExistenceGuard ?? mockExternalDocumentExistenceGuard,
  };

  return render(
    <CookieWarningContext.Provider value={cookieContext as any}>
      <DocumentListContext.Provider value={docListContext as any}>
        <WrappedComponent {...props} />
      </DocumentListContext.Provider>
    </CookieWarningContext.Provider>
  );
};

describe('withRightClickDocument HOC', () => {
  const defaultDocument = {
    _id: 'doc-123',
    name: 'test-document.pdf',
    service: 's3',
    folderData: { name: 'Test Folder' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.cookiesDisabled = false;
    mockState.isHomePage = false;
  });

  describe('Rendering', () => {
    it('renders wrapped component', () => {
      renderWithContexts({ document: defaultDocument });
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('renders context menu wrapper', () => {
      renderWithContexts({ document: defaultDocument });
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    it('passes document id to context menu', () => {
      renderWithContexts({ document: defaultDocument });
      expect(screen.getByTestId('context-menu')).toHaveAttribute('data-id', 'doc-123');
    });

    it('renders document name in wrapped component', () => {
      renderWithContexts({ document: defaultDocument });
      expect(screen.getByText('Document: test-document.pdf')).toBeInTheDocument();
    });
  });

  describe('Uploading state', () => {
    it('does not render context menu when uploading', () => {
      renderWithContexts({ document: defaultDocument, uploading: true });
      expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
    });

    it('still renders wrapped component when uploading', () => {
      renderWithContexts({ document: defaultDocument, uploading: true });
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });
  });

  describe('Open in current tab', () => {
    it('navigates to viewer on click', () => {
      renderWithContexts({ document: defaultDocument });
      fireEvent.click(screen.getByTestId('open-in-current-tab'));
      expect(mockNavigate).toHaveBeenCalledWith('/viewer/doc-123', expect.any(Object));
    });

    it('passes folderName in navigation state', () => {
      renderWithContexts({ document: defaultDocument });
      fireEvent.click(screen.getByTestId('open-in-current-tab'));
      expect(mockNavigate).toHaveBeenCalledWith('/viewer/doc-123', expect.objectContaining({
        state: expect.objectContaining({
          folderName: 'Test Folder',
        }),
      }));
    });

    it('uses doc_list as openFrom when not on homepage', () => {
      mockState.isHomePage = false;
      renderWithContexts({ document: defaultDocument });
      fireEvent.click(screen.getByTestId('open-in-current-tab'));
      expect(mockNavigate).toHaveBeenCalledWith('/viewer/doc-123', expect.objectContaining({
        state: expect.objectContaining({
          openFrom: 'doc_list',
        }),
      }));
    });

    it('uses homepage as openFrom when on homepage', () => {
      mockState.isHomePage = true;
      renderWithContexts({ document: defaultDocument });
      fireEvent.click(screen.getByTestId('open-in-current-tab'));
      expect(mockNavigate).toHaveBeenCalledWith('/viewer/doc-123', expect.objectContaining({
        state: expect.objectContaining({
          openFrom: 'homepage',
        }),
      }));
    });
  });

  describe('Open in new tab', () => {
    it('opens window with correct url', () => {
      renderWithContexts({ document: defaultDocument });
      fireEvent.click(screen.getByTestId('open-in-new-tab'));
      expect(mockWindowOpen).toHaveBeenCalledWith('/viewer/doc-123?openFrom=doc_list', '_blank');
    });

    it('uses homepage openFrom in new tab url', () => {
      mockState.isHomePage = true;
      renderWithContexts({ document: defaultDocument });
      fireEvent.click(screen.getByTestId('open-in-new-tab'));
      expect(mockWindowOpen).toHaveBeenCalledWith('/viewer/doc-123?openFrom=homepage', '_blank');
    });
  });

  describe('Cookie warning for external storages', () => {
    it('shows cookie modal for google documents when cookies disabled', () => {
      const googleDoc = { ...defaultDocument, service: 'google' };
      renderWithContexts({ document: googleDoc }, { cookiesDisabled: true });
      fireEvent.click(screen.getByTestId('open-in-current-tab'));
      expect(mockSetCookieModalVisible).toHaveBeenCalledWith(true);
    });

    it('shows cookie modal for dropbox documents when cookies disabled', () => {
      const dropboxDoc = { ...defaultDocument, service: 'dropbox' };
      renderWithContexts({ document: dropboxDoc }, { cookiesDisabled: true });
      fireEvent.click(screen.getByTestId('open-in-current-tab'));
      expect(mockSetCookieModalVisible).toHaveBeenCalledWith(true);
    });

    it('does not show cookie modal for s3 documents when cookies disabled', () => {
      renderWithContexts({ document: defaultDocument }, { cookiesDisabled: true });
      fireEvent.click(screen.getByTestId('open-in-current-tab'));
      expect(mockSetCookieModalVisible).not.toHaveBeenCalled();
    });

    it('does not show cookie modal for external docs when cookies enabled', () => {
      const googleDoc = { ...defaultDocument, service: 'google' };
      renderWithContexts({ document: googleDoc }, { cookiesDisabled: false });
      fireEvent.click(screen.getByTestId('open-in-current-tab'));
      expect(mockSetCookieModalVisible).not.toHaveBeenCalled();
    });
  });

  describe('External document existence guard', () => {
    it('calls externalDocumentExistenceGuard on open in current tab', () => {
      renderWithContexts({ document: defaultDocument });
      fireEvent.click(screen.getByTestId('open-in-current-tab'));
      expect(mockExternalDocumentExistenceGuard).toHaveBeenCalledWith(defaultDocument, expect.any(Function));
    });

    it('calls externalDocumentExistenceGuard on open in new tab', () => {
      renderWithContexts({ document: defaultDocument });
      fireEvent.click(screen.getByTestId('open-in-new-tab'));
      expect(mockExternalDocumentExistenceGuard).toHaveBeenCalledWith(defaultDocument, expect.any(Function));
    });
  });
});

