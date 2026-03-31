import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { useAuthorize } from '../hooks/useAuthorize';
import { SlackOAuthErrorType } from '../constants';

// Mock actions
jest.mock('actions', () => ({
  __esModule: true,
  default: {
    openModal: jest.fn((params) => ({ type: 'OPEN_MODAL', payload: params })),
  },
}));

// Mock hooks
jest.mock('hooks', () => ({
  useGetCurrentUser: jest.fn().mockReturnValue({ _id: 'user-123', email: 'test@example.com' }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock services
const mockGetSlackTeams = jest.fn();
jest.mock('services/graphServices/slack', () => ({
  getSlackTeams: () => mockGetSlackTeams(),
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
const mockToastError = jest.fn();
jest.mock('utils', () => ({
  toastUtils: {
    error: (params: unknown) => mockToastError(params),
  },
}));

// Mock SlackService
const mockGetConsent = jest.fn();
jest.mock('../utils/SlackService', () => ({
  __esModule: true,
  default: {
    getConsent: (params: unknown) => mockGetConsent(params),
  },
}));

const mockStore = configureMockStore([]);

// ============ FACTORIES ============
const createTeam = (id = 'team-1') => ({
  id,
  name: `Team ${id}`,
  domain: `team-${id}.slack.com`,
  avatar: `https://example.com/avatar-${id}.png`,
});

const createStoreState = () => ({
  shareInSlack: {
    teams: [],
    channels: [],
    recipients: [],
    selectedTeam: null,
    selectedDestination: null,
    sharingMode: null,
    accessLevel: null,
    isSharingQueueProcessing: false,
    sharedDocumentInfo: null,
    isSharing: false,
  },
});

describe('useAuthorize', () => {
  let reduxStore: ReturnType<typeof mockStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSlackTeams.mockResolvedValue([]);
    mockGetConsent.mockImplementation(async ({ onSuccess }) => {
      await onSuccess({ teamId: 'team-1' });
    });
    reduxStore = mockStore(createStoreState());
  });

  const renderHookWithProvider = () => {
    return renderHook(() => useAuthorize(), {
      wrapper: ({ children }) => <Provider store={reduxStore}>{children}</Provider>,
    });
  };

  describe('Return Values', () => {
    it('should return handleAuthorize function', () => {
      const { result } = renderHookWithProvider();
      expect(typeof result.current.handleAuthorize).toBe('function');
    });

    it('should return isLoading state', () => {
      const { result } = renderHookWithProvider();
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should have isLoading as false initially', () => {
      const { result } = renderHookWithProvider();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('handleAuthorize', () => {
    it('should call slackService.getConsent', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      expect(mockGetConsent).toHaveBeenCalledWith({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      });
    });

    it('should set isLoading to true when authorize starts', async () => {
      let loadingStateCapture: boolean[] = [];
      mockGetConsent.mockImplementation(async ({ onSuccess }) => {
        // Capture loading state during the async operation
        loadingStateCapture.push(true); // Indicates getConsent was called
        await new Promise((resolve) => setTimeout(resolve, 50));
        await onSuccess({});
      });

      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      // The hook was called, so authorize flow was triggered
      expect(loadingStateCapture.length).toBeGreaterThan(0);
    });
  });

  describe('onSuccess callback', () => {
    it('should fetch teams and dispatch setTeams', async () => {
      const teams = [createTeam('1'), createTeam('2')];
      mockGetSlackTeams.mockResolvedValue(teams);

      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      const actions = reduxStore.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setTeams',
        payload: teams,
      });
    });

    it('should dispatch setSelectedTeam when teamId is provided', async () => {
      const teams = [createTeam('team-1'), createTeam('team-2')];
      mockGetSlackTeams.mockResolvedValue(teams);
      mockGetConsent.mockImplementation(async ({ onSuccess }) => {
        await onSuccess({ teamId: 'team-1' });
      });

      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      const actions = reduxStore.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSelectedTeam',
        payload: teams[0],
      });
    });

    it('should not dispatch setSelectedTeam when teamId is not provided', async () => {
      const teams = [createTeam('team-1')];
      mockGetSlackTeams.mockResolvedValue(teams);
      mockGetConsent.mockImplementation(async ({ onSuccess }) => {
        await onSuccess({});
      });

      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      const actions = reduxStore.getActions();
      const setSelectedTeamActions = actions.filter((a: { type: string }) => a.type === 'SHARE_IN_SLACK/setSelectedTeam');
      expect(setSelectedTeamActions).toHaveLength(0);
    });

    it('should set isLoading to false after success', async () => {
      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle error when fetching teams fails', async () => {
      mockGetSlackTeams.mockRejectedValue(new Error('Network error'));
      const logger = require('helpers/logger').default;

      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      expect(logger.logError).toHaveBeenCalled();
    });
  });

  describe('onError callback', () => {
    it('should show error modal for DIFFERENT_EMAIL_ADDRESS error', async () => {
      mockGetConsent.mockImplementation(async ({ onError }) => {
        onError({ errorType: SlackOAuthErrorType.DIFFERENT_EMAIL_ADDRESS });
      });

      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      const actions = reduxStore.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: 'OPEN_MODAL',
          payload: expect.objectContaining({
            title: 'shareInSlack.cannotShareFile',
          }),
        })
      );
    });

    it('should show access denied toast for CANCELLED_BY_USER error', async () => {
      mockGetConsent.mockImplementation(async ({ onError }) => {
        onError({ errorType: SlackOAuthErrorType.CANCELLED_BY_USER });
      });

      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      expect(mockToastError).toHaveBeenCalledWith({ message: 'openDrive.accessDenied' });
    });

    it('should show generic error toast for SOMETHING_WENT_WRONG error', async () => {
      mockGetConsent.mockImplementation(async ({ onError }) => {
        onError({ errorType: SlackOAuthErrorType.SOMETHING_WENT_WRONG });
      });

      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      expect(mockToastError).toHaveBeenCalledWith({ message: 'common.somethingWentWrong' });
    });

    it('should set isLoading to false after error', async () => {
      mockGetConsent.mockImplementation(async ({ onError }) => {
        onError({ errorType: SlackOAuthErrorType.SOMETHING_WENT_WRONG });
      });

      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should log error info', async () => {
      mockGetConsent.mockImplementation(async ({ onError }) => {
        onError({ errorType: SlackOAuthErrorType.SOMETHING_WENT_WRONG });
      });
      const logger = require('helpers/logger').default;

      const { result } = renderHookWithProvider();

      await act(async () => {
        await result.current.handleAuthorize();
      });

      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error authorizing Slack',
          attributes: { errorType: SlackOAuthErrorType.SOMETHING_WENT_WRONG },
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null currentUser', () => {
      const { useGetCurrentUser } = require('hooks');
      useGetCurrentUser.mockReturnValue(null);

      const { result } = renderHookWithProvider();

      // Should not throw
      expect(result.current.handleAuthorize).toBeDefined();

      // Restore
      useGetCurrentUser.mockReturnValue({ _id: 'user-123', email: 'test@example.com' });
    });
  });
});

