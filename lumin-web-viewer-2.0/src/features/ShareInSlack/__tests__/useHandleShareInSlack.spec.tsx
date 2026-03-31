import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { SharingMode } from '../constants';
import { SlackConversationType } from '../interfaces/slack.interface';

// Mock ShareModalContext
jest.mock('luminComponents/ShareModal/ShareModalContext', () => ({
  ShareModalContext: require('react').createContext({
    currentDocument: { _id: 'doc-123', name: 'Test Doc', service: 's3' },
    openHitDocStackModal: jest.fn(),
    handleAllTransferFile: jest.fn().mockResolvedValue(true),
    getSharees: jest.fn().mockResolvedValue(undefined),
    updateDocument: jest.fn(),
    isTransfering: false,
  }),
}));

// Mock ShareSettingModal utils
jest.mock('luminComponents/ShareSettingModal/utils', () => ({
  handleUpdateShareSettingDocument: jest.fn(),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock services
const mockPreCheckShareDocumentInSlack = jest.fn();
const mockShareDocumentInSlack = jest.fn();
jest.mock('services/graphServices/slack', () => ({
  preCheckShareDocumentInSlack: (params: unknown) => mockPreCheckShareDocumentInSlack(params),
  shareDocumentInSlack: (params: unknown) => mockShareDocumentInSlack(params),
}));

// Mock logger
jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logInfo: jest.fn(),
    logError: jest.fn(),
  },
}));

// Mock utils
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockToastWarn = jest.fn();
const mockToastInfo = jest.fn();
jest.mock('utils', () => ({
  errorUtils: {
    extractGqlError: jest.fn().mockReturnValue({ code: '' }),
  },
  eventTracking: jest.fn().mockResolvedValue(undefined),
  toastUtils: {
    success: (params: unknown) => mockToastSuccess(params),
    error: (params: unknown) => mockToastError(params),
    warn: (params: unknown) => mockToastWarn(params),
    info: (params: unknown) => mockToastInfo(params),
    openUnknownErrorToast: jest.fn(),
  },
}));

jest.mock('utils/Factory/EventCollection/ModalEventCollection', () => ({
  __esModule: true,
  default: {
    modalViewed: jest.fn().mockResolvedValue(undefined),
    modalConfirmation: jest.fn().mockResolvedValue(undefined),
    modalDismiss: jest.fn().mockResolvedValue(undefined),
  },
  ModalName: {
    OVERWRITE_OR_KEEP_PERMISSIONS: 'overwrite_or_keep_permissions',
  },
}));

jest.mock('utils/recordUtil', () => ({
  SHARE_PERMISSION_MAPPING: { VIEWER: 'viewer', EDITOR: 'editor' },
  WHO_CAN_OPEN_MAPPING: { ANYONE: 'anyone', INVITED: 'invited' },
}));

import useHandleShareInSlack from '../hooks/useHandleShareInSlack';

const mockStore = configureMockStore([]);

// ============ FACTORIES ============
const createTeam = (id = 'team-1') => ({
  id,
  name: `Team ${id}`,
  domain: `team-${id}.slack.com`,
  avatar: `https://example.com/avatar-${id}.png`,
});

const createChannel = (id = 'channel-1', overrides = {}) => ({
  id,
  name: `Channel ${id}`,
  isPrivate: false,
  totalMembers: 10,
  isChannel: true,
  ...overrides,
});

const createRecipient = (id = 'recipient-1') => ({
  id,
  name: `Recipient ${id}`,
  displayName: `Display ${id}`,
  email: `${id}@example.com`,
  avatarUrl: `https://example.com/avatar-${id}.png`,
  isChannel: false,
});

const createStoreState = (overrides = {}) => ({
  shareInSlack: {
    teams: [],
    channels: [],
    recipients: [],
    selectedTeam: createTeam(),
    selectedDestination: createChannel(),
    sharingMode: SharingMode.ANYONE,
    accessLevel: 'EDITOR',
    isSharingQueueProcessing: false,
    sharedDocumentInfo: null,
    isSharing: false,
    ...overrides,
  },
});

