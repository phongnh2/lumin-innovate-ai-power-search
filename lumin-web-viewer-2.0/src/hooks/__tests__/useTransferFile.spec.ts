import { renderHook, act } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';

import { useTransferFile } from '../useTransferFile';
import { IDocumentBase } from 'interfaces/document/document.interface';

// Mock react-redux
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  shallowEqual: jest.fn(),
}));

// Mock hooks - create stable mock functions that can be tracked
const mockShowModal = jest.fn();
const mockOpenRestrictedFileSizeModal = jest.fn();

jest.mock('../useStrictDownloadGooglePerms', () => ({
  __esModule: true,
  default: () => ({
    showModal: mockShowModal,
  }),
}));

jest.mock('../useRestrictedFileSizeModal', () => ({
  __esModule: true,
  default: () => ({
    openRestrictedFileSizeModal: mockOpenRestrictedFileSizeModal,
  }),
}));

jest.mock('../useViewerMatch', () => ({
  useViewerMatch: jest.fn(() => ({ isViewer: false })),
}));

jest.mock('../useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock services - define mocks inside the factory to avoid hoisting issues
jest.mock('services', () => ({
  googleServices: {
    getCurrentRemoteEmail: jest.fn(),
    isSignedIn: jest.fn(() => true),
    implicitSignIn: jest.fn(() => Promise.resolve()),
    removeImplicitAccessToken: jest.fn(),
  },
  uploadServices: {
    checkUploadBySize: jest.fn(() => ({ allowedUpload: true, maxSizeAllow: 100 })),
    linearPdfFromFiles: jest.fn(() => Promise.resolve({ linearizedFile: new File(['test'], 'test.pdf') })),
  },
  documentServices: {
    uploadDocumentWithThumbnailToS3: jest.fn(() => Promise.resolve({ encodedUploadData: 'encoded-data' })),
  },
}));

// Mock PersonalDocumentUploadService
jest.mock('services/personalDocumentUploadService', () => {
  const mockUpload = jest.fn(() => Promise.resolve({ _id: 'new-doc-id' }));
  return jest.fn().mockImplementation(() => ({
    upload: mockUpload,
  }));
});

// Mock logger
jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logInfo: jest.fn(),
    logError: jest.fn(),
  },
}));

// Mock utils
jest.mock('utils', () => ({
  file: { getFileSizeLimit: jest.fn(() => '100MB') },
  getFileService: { getDocument: jest.fn() },
  toastUtils: { error: jest.fn() },
  validator: { validatePremiumOrganization: jest.fn(() => true) },
}));

// Mock socket
jest.mock('src/socket', () => ({
  socket: { emit: jest.fn() },
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  documentStorage: {
    google: 'google',
    s3: 's3',
    dropbox: 'dropbox',
  },
}));

jest.mock('constants/errorCode', () => ({
  GoogleErrorCode: {
    CANNOT_DOWNLOAD_FILE: 'cannotDownloadFile',
  },
}));

jest.mock('constants/fileSize', () => ({
  TRANSFER_FILE_SIZE_LIMIT: 104857600,
}));

jest.mock('constants/lumin-common', () => ({
  ModalTypes: {
    ERROR: 'ERROR',
  },
  LOGGER: {
    Service: {
      GOOGLE_API_ERROR: 'GOOGLE_API_ERROR',
      GOOGLE_API_INFO: 'GOOGLE_API_INFO',
    },
    EVENT: {
      IS_VALID_GOOGLE_PERMISSION: 'IS_VALID_GOOGLE_PERMISSION',
    },
  },
}));

jest.mock('constants/messages', () => ({
  MESSAGE_OVER_FILE_SIZE: 'MESSAGE_OVER_FILE_SIZE',
}));

jest.mock('constants/plan', () => ({
  Plans: {
    FREE: 'FREE',
    PRO: 'PRO',
  },
}));

jest.mock('constants/socketConstant', () => ({
  SOCKET_EMIT: {
    UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  },
}));

// Mock actions
jest.mock('actions', () => ({
  __esModule: true,
  default: {
    openModal: jest.fn(),
  },
}));

// Mock selectors
jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getCurrentUser: jest.fn(),
    getOrganizationList: jest.fn(),
  },
}));

