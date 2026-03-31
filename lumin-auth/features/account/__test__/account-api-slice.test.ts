/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */
import axios from 'axios';

import { ErrorCode } from '@/constants/errorCode';
import { OryLoginMethod, OryProvider } from '@/interfaces/ory';
import { BaseException } from '@/lib/exceptions/base.exception';
import { constructFlowCsrfToken, frontendApi } from '@/lib/ory';

// Mock dependencies before importing the module under test
jest.mock('axios');
jest.mock('@/lib/ory', () => ({
  frontendApi: {
    createRecoveryFlow: jest.fn(),
    getRegistrationFlow: jest.fn(),
    createRegistrationFlow: jest.fn(),
    updateRegistrationFlow: jest.fn(),
    getRecoveryFlow: jest.fn()
  },
  constructFlowCsrfToken: jest.fn()
}));

jest.mock('@/utils/account.utils', () => ({
  OidcProviderMapping: {
    [OryProvider.Google]: {
      loginService: 'google',
      providerId: 'google'
    },
    [OryProvider.Microsoft]: {
      loginService: 'microsoft',
      providerId: 'microsoft'
    }
  }
}));

// Mock api-slice to avoid Redux store issues
jest.mock('@/features/api-slice', () => ({
  api: {
    injectEndpoints: jest.fn(({ endpoints }) => {
      const builder = {
        mutation: (config: any) => config,
        query: (config: any) => config
      };
      return {
        endpoints: endpoints(builder)
      };
    })
  }
}));

const mockFrontendApi = frontendApi as jest.Mocked<typeof frontendApi>;
const mockConstructFlowCsrfToken = constructFlowCsrfToken as jest.MockedFunction<typeof constructFlowCsrfToken>;
const mockAxios = axios as jest.Mocked<typeof axios>;

// Import after mocks are set up
import { accountApi } from '../account-api-slice';