describe('useHandleShareInSlack', () => {
  let reduxStore: ReturnType<typeof mockStore>;
  let mockOnClose: jest.Mock;
  let mockSetOpenedPermissionModal: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnClose = jest.fn();
    mockSetOpenedPermissionModal = jest.fn();
    mockShareDocumentInSlack.mockResolvedValue({ hasUnshareableEmails: false, isQueuedSharing: false });
    mockPreCheckShareDocumentInSlack.mockResolvedValue({ isPermissionUpdateNeeded: false });
    reduxStore = mockStore(createStoreState());
  });

  const renderHookWithProvider = (storeOverrides = {}) => {
    if (Object.keys(storeOverrides).length > 0) {
      reduxStore = mockStore(createStoreState(storeOverrides));
    }
    return renderHook(
      () => useHandleShareInSlack({
        message: 'Test message',
        onClose: mockOnClose,
        setOpenedPermissionModal: mockSetOpenedPermissionModal,
      }),
      {
        wrapper: ({ children }) => <Provider store={reduxStore}>{children}</Provider>,
      }
    );
  };

  describe('Return Values', () => {
    it('should return handleShare function', () => {
      const { result } = renderHookWithProvider();
      expect(typeof result.current.handleShare).toBe('function');
    });

    it('should return isLoading state', () => {
      const { result } = renderHookWithProvider();
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should return handleConfirmPermissionModal function', () => {
      const { result } = renderHookWithProvider();
      expect(typeof result.current.handleConfirmPermissionModal).toBe('function');
    });

    it('should return handleDismissPermissionModal function', () => {
      const { result } = renderHookWithProvider();
      expect(typeof result.current.handleDismissPermissionModal).toBe('function');
    });
  });

  describe('handleShare', () => {
    it('should call shareDocumentInSlack with correct parameters', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleShare();
      });

      expect(mockShareDocumentInSlack).toHaveBeenCalledWith({
        documentId: 'doc-123',
        slackTeamId: 'team-1',
        conversation: {
          id: 'channel-1',
          type: SlackConversationType.CHANNEL,
          isPrivate: false,
        },
        role: 'EDITOR',
        sharingMode: SharingMode.ANYONE,
        message: 'Test message',
        isOverwritePermission: undefined,
      });
    });

    it('should dispatch setIsSharing(true) before sharing', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleShare();
      });

      const actions = reduxStore.getActions();
      expect(actions[0]).toEqual({ type: 'SHARE_IN_SLACK/setIsSharing', payload: true });
    });

    it('should dispatch setIsSharing(false) after sharing', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleShare();
      });

      const actions = reduxStore.getActions();
      const lastAction = actions[actions.length - 1];
      expect(lastAction).toEqual({ type: 'SHARE_IN_SLACK/setIsSharing', payload: false });
    });

    it('should show success toast when sharing succeeds', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleShare();
      });

      expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('should call onClose after successful share', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleShare();
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show warning toast when hasUnshareableEmails is true', async () => {
      mockShareDocumentInSlack.mockResolvedValue({ hasUnshareableEmails: true, isQueuedSharing: false });
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleShare();
      });

      expect(mockToastWarn).toHaveBeenCalled();
    });

    it('should show info toast when isQueuedSharing is true', async () => {
      mockShareDocumentInSlack.mockResolvedValue({ hasUnshareableEmails: false, isQueuedSharing: true });
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleShare();
      });

      expect(mockToastInfo).toHaveBeenCalledWith({ message: 'shareInSlack.documentSharingInProgress' });
    });
  });

  describe('Pre-check for S3 documents', () => {
    it('should call preCheckShareDocumentInSlack for S3 documents', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleShare();
      });

      expect(mockPreCheckShareDocumentInSlack).toHaveBeenCalled();
    });

    it('should open permission modal when isPermissionUpdateNeeded is true', async () => {
      mockPreCheckShareDocumentInSlack.mockResolvedValue({ isPermissionUpdateNeeded: true });
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleShare();
      });

      expect(mockSetOpenedPermissionModal).toHaveBeenCalledWith(true);
      expect(mockShareDocumentInSlack).not.toHaveBeenCalled();
    });
  });

  describe('Permission Modal Handlers', () => {
    it('handleConfirmPermissionModal should share with isOverwritePermission=false', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleConfirmPermissionModal();
      });

      expect(mockSetOpenedPermissionModal).toHaveBeenCalledWith(false);
      expect(mockShareDocumentInSlack).toHaveBeenCalledWith(
        expect.objectContaining({ isOverwritePermission: false })
      );
    });

    it('handleDismissPermissionModal should share with isOverwritePermission=true', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleDismissPermissionModal();
      });

      expect(mockSetOpenedPermissionModal).toHaveBeenCalledWith(false);
      expect(mockShareDocumentInSlack).toHaveBeenCalledWith(
        expect.objectContaining({ isOverwritePermission: true })
      );
    });
  });

  describe('Direct Message Sharing', () => {
    it('should set conversation type to DIRECT_MESSAGE for recipients', async () => {
      const { result } = renderHookWithProvider({ selectedDestination: createRecipient() });

      await act(async () => {
        await result.current.handleShare();
      });

      expect(mockShareDocumentInSlack).toHaveBeenCalledWith(
        expect.objectContaining({
          conversation: expect.objectContaining({
            type: SlackConversationType.DIRECT_MESSAGE,
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should show error toast when sharing fails', async () => {
      mockShareDocumentInSlack.mockRejectedValue(new Error('Share failed'));
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleShare();
      });

      expect(mockToastError).toHaveBeenCalledWith({ message: 'common.somethingWentWrong' });
    });
  });

  describe('Loading State', () => {
    it('should return isLoading based on isSharing state', () => {
      const { result } = renderHookWithProvider({ isSharing: true });

      expect(result.current.isLoading).toBe(true);
    });
  });
});
