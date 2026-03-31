/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */
import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';
import { act } from 'react-dom/test-utils';

import { useForceLogoutMutation } from '@/features/account/account-api-slice';
import { updateModalProperties } from '@/features/modal-slice';
import { ForceLogoutType } from '@/interfaces/user';
import { useAppDispatch } from '@/lib/hooks';
import { frontendApi } from '@/lib/ory';
import sessionManagement from '@/lib/session';
import socket from '@/lib/socket';

import useForceLogout from '../useForceLogout';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/features/account/account-api-slice', () => ({
  useForceLogoutMutation: jest.fn()
}));

jest.mock('@/features/modal-slice', () => ({
  updateModalProperties: jest.fn((props: any) => ({ type: 'UPDATE_MODAL_PROPERTIES', payload: props }))
}));

jest.mock('@/lib/hooks', () => ({
  useAppDispatch: jest.fn()
}));

jest.mock('@/lib/ory', () => ({
  frontendApi: {
    createLogoutFlow: jest.fn(),
    updateLogoutFlow: jest.fn()
  }
}));

jest.mock('@/lib/session', () => ({
  __esModule: true,
  default: {
    getAuthorizeToken: jest.fn()
  }
}));

jest.mock('@/lib/socket', () => ({
  __esModule: true,
  default: {
    startConnection: jest.fn()
  }
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseForceLogoutMutation = useForceLogoutMutation as jest.MockedFunction<typeof useForceLogoutMutation>;
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<typeof useAppDispatch>;
const mockFrontendApi = frontendApi as jest.Mocked<typeof frontendApi>;
const mockSessionManagement = sessionManagement as jest.Mocked<typeof sessionManagement>;
const mockSocket = socket as jest.Mocked<typeof socket>;

describe('useForceLogout', () => {
  const mockDispatch = jest.fn();
  const mockRouter = {
    push: jest.fn(),
    query: {},
    replace: jest.fn()
  };
  let mockLogout: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    mockLogout = jest.fn().mockResolvedValue({ data: { success: true } });
    mockUseForceLogoutMutation.mockReturnValue([mockLogout, { error: null, isLoading: false }] as any);
    Storage.prototype.removeItem = jest.fn();
  });

  describe('forceLogout', () => {
    it('should handle force logout successfully with default type', async () => {
      mockSessionManagement.getAuthorizeToken.mockResolvedValue('session-token');
      mockFrontendApi.createLogoutFlow.mockResolvedValue({
        data: { logout_token: 'logout-token' }
      } as any);
      mockFrontendApi.updateLogoutFlow.mockResolvedValue({} as any);

      const { result } = renderHook(() => useForceLogout());
      const [forceLogout] = result.current;

      await act(async () => {
        await forceLogout();
      });

      expect(mockDispatch).toHaveBeenCalledWith(updateModalProperties({ isProcessing: true }));
      expect(mockSessionManagement.getAuthorizeToken).toHaveBeenCalledWith({ forceNew: true });
      expect(mockFrontendApi.createLogoutFlow).toHaveBeenCalled();
      expect(mockFrontendApi.updateLogoutFlow).toHaveBeenCalledWith({ logoutToken: 'logout-token' });
      expect(mockSocket.startConnection).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalledWith({ type: ForceLogoutType.DEFAULT });
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('token');
      expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
    });

    it('should handle force logout with custom type and returnTo', async () => {
      mockSessionManagement.getAuthorizeToken.mockResolvedValue('session-token');
      mockFrontendApi.createLogoutFlow.mockResolvedValue({
        data: { logout_token: 'logout-token' }
      } as any);
      mockFrontendApi.updateLogoutFlow.mockResolvedValue({} as any);

      const { result } = renderHook(() => useForceLogout());
      const [forceLogout] = result.current;

      await act(async () => {
        await forceLogout(ForceLogoutType.CHANGE_LOGIN_SERVICE, '/dashboard');
      });

      expect(mockLogout).toHaveBeenCalledWith({ type: ForceLogoutType.CHANGE_LOGIN_SERVICE });
      expect(mockRouter.push).toHaveBeenCalledWith('/sign-in?return_to=/dashboard');
    });

    it('should redirect to sign-in when session is not available', async () => {
      mockSessionManagement.getAuthorizeToken.mockResolvedValue(null);

      const { result } = renderHook(() => useForceLogout());
      const [forceLogout] = result.current;

      await act(async () => {
        await forceLogout();
      });

      expect(mockSessionManagement.getAuthorizeToken).toHaveBeenCalledWith({ forceNew: true });
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('token');
      expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
      expect(mockFrontendApi.createLogoutFlow).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should throw error when createLogoutFlow fails', async () => {
      mockSessionManagement.getAuthorizeToken.mockResolvedValue('session-token');
      const error = new Error('Logout flow error');
      mockFrontendApi.createLogoutFlow.mockRejectedValue(error);

      const { result } = renderHook(() => useForceLogout());
      const [forceLogout] = result.current;

      await act(async () => {
        await expect(forceLogout()).rejects.toThrow('Logout flow error');
      });

      expect(mockFrontendApi.createLogoutFlow).toHaveBeenCalled();
    });

    it('should throw error when updateLogoutFlow fails', async () => {
      mockSessionManagement.getAuthorizeToken.mockResolvedValue('session-token');
      mockFrontendApi.createLogoutFlow.mockResolvedValue({
        data: { logout_token: 'logout-token' }
      } as any);
      const error = new Error('Update logout flow error');
      mockFrontendApi.updateLogoutFlow.mockRejectedValue(error);

      const { result } = renderHook(() => useForceLogout());
      const [forceLogout] = result.current;

      await act(async () => {
        await expect(forceLogout()).rejects.toThrow('Update logout flow error');
      });

      expect(mockFrontendApi.updateLogoutFlow).toHaveBeenCalled();
    });

    it('should throw error when logout mutation fails', async () => {
      mockSessionManagement.getAuthorizeToken.mockResolvedValue('session-token');
      mockFrontendApi.createLogoutFlow.mockResolvedValue({
        data: { logout_token: 'logout-token' }
      } as any);
      mockFrontendApi.updateLogoutFlow.mockResolvedValue({} as any);
      const error = new Error('Logout error');
      mockLogout.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useForceLogout());
      const [forceLogout] = result.current;

      await act(async () => {
        await expect(forceLogout()).rejects.toThrow('Logout error');
      });

      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
