import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import useHandleDownloadMultipleDocs from '../hooks/useHandleDownloadMultipleDocs';
import { ErrorModalType } from '../constants';

// Mock dependencies
jest.mock('dayjs', () => {
  const mockDayjs = () => ({
    format: () => '20231210T120000',
  });
  return mockDayjs;
});

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  closeSnackbar: jest.fn(),
}));

// Mock actions and selectors
jest.mock('actions', () => ({
  __esModule: true,
  default: {
    openModal: jest.fn((settings) => ({ type: 'OPEN_MODAL', payload: settings })),
    closeElement: jest.fn((element) => ({ type: 'CLOSE_ELEMENT', payload: element })),
    openElement: jest.fn((element) => ({ type: 'OPEN_ELEMENT', payload: element })),
    setPasswordProtectedDocumentName: jest.fn((name) => ({ type: 'SET_PASSWORD_NAME', payload: name })),
    setPasswordAttempts: jest.fn((attempts) => ({ type: 'SET_PASSWORD_ATTEMPTS', payload: attempts })),
  },
}));

jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getOrganizationList: (state: any) => state.organizations,
  },
}));

jest.mock('store', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      multipleDownload: {
        errorTypes: [],
        errorDocuments: [],
      },
    }),
  },
}));

// Mock context - create context inside the mock factory to avoid hoisting issues
const mockContextValue = {
  selectedDocList: [] as any[],
  selectedFolders: [] as any[],
};

jest.mock('luminComponents/Document/context', () => {
  const React = require('react');
  const MockDocumentContext = React.createContext({
    selectedDocList: [],
    selectedFolders: [],
  });
  return {
    DocumentContext: MockDocumentContext,
  };
});

// Mock hooks
const mockCurrentOrganization = { _id: 'org-1' };
const mockHitDocStackModalSettings = { type: 'DOC_STACK_MODAL' };

jest.mock('hooks', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params) {
        return `${key} ${JSON.stringify(params)}`;
      }
      return key;
    },
  }),
  useGetCurrentOrganization: () => mockCurrentOrganization,
  useHitDocStackModalForOrgMembers: () => mockHitDocStackModalSettings,
  useShallowSelector: () => [],
}));

// Mock feature hooks
jest.mock('features/MultipleDownLoad/hooks/useHandleCheckPermission', () => ({
  __esModule: true,
  default: () => ({
    checkDriveDocument: jest.fn().mockResolvedValue(undefined),
    checkOneDriveDocument: jest.fn().mockResolvedValue(undefined),
    checkDropboxDocument: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('features/MultipleDownLoad/hooks/useHandleError', () => ({
  useHandleError: () => ({
    getOneDriveErrorMessage: jest.fn().mockReturnValue({ errorMessage: 'error', errorType: 'ERROR' }),
    getGoogleDriveErrorMessage: jest.fn().mockReturnValue({ errorMessage: 'error', errorType: 'ERROR' }),
    getDropboxErrorMessage: jest.fn().mockReturnValue({ errorMessage: 'error', errorType: 'ERROR' }),
  }),
}));

// Mock services
const mockCheckDownloadMultipleDocuments = jest.fn();

jest.mock('services', () => ({
  documentServices: {
    checkDownloadMultipleDocuments: (...args: any[]) => mockCheckDownloadMultipleDocuments(...args),
    updateStackedDocuments: jest.fn().mockResolvedValue({}),
  },
  organizationServices: {
    isManager: jest.fn().mockReturnValue(false),
  },
}));

jest.mock('services/graphServices', () => ({
  documentGraphServices: {
    getDocumentsInFolder: jest.fn().mockResolvedValue({ documents: [] }),
  },
}));

jest.mock('services/graphServices/folder', () => ({
  getFolderTree: jest.fn().mockResolvedValue({ folders: [] }),
}));

// Mock helpers
jest.mock('helpers/device', () => ({
  isIE: false,
}));

jest.mock('helpers/getOrgOfDoc', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(null),
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logInfo: jest.fn(),
  },
}));

jest.mock('helpers/sequentialRequestBuilder', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(async (items, fn) => {
    const results = [];
    for (const item of items) {
      results.push(await fn(item));
    }
    return results;
  }),
}));