describe('account-api-slice', () => {
  const endpoints = (accountApi as any).endpoints;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.location
    delete (window as any).location;
    (window as any).location = { href: '', reload: jest.fn() };
  });

  describe('ensureRecoveryFlow', () => {
    const { queryFn } = endpoints.ensureRecoveryFlow;

    it('should return existing flow if not expired', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const initialFlow = {
        id: 'flow-id',
        expires_at: futureDate.toISOString()
      };

      const result = await queryFn({ initial: initialFlow });

      expect(result).toEqual({ data: initialFlow });
      expect(mockFrontendApi.createRecoveryFlow).not.toHaveBeenCalled();
    });

    it('should create new flow if initial flow is expired', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const initialFlow = {
        id: 'old-flow-id',
        expires_at: pastDate.toISOString()
      };

      const newFlow = {
        id: 'new-flow-id',
        expires_at: new Date().toISOString()
      };

      mockFrontendApi.createRecoveryFlow.mockResolvedValue({ data: newFlow } as any);

      const result = await queryFn({
        initial: initialFlow,
        returnTo: '/dashboard'
      });

      expect(result).toEqual({ data: newFlow });
      expect(mockFrontendApi.createRecoveryFlow).toHaveBeenCalledWith({
        returnTo: '/dashboard'
      });
    });

    it('should create new flow if no initial flow provided', async () => {
      const newFlow = {
        id: 'new-flow-id',
        expires_at: new Date().toISOString()
      };

      mockFrontendApi.createRecoveryFlow.mockResolvedValue({ data: newFlow } as any);

      const result = await queryFn({ returnTo: '/login' });

      expect(result).toEqual({ data: newFlow });
      expect(mockFrontendApi.createRecoveryFlow).toHaveBeenCalledWith({
        returnTo: '/login'
      });
    });

    it('should handle SESSION_ALREADY_AVAILABLE error and reload page', async () => {
      const error = new BaseException(400, 'Session already available', ErrorCode.Auth.SESSION_ALREADY_AVAILABLE);

      mockFrontendApi.createRecoveryFlow.mockRejectedValue(error);

      const result = await queryFn({});

      expect(result).toEqual({
        error: {
          status: 400,
          data: null
        }
      });
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should throw error for other error codes', async () => {
      const error = new BaseException(500, 'Internal error', 'INTERNAL_ERROR');

      mockFrontendApi.createRecoveryFlow.mockRejectedValue(error);

      await expect(queryFn({})).rejects.toBe(error);
    });
  });

  describe('ensureRegistrationFlow', () => {
    const { queryFn } = endpoints.ensureRegistrationFlow;

    it('should return existing flow if not expired', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const initialFlow = {
        id: 'flow-id',
        expires_at: futureDate.toISOString()
      };

      const result = await queryFn({ initial: initialFlow });

      expect(result).toEqual({ data: initialFlow });
      expect(mockFrontendApi.createRegistrationFlow).not.toHaveBeenCalled();
    });

    it('should fetch flow by initialId if provided', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const fetchedFlow = {
        id: 'fetched-flow-id',
        expires_at: futureDate.toISOString()
      };

      mockFrontendApi.getRegistrationFlow.mockResolvedValue({ data: fetchedFlow } as any);

      const result = await queryFn({ initialId: 'flow-id' });

      expect(result).toEqual({ data: fetchedFlow });
      expect(mockFrontendApi.getRegistrationFlow).toHaveBeenCalledWith({
        flowId: 'flow-id'
      });
    });

    it('should ignore 410 error when fetching flow by initialId and create new flow', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 410 }
      };

      mockAxios.isAxiosError.mockReturnValue(true);
      mockFrontendApi.getRegistrationFlow.mockRejectedValue(axiosError);

      const newFlow = {
        id: 'new-flow-id',
        expires_at: new Date().toISOString()
      };

      mockFrontendApi.createRegistrationFlow.mockResolvedValue({ data: newFlow } as any);

      const result = await queryFn({
        initialId: 'expired-flow-id',
        returnTo: '/sign-up'
      });

      expect(result).toEqual({ data: newFlow });
      expect(mockFrontendApi.createRegistrationFlow).toHaveBeenCalled();
    });

    it('should throw non-410 errors when fetching flow by initialId', async () => {
      const error = new Error('Network error');

      mockAxios.isAxiosError.mockReturnValue(false);
      mockFrontendApi.getRegistrationFlow.mockRejectedValue(error);

      await expect(queryFn({ initialId: 'flow-id' })).rejects.toThrow('Network error');
    });

    it('should create new flow with ref and loginChallenge params', async () => {
      const newFlow = {
        id: 'new-flow-id',
        expires_at: new Date().toISOString()
      };

      mockFrontendApi.createRegistrationFlow.mockResolvedValue({ data: newFlow } as any);

      const result = await queryFn({
        returnTo: '/sign-up',
        ref: 'referral-code',
        loginChallenge: 'challenge-123'
      });

      expect(result).toEqual({ data: newFlow });
      expect(mockFrontendApi.createRegistrationFlow).toHaveBeenCalledWith(
        { returnTo: '/sign-up' },
        { params: { ref: 'referral-code', login_challenge: 'challenge-123' } }
      );
    });

    it('should create new flow when initial flow is expired', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const initialFlow = {
        id: 'old-flow-id',
        expires_at: pastDate.toISOString()
      };

      const newFlow = {
        id: 'new-flow-id',
        expires_at: new Date().toISOString()
      };

      mockFrontendApi.createRegistrationFlow.mockResolvedValue({ data: newFlow } as any);

      const result = await queryFn({ initial: initialFlow });

      expect(result).toEqual({ data: newFlow });
    });
  });

  describe('signUpOidc', () => {
    const { queryFn } = endpoints.signUpOidc;

    it('should call updateRegistrationFlow with correct params', async () => {
      const flow = { id: 'flow-id' };
      mockConstructFlowCsrfToken.mockReturnValue('csrf-token');
      mockFrontendApi.updateRegistrationFlow.mockResolvedValue({} as any);

      const result = await queryFn({
        flow,
        provider: OryProvider.Google
      });

      expect(result).toEqual({ data: {} });
      expect(mockFrontendApi.updateRegistrationFlow).toHaveBeenCalledWith({
        flowId: 'flow-id',
        body: {
          csrf_token: 'csrf-token',
          method: OryLoginMethod.Oidc,
          provider: 'google',
          traits: {
            loginService: 'google'
          },
          transient_payload: {}
        }
      });
    });

    it('should include transient_payload if provided', async () => {
      const flow = { id: 'flow-id' };
      mockConstructFlowCsrfToken.mockReturnValue('csrf-token');
      mockFrontendApi.updateRegistrationFlow.mockResolvedValue({} as any);

      await queryFn({
        flow,
        provider: OryProvider.Google,
        transient_payload: { custom: 'data' }
      });

      expect(mockFrontendApi.updateRegistrationFlow).toHaveBeenCalledWith({
        flowId: 'flow-id',
        body: expect.objectContaining({
          transient_payload: { custom: 'data' }
        })
      });
    });

    it('should redirect with googleHintEmail when browser_location_change_required', async () => {
      const flow = { id: 'flow-id' };
      mockConstructFlowCsrfToken.mockReturnValue('csrf-token');

      const error = new BaseException(422, 'Redirect required', 'browser_location_change_required', {
        redirect_browser_to: 'https://accounts.google.com/auth'
      });

      mockFrontendApi.updateRegistrationFlow.mockRejectedValue(error);

      const result = await queryFn({
        flow,
        provider: OryProvider.Google,
        googleHintEmail: 'test@example.com'
      });

      expect(result).toEqual({
        error: {
          status: 422,
          data: null
        }
      });
      expect(window.location.href).toBe('https://accounts.google.com/auth&login_hint=test%40example.com');
    });

    it('should redirect without googleHintEmail when browser_location_change_required', async () => {
      const flow = { id: 'flow-id' };
      mockConstructFlowCsrfToken.mockReturnValue('csrf-token');

      const error = new BaseException(422, 'Redirect required', 'browser_location_change_required', {
        redirect_browser_to: 'https://accounts.google.com/auth'
      });

      mockFrontendApi.updateRegistrationFlow.mockRejectedValue(error);

      const result = await queryFn({
        flow,
        provider: OryProvider.Google
      });

      expect(result).toEqual({
        error: {
          status: 422,
          data: null
        }
      });
      expect(window.location.href).toBe('https://accounts.google.com/auth');
    });

    it('should throw error for other error codes', async () => {
      const flow = { id: 'flow-id' };
      mockConstructFlowCsrfToken.mockReturnValue('csrf-token');

      const error = new BaseException(500, 'Internal error', 'INTERNAL_ERROR');

      mockFrontendApi.updateRegistrationFlow.mockRejectedValue(error);

      await expect(
        queryFn({
          flow,
          provider: OryProvider.Google
        })
      ).rejects.toBe(error);
    });
  });

  describe('getRecoveryFlow', () => {
    const { queryFn } = endpoints.getRecoveryFlow;

    it('should fetch recovery flow by id', async () => {
      const mockFlow = {
        id: 'recovery-flow-id',
        type: 'recovery'
      };

      mockFrontendApi.getRecoveryFlow.mockResolvedValue({ data: mockFlow } as any);

      const result = await queryFn('recovery-flow-id');

      expect(result).toEqual({ data: mockFlow });
      expect(mockFrontendApi.getRecoveryFlow).toHaveBeenCalledWith({
        flowId: 'recovery-flow-id'
      });
    });
  });

  describe('recoverPassword', () => {
    const endpoint = endpoints.recoverPassword;

    it('should have correct query configuration', () => {
      const result = endpoint.query({
        flow: { id: 'flow-id' },
        email: 'test@example.com',
        token: 'csrf-token',
        action: 'submit'
      });

      expect(result).toEqual({
        url: 'auth/forgot-password',
        method: 'POST',
        body: {
          flow: { id: 'flow-id' },
          email: 'test@example.com',
          token: 'csrf-token',
          action: 'submit'
        }
      });
    });
  });

  describe('signUp', () => {
    const endpoint = endpoints.signUp;

    it('should have correct query configuration', () => {
      const result = endpoint.query({
        flow: { id: 'flow-id' },
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        platform: 'web'
      });

      expect(result).toEqual({
        url: 'auth/sign-up',
        method: 'POST',
        body: {
          flow: { id: 'flow-id' },
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          platform: 'web'
        }
      });
    });
  });

  describe('logout', () => {
    const endpoint = endpoints.logout;

    it('should have correct query configuration', () => {
      const result = endpoint.query();

      expect(result).toEqual({
        url: 'auth/sign-out',
        method: 'POST'
      });
    });
  });

  describe('signUpWithInvitation', () => {
    const endpoint = endpoints.signUpWithInvitation;

    it('should have correct query configuration', () => {
      const data = {
        flow: { id: 'flow-id' },
        email: 'test@example.com',
        password: 'password123',
        invitationToken: 'invite-token'
      };

      const result = endpoint.query(data);

      expect(result).toEqual({
        url: 'auth/sign-up-invitation',
        method: 'POST',
        body: data
      });
    });
  });

  describe('getCurrentUser', () => {
    const endpoint = endpoints.getCurrentUser;

    it('should have correct query configuration', () => {
      const result = endpoint.query();

      expect(result).toEqual({
        url: 'user/get-current-user',
        method: 'GET'
      });
    });
  });

  describe('getOrganizationAndTeamOwner', () => {
    const endpoint = endpoints.getOrganizationAndTeamOwner;

    it('should have correct query configuration', () => {
      const result = endpoint.query();

      expect(result).toEqual({
        url: 'user/get-organization-team-owner',
        method: 'GET'
      });
    });
  });

  describe('forceLogout', () => {
    const endpoint = endpoints.forceLogout;

    it('should have correct query configuration', () => {
      const result = endpoint.query({ type: 'default' });

      expect(result).toEqual({
        url: 'auth/force-log-out',
        method: 'POST',
        body: { type: 'default' }
      });
    });
  });

  describe('updateUserIdentityId', () => {
    const endpoint = endpoints.updateUserIdentityId;

    it('should have correct query configuration', () => {
      const result = endpoint.query();

      expect(result).toEqual({
        url: 'user/update-identityId',
        method: 'POST'
      });
    });
  });

  describe('useGetCannyRedirectUrl', () => {
    const endpoint = endpoints.useGetCannyRedirectUrl;

    beforeEach(() => {
      Storage.prototype.removeItem = jest.fn();
    });

    it('should remove token and return correct query configuration', () => {
      const result = endpoint.query({ redirectTo: '/dashboard' });

      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('token');
      expect(result).toEqual({
        url: 'auth/get-canny-redirect-url?redirect=' + encodeURIComponent('/dashboard')
      });
    });
  });

  describe('forgetLastAccessAccount', () => {
    const endpoint = endpoints.forgetLastAccessAccount;

    it('should have correct query configuration', () => {
      const result = endpoint.query();

      expect(result).toEqual({
        url: 'auth/forget-last-access-account',
        method: 'POST'
      });
    });
  });
});