// Get mocked modules
const { googleServices, uploadServices, documentServices } = jest.requireMock('services');
const { getFileService, toastUtils, validator } = jest.requireMock('utils');
const { socket } = jest.requireMock('src/socket');
const actions = jest.requireMock('actions').default;
const { useViewerMatch } = jest.requireMock('../useViewerMatch');

describe('useTransferFile', () => {
  const mockDispatch = jest.fn();
  const mockRefetchDocument = jest.fn();
  const mockUpdateDocument = jest.fn();
  const mockAfterTransferCallback = jest.fn(() => Promise.resolve());
  const mockSetState = jest.fn();

  const mockCurrentUser = {
    _id: 'user-123',
    email: 'test@example.com',
    payment: { type: 'PRO' },
  };

  const mockOrganizations = {
    data: [
      {
        organization: {
          _id: 'org-123',
          name: 'Test Org',
          payment: { type: 'ORG_PRO' },
        },
      },
    ],
  };

  const createMockDocument = (overrides = {}): IDocumentBase => ({
    _id: 'doc-123',
    clientId: 'client-123',
    documentType: 'PERSONAL',
    isPersonal: true,
    mimeType: 'application/pdf',
    name: 'test.pdf',
    ownerAvatarRemoteId: 'avatar-123',
    ownerId: 'owner-123',
    ownerName: 'Test Owner',
    ownerEmail: 'owner@test.com',
    remoteEmail: 'test@gmail.com',
    remoteId: 'remote-123',
    roleOfDocument: 'owner',
    service: 's3',
    shareSetting: {
      link: 'https://example.com/share',
      linkType: 'ANYONE',
      permission: 'VIEWER',
    },
    size: 1024,
    thumbnail: 'thumb-123',
    documentReference: {
      accountableBy: 'user',
      data: {
        _id: 'ref-123',
        domain: 'test.com',
        payment: { type: 'FREE' } as never,
        userRole: 'admin',
      },
    },
    belongsTo: {
      type: 'organization',
      workspaceId: 'org-123',
      location: {
        _id: 'loc-123',
        ownedOrgId: 'org-123',
        name: 'Test Location',
        url: '/test-location',
      },
    },
    listUserStar: [],
    ...overrides,
  } as IDocumentBase);

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    
    // Setup useSelector to return different values based on call order
    // Hook calls: 1) getCurrentUser, 2) getOrganizationList
    (useSelector as jest.Mock)
      .mockReturnValueOnce(mockCurrentUser)
      .mockReturnValueOnce(mockOrganizations);

    // Reset service mocks to default behavior
    googleServices.isSignedIn.mockReturnValue(true);
    googleServices.getCurrentRemoteEmail.mockResolvedValue('test@gmail.com');
    googleServices.implicitSignIn.mockResolvedValue(undefined);
    uploadServices.checkUploadBySize.mockReturnValue({ allowedUpload: true, maxSizeAllow: 100 });
    uploadServices.linearPdfFromFiles.mockResolvedValue({ linearizedFile: new File(['test'], 'test.pdf') });
    documentServices.uploadDocumentWithThumbnailToS3.mockResolvedValue({ encodedUploadData: 'encoded-data' });
    getFileService.getDocument.mockResolvedValue(new File(['test'], 'test.pdf'));
    validator.validatePremiumOrganization.mockReturnValue(true);

    // Reset hook mocks
    useViewerMatch.mockReturnValue({ isViewer: false });
  });

  describe('hook initialization', () => {
    it('should return handleConfirmTransferFile function', () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      expect(result.current.handleConfirmTransferFile).toBeDefined();
      expect(typeof result.current.handleConfirmTransferFile).toBe('function');
    });

    it('should work with default empty callbacks', () => {
      const { result } = renderHook(() => useTransferFile({}));

      expect(result.current.handleConfirmTransferFile).toBeDefined();
    });
  });

  describe('handleConfirmTransferFile with S3 service', () => {
    it('should transfer file successfully for S3 storage', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockSetState).toHaveBeenCalledWith({ isTransfering: true });
      expect(mockAfterTransferCallback).toHaveBeenCalled();
      expect(mockSetState).toHaveBeenCalledWith({ isInLuminStorage: true });
    });

    it('should not check Google sign-in for S3 service', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(googleServices.isSignedIn).not.toHaveBeenCalled();
    });

    it('should skip upload size check for S3 service', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(uploadServices.checkUploadBySize).not.toHaveBeenCalled();
    });
  });

  describe('handleConfirmTransferFile with Google service', () => {
    it('should check Google sign-in status for Google service', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(googleServices.isSignedIn).toHaveBeenCalled();
    });

    it('should trigger Google sign-in when not signed in', async () => {
      googleServices.isSignedIn.mockReturnValue(false);
      googleServices.implicitSignIn.mockImplementation(({ callback }: { callback: () => void }) => {
        callback();
        return Promise.resolve();
      });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(googleServices.implicitSignIn).toHaveBeenCalled();
    });

    it('should abort transfer when Google sign-in fails', async () => {
      googleServices.isSignedIn.mockReturnValue(false);
      googleServices.implicitSignIn.mockImplementation(({ onError }: { onError: (err: { message: string }) => void }) => {
        onError({ message: 'Sign-in failed' });
        return Promise.resolve();
      });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockSetState).toHaveBeenCalledWith({ isShareLinkOpen: false, isTransfering: false });
      expect(mockAfterTransferCallback).not.toHaveBeenCalled();
    });

    it('should check Google permission for Google service', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(googleServices.getCurrentRemoteEmail).toHaveBeenCalled();
    });

    it('should show modal when Google permission is invalid', async () => {
      googleServices.getCurrentRemoteEmail.mockResolvedValue('different@gmail.com');

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google', remoteEmail: 'test@gmail.com' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
      expect(actions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ERROR',
          useReskinModal: true,
        })
      );
    });

    it('should check upload size for Google service', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(uploadServices.checkUploadBySize).toHaveBeenCalled();
    });
  });

  describe('handleConfirmTransferFile with Dropbox service', () => {
    it('should check upload size for Dropbox service', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'dropbox' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(uploadServices.checkUploadBySize).toHaveBeenCalled();
    });

    it('should not check Google sign-in for Dropbox service', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'dropbox' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(googleServices.isSignedIn).not.toHaveBeenCalled();
    });
  });

  describe('file size validation', () => {
    it('should block transfer when file size exceeds limit', async () => {
      uploadServices.checkUploadBySize.mockReturnValue({ allowedUpload: false, maxSizeAllow: 50 });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google' });

      let thrownError: Error | null = null;
      await act(async () => {
        try {
          await result.current.handleConfirmTransferFile({
            afterTransferCallback: mockAfterTransferCallback,
            setState: mockSetState,
            currentDocument,
          });
        } catch (error) {
          thrownError = error as Error;
        }
      });

      expect(thrownError?.message).toBe('MESSAGE_OVER_FILE_SIZE');
      // Verify setState was called with initial state before throwing
      const setStateCalls = mockSetState.mock.calls;
      const hasInitialStateCall = setStateCalls.some(
        (call: [Record<string, unknown>]) =>
          call[0].isShareLinkOpen === false &&
          call[0].isInLuminStorage === false &&
          call[0].isTransfering === false
      );
      expect(hasInitialStateCall).toBe(true);
    });
  });

  describe('file retrieval', () => {
    it('should return early when file is null', async () => {
      getFileService.getDocument.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockSetState).toHaveBeenCalledWith({
        isShareLinkOpen: false,
        isInLuminStorage: false,
        isTransfering: false,
      });
      expect(mockAfterTransferCallback).not.toHaveBeenCalled();
    });

    it('should call getDocument with current document', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(getFileService.getDocument).toHaveBeenCalledWith(currentDocument);
    });
  });

  describe('file linearization and upload', () => {
    it('should linearize PDF file before upload', async () => {
      const mockFile = new File(['test'], 'test.pdf');
      getFileService.getDocument.mockResolvedValue(mockFile);

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(uploadServices.linearPdfFromFiles).toHaveBeenCalledWith(mockFile);
    });

    it('should upload document to S3', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(documentServices.uploadDocumentWithThumbnailToS3).toHaveBeenCalled();
    });

    it('should emit socket event after successful upload', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(socket.emit).toHaveBeenCalledWith('UPDATE_DOCUMENT', expect.objectContaining({
        roomId: 'doc-123',
        type: 'updateService',
      }));
    });

    it('should call updateDocument callback after successful upload', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockUpdateDocument).toHaveBeenCalled();
    });
  });

  describe('upload error handling', () => {
    it('should show error modal when upload fails', async () => {
      documentServices.uploadDocumentWithThumbnailToS3.mockRejectedValue(new Error('Upload failed'));

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(actions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ERROR',
          useReskinModal: true,
        })
      );
    });

    it('should show upload failed modal when S3 upload fails', async () => {
      uploadServices.linearPdfFromFiles.mockResolvedValue({ linearizedFile: new File(['test'], 'test.pdf') });
      documentServices.uploadDocumentWithThumbnailToS3.mockRejectedValue({ message: 'some error' });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      // sendRequestUploadFile catches the error and shows upload failed modal
      expect(actions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'modalShare.documentUploadFailed',
          message: 'modalShare.uploadDocumentAgain',
        })
      );
    });

    it('should set isTransfering to false in finally block when upload fails', async () => {
      documentServices.uploadDocumentWithThumbnailToS3.mockRejectedValue(new Error('Upload failed'));

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      // Finally block should always set isTransfering to false
      expect(mockSetState).toHaveBeenCalledWith({ isTransfering: false });
    });
  });

  describe('cancel enter password error', () => {
    it('should show toast error for cancel enter password', async () => {
      getFileService.getDocument.mockRejectedValue({ message: 'Cancel enter password' });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(toastUtils.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cancel enter password',
          useReskinToast: true,
        })
      );
    });

    it('should reset state for cancel enter password', async () => {
      getFileService.getDocument.mockRejectedValue({ message: 'Cancel enter password' });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockSetState).toHaveBeenCalledWith({
        isShareLinkOpen: false,
        isInLuminStorage: false,
        isTransfering: false,
      });
    });
  });

  describe('Google CANNOT_DOWNLOAD_FILE error', () => {
    it('should show strict download modal for CANNOT_DOWNLOAD_FILE error', async () => {
      getFileService.getDocument.mockRejectedValue({
        result: {
          error: {
            errors: [{ reason: 'cannotDownloadFile' }],
          },
        },
      });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockShowModal).toHaveBeenCalled();
    });

    it('should reset state for CANNOT_DOWNLOAD_FILE error', async () => {
      getFileService.getDocument.mockRejectedValue({
        result: {
          error: {
            errors: [{ reason: 'cannotDownloadFile' }],
          },
        },
      });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockSetState).toHaveBeenCalledWith({
        isShareLinkOpen: false,
        isInLuminStorage: false,
        isTransfering: false,
      });
    });
  });

  describe('viewer mode', () => {
    it('should call refetchDocument when in viewer mode', async () => {
      useViewerMatch.mockReturnValue({ isViewer: true });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockRefetchDocument).toHaveBeenCalled();
    });

    it('should not call refetchDocument when not in viewer mode', async () => {
      useViewerMatch.mockReturnValue({ isViewer: false });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockRefetchDocument).not.toHaveBeenCalled();
    });
  });

  describe('finally block', () => {
    it('should always set isTransfering to false in finally block', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockSetState).toHaveBeenCalledWith({ isTransfering: false });
    });

    it('should set isTransfering to false even when error occurs', async () => {
      getFileService.getDocument.mockRejectedValue(new Error('Some error'));

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockSetState).toHaveBeenCalledWith({ isTransfering: false });
    });
  });

  describe('premium user validation', () => {
    it('should validate premium organization when workspaceId exists', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(validator.validatePremiumOrganization).toHaveBeenCalled();
    });

    it('should check user payment type when no organization found', async () => {
      // Override with user having FREE payment and empty organizations
      (useSelector as jest.Mock)
        .mockReturnValueOnce({ ...mockCurrentUser, payment: { type: 'FREE' } })
        .mockReturnValueOnce({ data: [] });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google', belongsTo: { workspaceId: 'unknown-org' } } as never);

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(uploadServices.checkUploadBySize).toHaveBeenCalled();
    });
  });

  describe('afterTransferCallback', () => {
    it('should call afterTransferCallback on successful transfer', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(mockAfterTransferCallback).toHaveBeenCalled();
    });

    it('should set isInLuminStorage to true before calling afterTransferCallback', async () => {
      const callOrder: string[] = [];
      const trackedSetState = jest.fn((state: Record<string, unknown>) => {
        if (state.isInLuminStorage === true) {
          callOrder.push('setInLuminStorage');
        }
      });
      const trackedCallback = jest.fn(() => {
        callOrder.push('afterTransferCallback');
        return Promise.resolve();
      });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: trackedCallback,
          setState: trackedSetState,
          currentDocument,
        });
      });

      expect(callOrder).toEqual(['setInLuminStorage', 'afterTransferCallback']);
    });
  });

  describe('default parameter handling', () => {
    it('should use default empty function for afterTransferCallback', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      // Should not throw when afterTransferCallback is not provided
      await expect(
        act(async () => {
          await result.current.handleConfirmTransferFile({
            currentDocument,
          } as never);
        })
      ).resolves.not.toThrow();
    });

    it('should use default empty function for setState', async () => {
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      // Should not throw when setState is not provided
      await expect(
        act(async () => {
          await result.current.handleConfirmTransferFile({
            afterTransferCallback: mockAfterTransferCallback,
            currentDocument,
          } as never);
        })
      ).resolves.not.toThrow();
    });
  });

  describe('modal confirmation handler for invalid Google permission', () => {
    it('should call handleConfirmValidGoogle when user confirms re-sign-in', async () => {
      googleServices.getCurrentRemoteEmail.mockResolvedValue('different@gmail.com');

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google', remoteEmail: 'test@gmail.com' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      // Get the modal settings from the mock call
      const modalSettings = actions.openModal.mock.calls[0][0];
      expect(modalSettings.onConfirm).toBeDefined();

      // Simulate user clicking confirm
      act(() => {
        modalSettings.onConfirm();
      });

      expect(googleServices.removeImplicitAccessToken).toHaveBeenCalled();
      expect(googleServices.implicitSignIn).toHaveBeenCalled();
    });

    it('should call onCancel callback to set isTransfering to false', async () => {
      googleServices.getCurrentRemoteEmail.mockResolvedValue('different@gmail.com');

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'google', remoteEmail: 'test@gmail.com' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      // Get the modal settings from the mock call
      const modalSettings = actions.openModal.mock.calls[0][0];
      expect(modalSettings.onCancel).toBeDefined();

      // Simulate user clicking cancel
      act(() => {
        modalSettings.onCancel();
      });

      expect(mockSetState).toHaveBeenCalledWith({ isTransfering: false });
    });
  });

  describe('handleTransferFile internal logic', () => {
    it('should return error true when file is null in handleTransferFile', async () => {
      // This test covers the internal handleTransferFile when file is null
      uploadServices.linearPdfFromFiles.mockResolvedValue({ linearizedFile: null });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      // Should return early without calling afterTransferCallback
      expect(mockSetState).toHaveBeenCalledWith({
        isShareLinkOpen: false,
        isInLuminStorage: false,
        isTransfering: false,
      });
    });
  });

  describe('sendRequestUploadFile error handling', () => {
    it('should show upload failed modal when PersonalDocumentUploadService fails', async () => {
      const PersonalDocumentUploadService = jest.requireMock('services/personalDocumentUploadService');
      PersonalDocumentUploadService.mockImplementation(() => ({
        upload: jest.fn().mockRejectedValue(new Error('Upload service error')),
      }));

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      expect(actions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ERROR',
          title: 'modalShare.documentUploadFailed',
          message: 'modalShare.uploadDocumentAgain',
        })
      );
    });
  });

  describe('sendRequestUploadFile error handling', () => {
    it('should show upload failed modal for any upload error', async () => {
      // sendRequestUploadFile has its own try-catch that shows a generic upload failed modal
      documentServices.uploadDocumentWithThumbnailToS3.mockRejectedValue({ message: 'generic_error' });

      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 's3' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      // The error is caught by sendRequestUploadFile's catch block
      expect(actions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'modalShare.documentUploadFailed',
          message: 'modalShare.uploadDocumentAgain',
        })
      );
    });
  });

  describe('checkGooglePermission for non-Google services', () => {
    it('should return false for non-Google services', async () => {
      // For non-Google services, checkGooglePermission should return false
      // which means it won't show the invalid permission modal
      const { result } = renderHook(() =>
        useTransferFile({
          refetchDocument: mockRefetchDocument,
          updateDocument: mockUpdateDocument,
        })
      );

      const currentDocument = createMockDocument({ service: 'dropbox' });

      await act(async () => {
        await result.current.handleConfirmTransferFile({
          afterTransferCallback: mockAfterTransferCallback,
          setState: mockSetState,
          currentDocument,
        });
      });

      // Should not call getCurrentRemoteEmail for dropbox
      expect(googleServices.getCurrentRemoteEmail).not.toHaveBeenCalled();
    });
  });
});