// Mock utils
jest.mock('utils/Factory/EventCollection/DocActionsEventCollection', () => ({
  __esModule: true,
  default: {
    bulkDownloadError: jest.fn().mockResolvedValue(undefined),
    bulkDownloadSuccess: jest.fn().mockResolvedValue(undefined),
    bulkActions: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('utils/file', () => ({
  __esModule: true,
  default: {
    convertExtensionToPdf: (name: string) => name.replace(/\.[^.]+$/, '.pdf'),
  },
}));

jest.mock('utils/payment', () => ({
  PaymentUrlSerializer: jest.fn().mockImplementation(() => ({
    of: () => ({
      returnUrlParam: () => ({
        pro: '/payment/pro',
      }),
    }),
  })),
}));

jest.mock('utils/toastUtils', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn().mockResolvedValue(undefined),
    openUnknownErrorToast: jest.fn(),
  },
}));

// Mock slice actions
jest.mock('../slice', () => ({
  setErrorModalOpened: jest.fn((opened) => ({ type: 'SET_ERROR_MODAL_OPENED', payload: opened })),
  addErrorType: jest.fn((type) => ({ type: 'ADD_ERROR_TYPE', payload: type })),
  addErrorDocument: jest.fn((doc) => ({ type: 'ADD_ERROR_DOCUMENT', payload: doc })),
  setErrorModalType: jest.fn((type) => ({ type: 'SET_ERROR_MODAL_TYPE', payload: type })),
  resetHasOpenedDropboxAuthWindow: jest.fn(() => ({ type: 'RESET_DROPBOX_WINDOW' })),
}));

// Mock utils
jest.mock('../utils', () => ({
  getUniqueName: jest.fn(({ name }) => name),
}));

// Mock constants
jest.mock('constants/dataElement', () => ({
  DataElements: {
    PASSWORD_MODAL: 'PASSWORD_MODAL',
  },
}));

jest.mock('constants/documentConstants', () => ({
  documentStorage: {
    google: 'google',
    onedrive: 'onedrive',
    dropbox: 'dropbox',
  },
  modifiedFilter: {
    modifiedByAnyone: 'modifiedByAnyone',
  },
  ownerFilter: {
    byAnyone: 'byAnyone',
  },
}));

jest.mock('constants/documentType', () => ({
  general: {
    PDF: 'application/pdf',
  },
}));

// Mock features
jest.mock('features/MultipleMerge/core/documentItem/remote', () => ({
  RemoteDocumentItem: jest.fn().mockImplementation(() => ({
    getDocumentData: jest.fn().mockResolvedValue({
      document: {},
      annotations: [],
      outlines: [],
      buffer: new ArrayBuffer(8),
      fields: [],
      signedUrls: [],
      status: 'SUCCESS',
      metadata: {},
    }),
  })),
}));

jest.mock('features/MultipleMerge/enum', () => ({
  UploadStatus: {
    FAILED: 'FAILED',
  },
  UploadDocumentError: {
    FILE_ENCRYPTED: 'FILE_ENCRYPTED',
  },
}));

jest.mock('features/PdfProcessor/pdfProcessor', () => ({
  PdfProcessor: jest.fn().mockImplementation(() => ({
    process: jest.fn().mockResolvedValue({
      saveMemoryBuffer: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    }),
  })),
}));

// Mock global
(global as any).window = {
  ...global.window,
  Core: {
    PDFNet: {
      SDFDoc: {
        SaveOptions: {
          e_linearized: 1,
        },
      },
    },
  },
};

import { saveAs } from 'file-saver';
import { closeSnackbar } from 'lumin-ui/kiwi-ui';
import toastUtils from 'utils/toastUtils';
import docActionsEvent from 'utils/Factory/EventCollection/DocActionsEventCollection';
import { DocumentContext } from 'luminComponents/Document/context';

const mockStore = configureMockStore([]);

describe('useHandleDownloadMultipleDocs', () => {
  const defaultState = {
    organizations: [],
    multipleDownload: {
      errorTypes: [],
      errorDocuments: [],
      hasOpenedDropboxAuthWindow: false,
    },
  };

  let selectedDocs: any[] = [];
  let selectedFolders: any[] = [];

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const store = mockStore(defaultState);
    return (
      <Provider store={store}>
        <DocumentContext.Provider value={{ selectedDocList: selectedDocs, selectedFolders } as any}>
          {children}
        </DocumentContext.Provider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    selectedDocs = [];
    selectedFolders = [];
    
    mockCheckDownloadMultipleDocuments.mockResolvedValue({
      isDocStackInsufficient: false,
      isDocumentLimitExceeded: false,
      isTotalSizeExceeded: false,
      totalDocuments: 0,
    });
  });

  describe('hook initialization', () => {
    it('should return onDownload function', () => {
      const { result } = renderHook(() => useHandleDownloadMultipleDocs(), { wrapper });
      
      expect(typeof result.current.onDownload).toBe('function');
    });
  });

  describe('checkDownloadConditions', () => {
    it('should call checkDownloadMultipleDocuments with correct params', async () => {
      selectedDocs = [{ _id: 'doc-1' }, { _id: 'doc-2' }];
      selectedFolders = [{ _id: 'folder-1' }];
      
      mockCheckDownloadMultipleDocuments.mockResolvedValue({
        isDocStackInsufficient: false,
        isDocumentLimitExceeded: false,
        isTotalSizeExceeded: false,
        totalDocuments: 2,
      });
      
      const { result } = renderHook(() => useHandleDownloadMultipleDocs(), { wrapper });
      
      await act(async () => {
        await result.current.onDownload();
      });
      
      expect(mockCheckDownloadMultipleDocuments).toHaveBeenCalledWith({
        orgId: 'org-1',
        documentIds: ['doc-1', 'doc-2'],
        folderIds: ['folder-1'],
      });
    });

    it('should show error toast when document limit is exceeded', async () => {
      mockCheckDownloadMultipleDocuments.mockResolvedValue({
        isDocStackInsufficient: false,
        isDocumentLimitExceeded: true,
        isTotalSizeExceeded: false,
        totalDocuments: 25,
      });
      
      const { result } = renderHook(() => useHandleDownloadMultipleDocs(), { wrapper });
      
      await act(async () => {
        await result.current.onDownload();
      });
      
      expect(toastUtils.error).toHaveBeenCalled();
    });

    it('should show error toast when total size is exceeded', async () => {
      mockCheckDownloadMultipleDocuments.mockResolvedValue({
        isDocStackInsufficient: false,
        isDocumentLimitExceeded: false,
        isTotalSizeExceeded: true,
        totalDocuments: 10,
      });
      
      const { result } = renderHook(() => useHandleDownloadMultipleDocs(), { wrapper });
      
      await act(async () => {
        await result.current.onDownload();
      });
      
      expect(toastUtils.error).toHaveBeenCalled();
    });

    it('should show unknown error toast when API fails', async () => {
      mockCheckDownloadMultipleDocuments.mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useHandleDownloadMultipleDocs(), { wrapper });
      
      await act(async () => {
        await result.current.onDownload();
      });
      
      expect(toastUtils.openUnknownErrorToast).toHaveBeenCalled();
    });
  });

  describe('download flow', () => {
    it('should show preparing toast when download starts', async () => {
      mockCheckDownloadMultipleDocuments.mockResolvedValue({
        isDocStackInsufficient: false,
        isDocumentLimitExceeded: false,
        isTotalSizeExceeded: false,
        totalDocuments: 1,
      });
      
      selectedDocs = [{ _id: 'doc-1', name: 'test.pdf', isOverTimeLimit: false }];
      
      const { result } = renderHook(() => useHandleDownloadMultipleDocs(), { wrapper });
      
      await act(async () => {
        await result.current.onDownload();
      });
      
      expect(toastUtils.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'multipleDownload.preparing',
          persist: true,
        })
      );
    });

    it('should track bulk actions event', async () => {
      mockCheckDownloadMultipleDocuments.mockResolvedValue({
        isDocStackInsufficient: false,
        isDocumentLimitExceeded: false,
        isTotalSizeExceeded: false,
        totalDocuments: 2,
      });
      
      selectedDocs = [{ _id: 'doc-1' }, { _id: 'doc-2' }];
      selectedFolders = [{ _id: 'folder-1' }];
      
      const { result } = renderHook(() => useHandleDownloadMultipleDocs(), { wrapper });
      
      await act(async () => {
        await result.current.onDownload();
      });
      
      expect(docActionsEvent.bulkActions).toHaveBeenCalledWith({
        actionName: 'download',
        numberSelectedDocs: 2,
        numberSelectedFolders: 1,
      });
    });
  });

  describe('expired documents', () => {
    it('should handle all documents expired', async () => {
      mockCheckDownloadMultipleDocuments.mockResolvedValue({
        isDocStackInsufficient: false,
        isDocumentLimitExceeded: false,
        isTotalSizeExceeded: false,
        totalDocuments: 1,
      });
      
      selectedDocs = [{ _id: 'doc-1', name: 'test.pdf', isOverTimeLimit: true }];
      selectedFolders = [];
      
      const { result } = renderHook(() => useHandleDownloadMultipleDocs(), { wrapper });
      
      await act(async () => {
        await result.current.onDownload();
      });
      
      // Should not show preparing toast since all docs are expired
      expect(toastUtils.info).not.toHaveBeenCalled();
    });
  });

  describe('doc stack insufficient', () => {
    it('should open modal when doc stack is insufficient', async () => {
      mockCheckDownloadMultipleDocuments.mockResolvedValue({
        isDocStackInsufficient: true,
        isDocumentLimitExceeded: false,
        isTotalSizeExceeded: false,
        totalDocuments: 5,
      });
      
      const store = mockStore(defaultState);
      store.dispatch = jest.fn();
      
      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
          <DocumentContext.Provider value={{ selectedDocList: [], selectedFolders: [] } as any}>
            {children}
          </DocumentContext.Provider>
        </Provider>
      );
      
      const { result } = renderHook(() => useHandleDownloadMultipleDocs(), { wrapper: customWrapper });
      
      await act(async () => {
        await result.current.onDownload();
      });
      
      // Should dispatch openModal action
      expect(store.dispatch).toHaveBeenCalled();
    });
  });
});

