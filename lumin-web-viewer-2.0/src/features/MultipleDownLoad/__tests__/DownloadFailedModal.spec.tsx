import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import DownloadFailedModal from '../components/DownloadFailedModal/DownloadFailedModal';
import { ErrorModalType } from '../constants';

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock modal event
jest.mock('utils/Factory/EventCollection/ModalEventCollection', () => ({
  __esModule: true,
  default: {
    modalViewed: jest.fn().mockResolvedValue(undefined),
  },
  ModalName: {
    BULK_DOWNLOAD_ERRORS: 'bulk_download_errors',
  },
}));

// Mock file util
jest.mock('utils/file', () => ({
  __esModule: true,
  default: {
    getFilenameWithoutExtension: (name: string) => {
      const lastDotIndex = name.lastIndexOf('.');
      return lastDotIndex === -1 ? name : name.substring(0, lastDotIndex);
    },
  },
}));

// Mock lumin-ui components
jest.mock('lumin-ui/kiwi-ui', () => ({
  Modal: ({ children, opened, onClose, title, message, onConfirm, confirmButtonProps }: any) => 
    opened ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <p>{message}</p>
        {children}
        <button onClick={onConfirm}>{confirmButtonProps?.title || 'OK'}</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  Table: Object.assign(
    ({ children }: any) => <table>{children}</table>,
    {
      Thead: ({ children }: any) => <thead>{children}</thead>,
      Tbody: ({ children }: any) => <tbody>{children}</tbody>,
      Tr: ({ children }: any) => <tr>{children}</tr>,
      Th: ({ children }: any) => <th>{children}</th>,
      Td: ({ children, className }: any) => <td className={className}>{children}</td>,
    }
  ),
}));

import modalEvent from 'utils/Factory/EventCollection/ModalEventCollection';

const mockStore = configureMockStore([]);

describe('DownloadFailedModal', () => {
  const defaultState = {
    multipleDownload: {
      errorDocuments: [],
      errorModal: {
        type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
        opened: false,
      },
      errorTypes: [],
      hasOpenedDropboxAuthWindow: false,
    },
  };

  const renderWithStore = (state = defaultState) => {
    const store = mockStore(state);
    store.dispatch = jest.fn();
    return {
      ...render(
        <Provider store={store}>
          <DownloadFailedModal />
        </Provider>
      ),
      store,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when modal is closed', () => {
      renderWithStore();
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render when modal is opened', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should render with SOME_ITEMS_FAILED_TO_DOWNLOAD title', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      expect(screen.getByText('multipleDownload.errorModalTitle')).toBeInTheDocument();
      expect(screen.getByText('multipleDownload.errorModalDescription')).toBeInTheDocument();
    });

    it('should render with ALL_ITEMS_FAILED_TO_DOWNLOAD title', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorModal: {
            type: ErrorModalType.ALL_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      expect(screen.getByText('multipleDownload.noneOfTheItemsCouldBeDownloaded')).toBeInTheDocument();
      expect(screen.getByText('multipleDownload.errorModalDescriptionAllItemsFailed')).toBeInTheDocument();
    });
  });

  describe('Error Documents Display', () => {
    it('should display error documents in table', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorDocuments: [
            { _id: '1', name: 'document1.pdf', errorMessage: 'Error message 1' },
            { _id: '2', name: 'document2.pdf', errorMessage: 'Error message 2' },
          ],
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      expect(screen.getByText('document1')).toBeInTheDocument();
      expect(screen.getByText('Error message 1')).toBeInTheDocument();
      expect(screen.getByText('document2')).toBeInTheDocument();
      expect(screen.getByText('Error message 2')).toBeInTheDocument();
    });

    it('should display table headers', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorDocuments: [
            { _id: '1', name: 'doc.pdf', errorMessage: 'Error' },
          ],
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      expect(screen.getByText('common.name')).toBeInTheDocument();
      expect(screen.getByText('multipleDownload.reason')).toBeInTheDocument();
    });

    it('should strip file extension from document name', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorDocuments: [
            { _id: '1', name: 'my-document.pdf', errorMessage: 'Error' },
          ],
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      expect(screen.getByText('my-document')).toBeInTheDocument();
      expect(screen.queryByText('my-document.pdf')).not.toBeInTheDocument();
    });

    it('should handle document name without extension', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorDocuments: [
            { _id: '1', name: 'README', errorMessage: 'Error' },
          ],
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      expect(screen.getByText('README')).toBeInTheDocument();
    });

    it('should handle empty error documents', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorDocuments: [],
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      // Modal should still render with empty table
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  describe('Modal Close Behavior', () => {
    it('should dispatch actions when confirm button is clicked', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      const { store } = renderWithStore(state);
      
      fireEvent.click(screen.getByText('common.ok'));
      
      expect(store.dispatch).toHaveBeenCalledTimes(3);
    });

    it('should dispatch actions when close button is clicked', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      const { store } = renderWithStore(state);
      
      fireEvent.click(screen.getByText('Close'));
      
      expect(store.dispatch).toHaveBeenCalledTimes(3);
    });

    it('should dispatch setErrorModalOpened(false) on close', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      const { store } = renderWithStore(state);
      
      fireEvent.click(screen.getByText('common.ok'));
      
      const actions = store.dispatch.mock.calls.map((call) => call[0]);
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: 'MULTIPLE_DOWNLOAD/setErrorModalOpened',
          payload: false,
        })
      );
    });

    it('should dispatch setErrorDocuments([]) on close', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      const { store } = renderWithStore(state);
      
      fireEvent.click(screen.getByText('common.ok'));
      
      const actions = store.dispatch.mock.calls.map((call) => call[0]);
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: 'MULTIPLE_DOWNLOAD/setErrorDocuments',
          payload: [],
        })
      );
    });

    it('should dispatch setErrorTypes([]) on close', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      const { store } = renderWithStore(state);
      
      fireEvent.click(screen.getByText('common.ok'));
      
      const actions = store.dispatch.mock.calls.map((call) => call[0]);
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: 'MULTIPLE_DOWNLOAD/setErrorTypes',
          payload: [],
        })
      );
    });
  });

  describe('Modal Event Tracking', () => {
    it('should track modal viewed event when opened', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      expect(modalEvent.modalViewed).toHaveBeenCalledWith({
        modalName: 'bulk_download_errors',
      });
    });

    it('should not track event when modal is closed', () => {
      renderWithStore();
      
      expect(modalEvent.modalViewed).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle ReactNode error message', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorDocuments: [
            { 
              _id: '1', 
              name: 'doc.pdf', 
              errorMessage: 'Error with link' as any,
            },
          ],
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      expect(screen.getByText('Error with link')).toBeInTheDocument();
    });

    it('should handle multiple documents with same name', () => {
      const state = {
        ...defaultState,
        multipleDownload: {
          ...defaultState.multipleDownload,
          errorDocuments: [
            { _id: '1', name: 'doc.pdf', errorMessage: 'Error 1' },
            { _id: '2', name: 'doc.pdf', errorMessage: 'Error 2' },
          ],
          errorModal: {
            type: ErrorModalType.SOME_ITEMS_FAILED_TO_DOWNLOAD,
            opened: true,
          },
        },
      };
      
      renderWithStore(state);
      
      // Both documents should be displayed
      const docCells = screen.getAllByText('doc');
      expect(docCells).toHaveLength(2);
    });
  });
});

