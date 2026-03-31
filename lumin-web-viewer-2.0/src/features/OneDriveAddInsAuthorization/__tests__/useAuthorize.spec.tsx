import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock dispatch
const mockDispatch = jest.fn();

// Mock react-i18next
jest.mock('react-i18next', () => ({
  Trans: ({ children }: any) => children,
}));

// Mock react-redux
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

// Mock actions
jest.mock('actions', () => ({
  __esModule: true,
  default: { openModal: jest.fn((settings) => ({ type: 'OPEN_MODAL', payload: settings })) },
}));

// Mock oneDriveLoader
jest.mock('navigation/Router/setupOnedriveClient', () => ({
  oneDriveLoader: {
    load: jest.fn().mockReturnValue({ wait: jest.fn().mockResolvedValue(true) }),
    getState: jest.fn().mockReturnValue(false),
  },
}));

// Mock hooks
jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: true }),
  useGetCurrentUser: () => ({ _id: 'user-1', email: 'test@example.com' }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock oneDriveServices
jest.mock('services', () => ({
  oneDriveServices: {
    getConfiguration: jest.fn().mockReturnValue({ auth: { clientId: 'default-client' } }),
    isSignedIn: jest.fn().mockReturnValue(false),
    logoutCurrentAccount: jest.fn().mockResolvedValue(undefined),
    getTokenWithScopes: jest.fn().mockResolvedValue({}),
    getCurrentAccount: jest.fn().mockReturnValue({ idTokenClaims: { email: 'test@example.com' } }),
    getMe: jest.fn().mockResolvedValue({ webUrl: 'https://onedrive.live.com/personal/test' }),
  },
}));

// Mock logger
jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: { logError: jest.fn() },
}));

// Mock constants
jest.mock('constants/localStorageKey', () => ({
  LocalStorageKey: { HAS_INITIALIZED_WITH_ONEDRIVE_ADD_INS: 'has_init_onedrive' },
}));
jest.mock('constants/lumin-common', () => ({
  LOGGER: { Service: { ONEDRIVE_ADD_INS_AUTHORIZATION: 'onedrive_auth' } },
  ModalTypes: { WARNING: 'warning' },
}));
jest.mock('constants/urls', () => ({
  MICROSOFT_ADD_INS_CLIENT_ID: 'add-ins-client',
  MICROSOFT_CLIENT_ID: 'default-client',
}));

import useAuthorize from '../hooks/useAuthorize';
import logger from 'helpers/logger';
import { oneDriveServices } from 'services';
import { oneDriveLoader } from 'navigation/Router/setupOnedriveClient';

describe('useAuthorize', () => {
  const mockOnSuccess = jest.fn();
  const mockLocalStorage = {
    getItem: jest.fn().mockReturnValue(null),
    setItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
    (oneDriveServices.isSignedIn as jest.Mock).mockReturnValue(false);
    (oneDriveServices.getConfiguration as jest.Mock).mockReturnValue({ auth: { clientId: 'default-client' } });
    (oneDriveServices.getCurrentAccount as jest.Mock).mockReturnValue({ idTokenClaims: { email: 'test@example.com' } });
    (oneDriveServices.getMe as jest.Mock).mockResolvedValue({ webUrl: 'https://onedrive.live.com/personal/test' });
  });

  it('returns isProcessing and handleAuthorize', () => {
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    expect(result.current.isProcessing).toBe(false);
    expect(typeof result.current.handleAuthorize).toBe('function');
  });

  it('sets isProcessing to true when handleAuthorize is called', async () => {
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    
    act(() => {
      result.current.handleAuthorize();
    });
    
    expect(result.current.isProcessing).toBe(true);
  });

  it('initializes new app if not initialized', async () => {
    (oneDriveLoader.getState as jest.Mock).mockReturnValue(false);
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    
    await act(async () => {
      await result.current.handleAuthorize();
    });
    
    expect(oneDriveLoader.load).toHaveBeenCalledWith(expect.objectContaining({
      reInitialize: true,
      clientId: 'add-ins-client',
    }));
  });

  it('sets localStorage after initialization', async () => {
    (oneDriveLoader.getState as jest.Mock).mockReturnValue(false);
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    
    await act(async () => {
      await result.current.handleAuthorize();
    });
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('has_init_onedrive', 'true');
  });

  it('calls getTokenWithScopes with user email', async () => {
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    
    await act(async () => {
      await result.current.handleAuthorize();
    });
    
    expect(oneDriveServices.getTokenWithScopes).toHaveBeenCalledWith({
      scopes: [],
      loginHint: 'test@example.com',
    });
  });

  it('calls onSuccess with transformed URL', async () => {
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    
    await act(async () => {
      await result.current.handleAuthorize();
    });
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('https://onedrive.live.com/my');
    });
  });

  it('calls onSuccess with empty string when no webUrl', async () => {
    (oneDriveServices.getMe as jest.Mock).mockResolvedValue(null);
    
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    
    await act(async () => {
      await result.current.handleAuthorize();
    });
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('');
    });
  });

  it('logs out if authorized with default app', async () => {
    (oneDriveServices.isSignedIn as jest.Mock).mockReturnValue(true);
    (oneDriveServices.getConfiguration as jest.Mock).mockReturnValue({ auth: { clientId: 'default-client' } });
    
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    
    await act(async () => {
      await result.current.handleAuthorize();
    });
    
    expect(oneDriveServices.logoutCurrentAccount).toHaveBeenCalled();
  });

  it('opens wrong account modal if email mismatch', async () => {
    (oneDriveServices.getCurrentAccount as jest.Mock).mockReturnValue({
      idTokenClaims: { email: 'different@example.com' },
    });
    
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    
    await act(async () => {
      await result.current.handleAuthorize();
    });
    
    expect(mockDispatch).toHaveBeenCalled();
    expect(oneDriveServices.logoutCurrentAccount).toHaveBeenCalled();
  });

  it('logs error on authorization failure', async () => {
    const testError = new Error('Auth failed');
    (oneDriveServices.getTokenWithScopes as jest.Mock).mockRejectedValueOnce(testError);
    
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    
    await act(async () => {
      await result.current.handleAuthorize();
    });
    
    expect(logger.logError).toHaveBeenCalledWith(expect.objectContaining({
      reason: 'onedrive_auth',
      error: testError,
    }));
  });

  it('skips initialization if already initialized with add-ins client', async () => {
    mockLocalStorage.getItem.mockReturnValue('true');
    
    const { result } = renderHook(() => useAuthorize({ onSuccess: mockOnSuccess }));
    
    await act(async () => {
      await result.current.handleAuthorize();
    });
    
    expect(oneDriveLoader.load).not.toHaveBeenCalled();
  });
});

