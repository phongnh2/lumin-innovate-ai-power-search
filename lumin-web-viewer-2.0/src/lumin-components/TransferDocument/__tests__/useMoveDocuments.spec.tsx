import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock hooks
const mockT = jest.fn((key) => key);
const mockShowModal = jest.fn();

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: mockT }),
  useEnableWebReskin: () => ({ isEnableReskin: false }),
  useStrictDownloadGooglePerms: () => ({ showModal: mockShowModal }),
  usePaymentUrlDestination: () => ({
    paymentUrl: '/payment',
    isManager: true,
    contentUrl: 'Upgrade',
    orgDestination: { _id: 'org-123', payment: { type: 'free' } },
  }),
}));

// Mock services
const mockMoveDocuments = jest.fn();
const mockMoveDocumentsToFolder = jest.fn();
const mockLinearPdfFromFiles = jest.fn();

jest.mock('services', () => ({
  documentServices: {
    moveDocuments: (...args: unknown[]) => mockMoveDocuments(...args),
    moveDocumentsToFolder: (...args: unknown[]) => mockMoveDocumentsToFolder(...args),
  },
  uploadServices: {
    linearPdfFromFiles: (...args: unknown[]) => mockLinearPdfFromFiles(...args),
  },
}));

// Mock utils
const mockGetFile = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockToastInfo = jest.fn();
const mockEventTracking = jest.fn();

jest.mock('utils', () => ({
  toastUtils: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
    info: (...args: unknown[]) => mockToastInfo(...args),
  },
  getFile: (...args: unknown[]) => mockGetFile(...args),
  eventTracking: (...args: unknown[]) => mockEventTracking(...args),
}));

const mockExtractGqlError = jest.fn();
const mockIsGraphError = jest.fn();

jest.mock('utils/error', () => ({
  extractGqlError: (...args: unknown[]) => mockExtractGqlError(...args),
  isGraphError: (...args: unknown[]) => mockIsGraphError(...args),
}));

jest.mock('utils/errorInterceptor', () => ({
  getDocumentErrorMessage: jest.fn().mockReturnValue('Unknown error'),
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  documentStorage: {
    s3: 's3',
    google: 'google',
    dropbox: 'dropbox',
    onedrive: 'onedrive',
  },
  DOCUMENT_TYPE: {
    PERSONAL: 'PERSONAL',
    ORGANIZATION: 'ORGANIZATION',
    ORGANIZATION_TEAM: 'ORGANIZATION_TEAM',
    FOLDER: 'FOLDER',
  },
  DocumentStorage: {
    GOOGLE: 'GOOGLE',
  },
}));

jest.mock('constants/errorCode', () => ({
  ErrorCode: {
    Document: { ORG_REACHED_DOC_STACK_LIMIT: 'ORG_REACHED_DOC_STACK_LIMIT' },
    Common: { RESTRICTED_ACTION: 'RESTRICTED_ACTION' },
  },
  GoogleErrorCode: { CANNOT_DOWNLOAD_FILE: 'CANNOT_DOWNLOAD_FILE' },
}));

jest.mock('constants/eventConstants', () => ({
  EventType: { CONVERT_FILE_TO_LUMIN: 'CONVERT_FILE_TO_LUMIN' },
}));

jest.mock('constants/lumin-common', () => ({
  MAXIMUM_FILE_SIZE: {
    FREE_PLAN: 50,
    PREMIUM_PLAN: 500,
  },
}));

jest.mock('constants/messages', () => ({
  ERROR_MESSAGE_DOCUMENT: { MOVE_DOCUMENT_FAILED: 'Move failed' },
  ERROR_MESSAGE_RESTRICTED_ACTION: 'Restricted action',
  ERROR_MESSAGE_TYPE: { PDF_CANCEL_PASSWORD: 'PDF_CANCEL_PASSWORD' },
  ERROR_MESSAGE_UNKNOWN_ERROR: 'Unknown error',
  getUploadOverFileSizeError: (size: number) => `File exceeds ${size}MB limit`,
}));

jest.mock('constants/plan', () => ({
  Plans: { FREE: 'free' },
}));

// Mock styled
jest.mock('../TransferDocument.styled', () => ({
  CustomLink: ({ children }: React.PropsWithChildren<object>) => <a>{children}</a>,
}));

// Import after mocks
import { useMoveDocuments } from '../hooks/useMoveDocuments';
import { DestinationLocation } from '../interfaces/TransferDocument.interface';

