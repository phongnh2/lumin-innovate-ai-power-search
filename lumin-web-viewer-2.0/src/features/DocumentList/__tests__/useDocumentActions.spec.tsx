import React from 'react';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-router
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/documents' }),
}));

// Mock CookieWarningContext
jest.mock('lumin-components/CookieWarningModal/Context', () => ({
  __esModule: true,
  default: require('react').createContext({
    setCookieModalVisible: jest.fn(),
    cookiesDisabled: false,
  }),
}));

const mockSetCookieModalVisible = jest.fn();

// Mock useRequestAccessModal
jest.mock('luminComponents/DocumentItemContainer/hooks', () => ({
  useRequestAccessModal: () => ({
    element: require('react').createElement('div', { 'data-testid': 'request-modal' }),
    openModal: jest.fn(),
  }),
}));

// Mock DocumentListContext
jest.mock('luminComponents/DocumentList/Context', () => ({
  DocumentListContext: require('react').createContext({
    externalDocumentExistenceGuard: jest.fn((doc: any, cb: any) => cb()),
  }),
}));

const mockOpenRequestModal = jest.fn();
const mockExternalDocumentExistenceGuard = jest.fn((doc, cb) => cb());

// Mock executeCopyText
jest.mock('luminComponents/RightSideBarContent/utils', () => ({
  executeCopyText: jest.fn().mockResolvedValue(undefined),
}));

// Mock cachingFileHandler
jest.mock('HOC/OfflineStorageHOC', () => ({
  cachingFileHandler: {
    isSourceDownloadSuccess: jest.fn().mockReturnValue(false),
    subServiceWorkerHandler: jest.fn(),
    unSubServiceWorkerHandler: jest.fn(),
  },
}));

