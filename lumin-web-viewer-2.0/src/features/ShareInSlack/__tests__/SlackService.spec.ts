import { SlackOAuthErrorType } from '../constants';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}));

// Mock services
const mockInitSlackOAuth = jest.fn();
jest.mock('services/graphServices/slack', () => ({
  initSlackOAuth: () => mockInitSlackOAuth(),
}));

// Mock logger
jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

// Mock socket
const mockSocketOn = jest.fn();
const mockSocketRemoveListener = jest.fn();
jest.mock('@socket', () => ({
  socket: {
    on: (...args: unknown[]) => mockSocketOn(...args),
    removeListener: (...args: unknown[]) => mockSocketRemoveListener(...args),
  },
}));

// Mock constants
jest.mock('constants/lumin-common', () => ({
  LOGGER: {
    Service: {
      SHARE_IN_SLACK: 'share_in_slack',
    },
  },
}));

jest.mock('constants/socketConstant', () => ({
  SOCKET_ON: {
    SLACK_OAUTH_FLOW_COMPLETED: 'slack_oauth_flow_completed',
  },
}));

jest.mock('constants/urls', () => ({
  AXIOS_BASEURL: 'https://api.example.com',
}));

// Mock popupWindowParams
jest.mock('../utils/popupWindowParams', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('width=500,height=900'),
}));

// Mock window.open
const mockWindowOpen = jest.fn();
const mockWindowClose = jest.fn();

describe('SlackService', () => {
  let slackService: typeof import('../utils/SlackService').default;
  let originalWindowOpen: typeof window.open;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset module to get fresh instance
    jest.resetModules();
    
    // Mock window.open
    originalWindowOpen = window.open;
    window.open = mockWindowOpen;
    mockWindowOpen.mockReturnValue({
      close: mockWindowClose,
    });

    mockInitSlackOAuth.mockResolvedValue({
      contextJwt: 'test-jwt',
      flowId: 'test-flow-id',
    });

    // Re-import after mocks are set up
    slackService = require('../utils/SlackService').default;
  });

  afterEach(() => {
    window.open = originalWindowOpen;
  });

  describe('getConsent', () => {
    it('should call initSlackOAuth to get JWT and flowId', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await slackService.getConsent({ onSuccess, onError });

      expect(mockInitSlackOAuth).toHaveBeenCalled();
    });

    it('should open popup window with correct URL', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await slackService.getConsent({ onSuccess, onError });

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://api.example.com/slack/oauth/redirect?jwt=test-jwt',
        expect.any(String),
        'width=500,height=900'
      );
    });

    it('should register socket listener for OAuth flow completion', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await slackService.getConsent({ onSuccess, onError });

      expect(mockSocketOn).toHaveBeenCalledWith(
        'slack_oauth_flow_completed',
        expect.any(Function)
      );
    });

    it('should handle error when initSlackOAuth fails', async () => {
      mockInitSlackOAuth.mockRejectedValue(new Error('OAuth init failed'));
      const logger = require('helpers/logger').default;
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await slackService.getConsent({ onSuccess, onError });

      expect(logger.logError).toHaveBeenCalled();
    });

    it('should handle popup blocked scenario', async () => {
      mockWindowOpen.mockReturnValue(null);
      const onSuccess = jest.fn();
      const onError = jest.fn();

      // Should not throw
      await expect(slackService.getConsent({ onSuccess, onError })).resolves.not.toThrow();
    });
  });

  describe('handle', () => {
    let capturedHandler: (params: {
      flowId: string;
      isOk: boolean;
      errorType?: string;
      teamId?: string;
    }) => void;

    beforeEach(async () => {
      mockSocketOn.mockImplementation((event, handler) => {
        capturedHandler = handler;
      });

      await slackService.getConsent({
        onSuccess: jest.fn(),
        onError: jest.fn(),
      });
    });

    it('should call onSuccess when isOk is true', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await slackService.getConsent({ onSuccess, onError });

      capturedHandler({
        flowId: 'test-flow-id',
        isOk: true,
        teamId: 'team-123',
      });

      expect(onSuccess).toHaveBeenCalledWith({ teamId: 'team-123' });
    });

    it('should call onError when isOk is false', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await slackService.getConsent({ onSuccess, onError });

      capturedHandler({
        flowId: 'test-flow-id',
        isOk: false,
        errorType: SlackOAuthErrorType.SOMETHING_WENT_WRONG,
      });

      expect(onError).toHaveBeenCalledWith({
        errorType: SlackOAuthErrorType.SOMETHING_WENT_WRONG,
      });
    });

    it('should close popup window on handle', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await slackService.getConsent({ onSuccess, onError });

      capturedHandler({
        flowId: 'test-flow-id',
        isOk: true,
      });

      expect(mockWindowClose).toHaveBeenCalled();
    });

    it('should remove socket listener on handle', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await slackService.getConsent({ onSuccess, onError });

      capturedHandler({
        flowId: 'test-flow-id',
        isOk: true,
      });

      expect(mockSocketRemoveListener).toHaveBeenCalledWith({
        message: 'slack_oauth_flow_completed',
        listener: expect.any(Function),
      });
    });

    it('should ignore events with different flowId', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await slackService.getConsent({ onSuccess, onError });

      capturedHandler({
        flowId: 'different-flow-id',
        isOk: true,
      });

      expect(onSuccess).not.toHaveBeenCalled();
      expect(mockWindowClose).not.toHaveBeenCalled();
    });
  });
});

