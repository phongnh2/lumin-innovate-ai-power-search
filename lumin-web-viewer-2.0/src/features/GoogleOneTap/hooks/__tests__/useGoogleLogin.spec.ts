import { renderHook, act } from '@testing-library/react';

import { useLatestRef } from 'hooks/useLatestRef';
import { kratosService } from 'services/oryServices';

import { useGoogleLogin } from '../useGoogleLogin';
import { useCreateLoginFlow, constructFlowCsrfToken } from '../useCreateLoginFlow';
import { LoginService, OryLoginMethod, OryProvider } from '../../constants';
import { IGoogleEndPointResponse } from '../../types';

jest.mock('hooks/useLatestRef', () => ({
  useLatestRef: jest.fn(),
}));

jest.mock('services/oryServices', () => ({
  kratosService: {
    updateLoginFlow: jest.fn(),
  },
}));

jest.mock('../useCreateLoginFlow', () => ({
  useCreateLoginFlow: jest.fn(),
  constructFlowCsrfToken: jest.fn(),
}));

const mockLocationHref = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
  },
  writable: true,
  configurable: true,
});

describe('useGoogleLogin', () => {
  const mockCreateLoginFlow = jest.fn();
  const mockCsrfToken = 'mock-csrf-token';
  const mockFlowId = 'flow-123';
  const mockFlow = {
    id: mockFlowId,
    ui: {
      nodes: [],
    },
  };

  const mockGoogleResponse: IGoogleEndPointResponse = {
    sub: '123456789',
    name: 'John Doe',
    given_name: 'John',
    family_name: 'Doe',
    picture: 'https://example.com/photo.jpg',
    email: 'john.doe@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLatestRef as jest.Mock).mockReturnValue({ current: 'http://localhost:3000' });
    (useCreateLoginFlow as jest.Mock).mockReturnValue([mockCreateLoginFlow]);
    (constructFlowCsrfToken as jest.Mock).mockReturnValue(mockCsrfToken);
    mockCreateLoginFlow.mockResolvedValue({ data: mockFlow });
    (kratosService.updateLoginFlow as jest.Mock).mockResolvedValue({});
  });

  describe('initialization', () => {
    it('should call useLatestRef with current window location', () => {
      renderHook(() => useGoogleLogin());

      expect(useLatestRef).toHaveBeenCalledWith('http://localhost:3000');
    });

    it('should call useCreateLoginFlow with correct parameters', () => {
      renderHook(() => useGoogleLogin());

      expect(useCreateLoginFlow).toHaveBeenCalledWith({
        returnTo: 'http://localhost:3000',
        refresh: false,
      });
    });

    it('should return login function', () => {
      const { result } = renderHook(() => useGoogleLogin());

      expect(result.current).toHaveLength(1);
      expect(typeof result.current[0]).toBe('function');
    });
  });

  describe('successful login', () => {
    it('should create login flow and update it with Google credentials', async () => {
      const { result } = renderHook(() => useGoogleLogin());

      await act(async () => {
        await result.current[0](mockGoogleResponse);
      });

      expect(mockCreateLoginFlow).toHaveBeenCalled();
      expect(constructFlowCsrfToken).toHaveBeenCalledWith(mockFlow);
      expect(kratosService.updateLoginFlow).toHaveBeenCalledWith({
        flow: mockFlowId,
        updateLoginFlowBody: {
          csrf_token: mockCsrfToken,
          method: OryLoginMethod.Oidc,
          provider: OryProvider.Google,
          traits: {
            loginService: LoginService.GOOGLE,
          },
        },
      });
    });

    it('should return success data on successful login', async () => {
      const { result } = renderHook(() => useGoogleLogin());

      let loginResult: { data: object };
      await act(async () => {
        loginResult = await result.current[0](mockGoogleResponse);
      });

      expect(loginResult!).toEqual({ data: {} });
    });
  });

  describe('error handling', () => {
    it('should throw error when flow is missing', async () => {
      mockCreateLoginFlow.mockResolvedValueOnce({ data: null });

      const { result } = renderHook(() => useGoogleLogin());

      await expect(
        act(async () => {
          await result.current[0](mockGoogleResponse);
        })
      ).rejects.toThrow('Missing oidc flow');
    });

    it('should redirect when browser location change is required', async () => {
      const redirectUrl = 'https://auth.example.com/login?flow=123';
      const browserLocationChangeError = {
        response: {
          data: {
            error: {
              id: 'browser_location_change_required',
            },
            redirect_browser_to: redirectUrl,
          },
        },
      };
      (kratosService.updateLoginFlow as jest.Mock).mockRejectedValueOnce(browserLocationChangeError);

      const { result } = renderHook(() => useGoogleLogin());

      let loginResult: { error: unknown; data?: null };
      await act(async () => {
        loginResult = await result.current[0](mockGoogleResponse);
      });

      expect(window.location.href).toContain(redirectUrl);
      expect(window.location.href).toContain('login_hint=');
      expect(loginResult!.error).toBeDefined();
      expect(loginResult!.data).toBeNull();
    });

    it('should throw error for non-redirect errors', async () => {
      const genericError = new Error('Network error');
      (kratosService.updateLoginFlow as jest.Mock).mockRejectedValueOnce(genericError);

      const { result } = renderHook(() => useGoogleLogin());

      await expect(
        act(async () => {
          await result.current[0](mockGoogleResponse);
        })
      ).rejects.toThrow('Network error');
    });

    it('should throw error when redirect URL is missing in browser location change error', async () => {
      const errorWithoutRedirect = {
        response: {
          data: {
            error: {
              id: 'browser_location_change_required',
            },
          },
        },
      };
      (kratosService.updateLoginFlow as jest.Mock).mockRejectedValueOnce(errorWithoutRedirect);

      const { result } = renderHook(() => useGoogleLogin());

      await expect(
        act(async () => {
          await result.current[0](mockGoogleResponse);
        })
      ).rejects.toEqual(errorWithoutRedirect);
    });

    it('should handle error without response property', async () => {
      const errorWithoutResponse = { message: 'Unknown error' };
      (kratosService.updateLoginFlow as jest.Mock).mockRejectedValueOnce(errorWithoutResponse);

      const { result } = renderHook(() => useGoogleLogin());

      await expect(
        act(async () => {
          await result.current[0](mockGoogleResponse);
        })
      ).rejects.toEqual(errorWithoutResponse);
    });
  });

  describe('redirect URL building', () => {
    it('should build redirect URL with email hint', async () => {
      const baseRedirectUrl = 'https://auth.example.com/login?flow=123';
      const browserLocationChangeError = {
        response: {
          data: {
            error: {
              id: 'browser_location_change_required',
            },
            redirect_browser_to: baseRedirectUrl,
          },
        },
      };
      (kratosService.updateLoginFlow as jest.Mock).mockRejectedValueOnce(browserLocationChangeError);

      const { result } = renderHook(() => useGoogleLogin());

      await act(async () => {
        await result.current[0](mockGoogleResponse);
      });

      expect(window.location.href).toBe(`${baseRedirectUrl}&login_hint=${encodeURIComponent(mockGoogleResponse.email)}`);
    });

    it('should properly encode email in redirect URL', async () => {
      const specialEmailResponse: IGoogleEndPointResponse = {
        ...mockGoogleResponse,
        email: 'test+special@example.com',
      };
      const baseRedirectUrl = 'https://auth.example.com/login?flow=123';
      const browserLocationChangeError = {
        response: {
          data: {
            error: {
              id: 'browser_location_change_required',
            },
            redirect_browser_to: baseRedirectUrl,
          },
        },
      };
      (kratosService.updateLoginFlow as jest.Mock).mockRejectedValueOnce(browserLocationChangeError);

      const { result } = renderHook(() => useGoogleLogin());

      await act(async () => {
        await result.current[0](specialEmailResponse);
      });

      expect(window.location.href).toContain('login_hint=test%2Bspecial%40example.com');
    });
  });

  describe('callback stability', () => {
    it('should return stable login function reference', () => {
      const { result, rerender } = renderHook(() => useGoogleLogin());

      const firstLogin = result.current[0];
      rerender();
      const secondLogin = result.current[0];

      expect(firstLogin).toBe(secondLogin);
    });
  });

  describe('different Google response data', () => {
    it('should use email from Google response for login hint', async () => {
      const differentEmailResponse: IGoogleEndPointResponse = {
        ...mockGoogleResponse,
        email: 'different@example.com',
      };
      const baseRedirectUrl = 'https://auth.example.com/login?flow=123';
      const browserLocationChangeError = {
        response: {
          data: {
            error: {
              id: 'browser_location_change_required',
            },
            redirect_browser_to: baseRedirectUrl,
          },
        },
      };
      (kratosService.updateLoginFlow as jest.Mock).mockRejectedValueOnce(browserLocationChangeError);

      const { result } = renderHook(() => useGoogleLogin());

      await act(async () => {
        await result.current[0](differentEmailResponse);
      });

      expect(window.location.href).toContain('login_hint=different%40example.com');
    });
  });
});