// Mock hooks
jest.mock('hooks', () => ({
  useGetCurrentUser: () => ({ _id: 'user-123' }),
  useHomeMatch: () => ({ isHomePage: false }),
  useOfflineAction: () => ({
    makeOffline: jest.fn(() => jest.fn()),
    pendingDownloadedDocument: null,
    setPendingDownloadedDocument: jest.fn(),
    onDownloadDocument: jest.fn(),
  }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock services
jest.mock('services/graphServices', () => ({
  documentGraphServices: {
    starDocumentMutation: jest.fn().mockResolvedValue({}),
  },
}));

// Mock utils
jest.mock('utils', () => ({
  eventTracking: jest.fn().mockResolvedValue({}),
  getShareLink: (id: string) => `https://app.luminpdf.com/doc/${id}`,
  toastUtils: { success: jest.fn(), openToastMulti: jest.fn() },
}));
jest.mock('utils/Factory/EventCollection/constants/DocumentEvent', () => ({
  DocumentViewerOpenFrom: { HOMEPAGE: 'homepage', DOC_LIST: 'doc_list' },
}));
jest.mock('utils/getLanguage', () => ({
  getLanguage: () => 'en',
  getLanguageFromUrl: () => 'en',
}));

// Mock socket
jest.mock('@socket', () => ({ socket: { emit: jest.fn() } }));

// Mock features
jest.mock('features/FeatureConfigs', () => ({
  featureStoragePolicy: { externalStorages: ['google', 'dropbox', 'oneDrive'] },
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  DocumentActions: { View: 'view', MakeACopy: 'makeACopy', Rename: 'rename', Share: 'share', Remove: 'remove', Move: 'move' },
  DocumentRole: { OWNER: 'owner', SHARER: 'sharer' },
}));
jest.mock('constants/eventConstants', () => ({ __esModule: true, default: { EventType: { REQUEST_DOCUMENT_PERMISSION: 'request_permission' } } }));
jest.mock('constants/language', () => ({ LANGUAGES: { EN: 'en' } }));
jest.mock('constants/lumin-common', () => ({ ModalTypes: { ERROR: 'error' }, STORAGE_TYPE: { GOOGLE: 'google', DROPBOX: 'dropbox', ONEDRIVE: 'oneDrive' } }));
jest.mock('constants/Routers', () => ({ Routers: { VIEWER: '/viewer' } }));
jest.mock('constants/socketConstant', () => ({ SOCKET_EMIT: { UPDATE_DOCUMENT: 'update_document' } }));
jest.mock('constants/urls', () => ({ BASEURL: 'https://app.luminpdf.com' }));

import useDocumentActions from '../hooks/useDocumentActions';
import { documentGraphServices } from 'services/graphServices';
import { toastUtils } from 'utils';
import { socket } from '@socket';

describe('useDocumentActions', () => {
  const mockDocument = {
    _id: 'doc-123',
    name: 'test.pdf',
    service: 's3',
    roleOfDocument: 'owner',
  };

  const mockOpenDocumentModal = jest.fn();
  const mockRefetchDocument = jest.fn();

  const defaultProps = {
    document: mockDocument as any,
    openDocumentModal: mockOpenDocumentModal,
    refetchDocument: mockRefetchDocument,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns actions object', () => {
    const { result } = renderHook(() => useDocumentActions(defaultProps));
    expect(result.current.actions).toBeDefined();
  });

  it('returns requestModalElement', () => {
    const { result } = renderHook(() => useDocumentActions(defaultProps));
    expect(result.current.requestModalElement).toBeDefined();
  });

  describe('actions', () => {
    it('viewInfo opens document modal with View mode', () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      act(() => result.current.actions.viewInfo());
      expect(mockOpenDocumentModal).toHaveBeenCalledWith({ mode: 'view', selectedDocuments: [mockDocument] });
    });

    it('makeACopy opens document modal with MakeACopy mode', () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      act(() => result.current.actions.makeACopy());
      expect(mockOpenDocumentModal).toHaveBeenCalledWith({ mode: 'makeACopy', selectedDocuments: [mockDocument] });
    });

    it('rename opens document modal with Rename mode', () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      act(() => result.current.actions.rename());
      expect(mockOpenDocumentModal).toHaveBeenCalledWith({ mode: 'rename', selectedDocuments: [mockDocument] });
    });

    it('remove opens document modal with Remove mode', () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      act(() => result.current.actions.remove());
      expect(mockOpenDocumentModal).toHaveBeenCalledWith({ mode: 'remove', selectedDocuments: [mockDocument] });
    });

    it('move opens document modal with Move mode', () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      act(() => result.current.actions.move());
      expect(mockOpenDocumentModal).toHaveBeenCalledWith({ mode: 'move', selectedDocuments: [mockDocument] });
    });

    it('share opens document modal for owner', () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      act(() => result.current.actions.share());
      expect(mockOpenDocumentModal).toHaveBeenCalledWith({ mode: 'share', selectedDocuments: [mockDocument] });
    });

    it('share handles non-owner/sharer role', () => {
      const props = { ...defaultProps, document: { ...mockDocument, roleOfDocument: 'viewer' } as any };
      const { result } = renderHook(() => useDocumentActions(props));
      // Should not throw when called
      expect(() => act(() => result.current.actions.share())).not.toThrow();
    });

    it('copyLink copies share link and shows toast', () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      act(() => result.current.actions.copyLink());
      expect(toastUtils.success).toHaveBeenCalledWith(expect.objectContaining({ message: 'modalShare.hasBeenCopied' }));
    });

    it('markFavorite calls starDocumentMutation', async () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      await act(async () => await result.current.actions.markFavorite());
      expect(documentGraphServices.starDocumentMutation).toHaveBeenCalled();
    });

    it('markFavorite emits socket event', async () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      await act(async () => await result.current.actions.markFavorite());
      expect(socket.emit).toHaveBeenCalledWith('update_document', { roomId: 'doc-123', type: 'star' });
    });

    it('open navigates to viewer', () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      act(() => result.current.actions.open());
      expect(mockNavigate).toHaveBeenCalledWith('/viewer/doc-123', expect.any(Object));
    });

    it('open handles document opening', () => {
      const { result } = renderHook(() => useDocumentActions(defaultProps));
      // Should call navigate through the guard chain
      act(() => result.current.actions.open());
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('isDisabledSelection', () => {
    it('open does nothing when isDisabledSelection is true', () => {
      const props = { ...defaultProps, isDisabledSelection: true };
      const { result } = renderHook(() => useDocumentActions(props));
      act(() => result.current.actions.open());
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