describe('useMoveDocuments', () => {
  const mockSetOpenConfirmModal = jest.fn();
  const mockSetError = jest.fn();
  const mockOnClose = jest.fn();
  const mockSetIsMoving = jest.fn();

  const defaultHookProps = {
    destination: {
      _id: 'org-123',
      name: 'Test Organization',
      type: DestinationLocation.ORGANIZATION,
      belongsTo: {
        _id: 'org-123',
        name: 'Organization',
        type: DestinationLocation.ORGANIZATION,
      },
    },
    setOpenConfirmModal: mockSetOpenConfirmModal,
    setError: mockSetError,
    selectedTarget: { _id: 'org-123', name: 'Test Org' } as any,
  };

  const mockDocuments = [
    {
      _id: 'doc-123',
      name: 'test.pdf',
      service: 's3',
      size: 1024 * 1024, // 1MB
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockMoveDocuments.mockResolvedValue({});
    mockMoveDocumentsToFolder.mockResolvedValue({});
    mockGetFile.mockResolvedValue(new Blob(['test']));
    mockLinearPdfFromFiles.mockResolvedValue({ linearizedFile: new Blob(['test']) });
    mockExtractGqlError.mockReturnValue({ code: '' });
    mockIsGraphError.mockReturnValue(false);
    mockEventTracking.mockResolvedValue({});
  });

  it('should return moveDocuments function', () => {
    const { result } = renderHook(() => useMoveDocuments(defaultHookProps));
    expect(result.current.moveDocuments).toBeDefined();
    expect(typeof result.current.moveDocuments).toBe('function');
  });

  describe('moveDocuments', () => {
    it('should call documentServices.moveDocuments for s3 documents', async () => {
      const { result } = renderHook(() => useMoveDocuments(defaultHookProps));

      await act(async () => {
        await result.current.moveDocuments({
          documents: mockDocuments as any,
          isNotify: false,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      await waitFor(() => {
        expect(mockMoveDocuments).toHaveBeenCalled();
      });
    });

    it('should call onClose on success', async () => {
      const { result } = renderHook(() => useMoveDocuments(defaultHookProps));

      await act(async () => {
        await result.current.moveDocuments({
          documents: mockDocuments as any,
          isNotify: false,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show success toast on successful move', async () => {
      const { result } = renderHook(() => useMoveDocuments(defaultHookProps));

      await act(async () => {
        await result.current.moveDocuments({
          documents: mockDocuments as any,
          isNotify: false,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalled();
      });
    });

    it('should set isMoving to true then false', async () => {
      const { result } = renderHook(() => useMoveDocuments(defaultHookProps));

      await act(async () => {
        await result.current.moveDocuments({
          documents: mockDocuments as any,
          isNotify: false,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      expect(mockSetIsMoving).toHaveBeenCalledWith(true);
      expect(mockSetIsMoving).toHaveBeenLastCalledWith(false);
    });

    it('should close confirm modal after move', async () => {
      const { result } = renderHook(() => useMoveDocuments(defaultHookProps));

      await act(async () => {
        await result.current.moveDocuments({
          documents: mockDocuments as any,
          isNotify: false,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      expect(mockSetOpenConfirmModal).toHaveBeenCalledWith({ isOpen: false, target: null });
    });
  });

  describe('move to folder', () => {
    it('should call moveDocumentsToFolder when destination is folder', async () => {
      const folderProps = {
        ...defaultHookProps,
        destination: {
          _id: 'folder-123',
          name: 'Test Folder',
          type: DestinationLocation.FOLDER,
          belongsTo: {
            _id: 'org-123',
            type: DestinationLocation.ORGANIZATION,
          },
        },
      };

      const { result } = renderHook(() => useMoveDocuments(folderProps as any));

      await act(async () => {
        await result.current.moveDocuments({
          documents: mockDocuments as any,
          isNotify: false,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      await waitFor(() => {
        expect(mockMoveDocumentsToFolder).toHaveBeenCalled();
      });
    });
  });

  describe('file size validation', () => {
    it('should set error when file size exceeds limit', async () => {
      const largeDocs = [
        {
          _id: 'doc-123',
          name: 'large.pdf',
          service: 's3',
          size: 100 * 1024 * 1024, // 100MB
        },
      ];

      const { result } = renderHook(() => useMoveDocuments(defaultHookProps));

      await act(async () => {
        await result.current.moveDocuments({
          documents: largeDocs as any,
          isNotify: false,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      expect(mockSetError).toHaveBeenCalled();
    });
  });

  describe('third party documents', () => {
    it('should show info toast for third party documents', async () => {
      const googleDocs = [
        {
          _id: 'doc-123',
          name: 'google.pdf',
          service: 'google',
          size: 1024 * 1024,
        },
      ];

      const { result } = renderHook(() => useMoveDocuments(defaultHookProps));

      await act(async () => {
        await result.current.moveDocuments({
          documents: googleDocs as any,
          isNotify: false,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      await waitFor(() => {
        expect(mockToastInfo).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should handle RESTRICTED_ACTION error', async () => {
      mockMoveDocuments.mockRejectedValue(new Error('Restricted'));
      mockIsGraphError.mockReturnValue(true);
      mockExtractGqlError.mockReturnValue({ code: 'RESTRICTED_ACTION' });

      const { result } = renderHook(() => useMoveDocuments(defaultHookProps));

      await act(async () => {
        await result.current.moveDocuments({
          documents: mockDocuments as any,
          isNotify: false,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      expect(mockSetError).toHaveBeenCalledWith('Restricted action');
    });

    it('should handle ORG_REACHED_DOC_STACK_LIMIT error', async () => {
      mockMoveDocuments.mockRejectedValue(new Error('Doc stack limit'));
      mockIsGraphError.mockReturnValue(true);
      mockExtractGqlError.mockReturnValue({ code: 'ORG_REACHED_DOC_STACK_LIMIT' });

      const { result } = renderHook(() => useMoveDocuments(defaultHookProps));

      await act(async () => {
        await result.current.moveDocuments({
          documents: mockDocuments as any,
          isNotify: false,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      expect(mockSetError).toHaveBeenCalled();
    });
  });

  describe('notify option', () => {
    it('should pass isNotify to service', async () => {
      const { result } = renderHook(() => useMoveDocuments(defaultHookProps));

      await act(async () => {
        await result.current.moveDocuments({
          documents: mockDocuments as any,
          isNotify: true,
          onClose: mockOnClose,
          setIsMoving: mockSetIsMoving,
        });
      });

      expect(mockMoveDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ isNotify: true })
      );
    });
  });
});

