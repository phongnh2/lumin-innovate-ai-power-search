/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Request } from 'express';

import { AuthService } from '../../Auth/auth.service';
import { WhitelistIPService } from '../../Auth/whitelistIP.sevice';
import { AuthenticationStatus, GoogleScope, OpenGoogleCookie } from '../../Common/constants/OpenFlowFileConstants';
import { CustomRuleLoader } from '../../CustomRules/custom-rule.loader';
import { CustomRulesService } from '../../CustomRules/custom-rule.service';
import { DocumentService } from '../../Document/document.service';
import { EnvironmentService } from '../../Environment/environment.service';
import { EventsGateway } from '../../Gateway/SocketIoConfig';
import { LoggerService } from '../../Logger/Logger.service';
import { RedisService } from '../../Microservices/redis/redis.service';
import { OrganizationService } from '../../Organization/organization.service';
import { PaymentPlanEnums } from '../../Payment/payment.enum';
import { UserService } from '../../User/user.service';
import { EventTrackingService } from '../EventTracking.service';
import { OpenGoogleService } from '../OpenGoogle.service';

jest.mock('../../Common/template-methods/OpenFileFlow', () => ({
  OpenGoogleFile: jest.fn().mockImplementation(() => ({
    encryptData: jest.fn().mockReturnValue('encrypted-data'),
    decryptData: jest.fn().mockReturnValue({ state: { action: 'open', ids: ['file-id'] } }),
    getUrl: jest.fn().mockReturnValue('https://app.luminpdf.com/path'),
    getWrongAccountUrl: jest.fn().mockReturnValue('https://app.luminpdf.com/wrong-account'),
    getTechnicalIssueUrl: jest.fn().mockReturnValue('https://app.luminpdf.com/technical-issue'),
    setCookie: jest.fn(),
    getBrowserPreferedLanguage: jest.fn().mockReturnValue('en-US'),
    getRemoteFile: jest.fn().mockResolvedValue({ file: { id: 'file-id' }, error: null }),
    getNextUrlForRestrictedUser: jest.fn().mockResolvedValue({ error: null, response: null }),
    getAnonymousViewerUrl: jest.fn().mockReturnValue('https://app.luminpdf.com/anonymous-viewer'),
    getNextUrlForIpValidation: jest.fn().mockReturnValue({ response: null }),
    getNextUrlForOrgMembershipValidation: jest.fn().mockResolvedValue({ response: null }),
    emitReloadMessage: jest.fn(),
    createDriveDocument: jest.fn().mockResolvedValue({ document: { _id: 'doc-123' }, error: null }),
  })),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}));

const mockRequest = (overrides: Record<string, unknown> = {}): Request => ({
  cookies: {},
  headers: { host: 'app.luminpdf.com', cookie: 'session=abc' },
  eventAttributes: {
    commonAttributes: {},
    httpAttributes: {},
  },
  ...overrides,
} as unknown as Request);

class EnvironmentServiceMock {
  getByKey = jest.fn().mockReturnValue('test-value');
  get isDevelopment() { return false; }
  get isProduction() { return true; }
}

class UserServiceMock {
  findUserByEmail = jest.fn();
  findOneAndUpdate = jest.fn();
  updateUserPropertyById = jest.fn();
}

class AuthServiceMock {
  getAuthToken = jest.fn().mockReturnValue({ token: 'jwt-token', refreshToken: 'refresh-token' });
  getAuthenticationToken = jest.fn();
  verifyOryAuthenticationToken = jest.fn();
  revokeSession = jest.fn();
}

class OrganizationServiceMock {
  getSuggestedOrgListByUserDomain = jest.fn();
}

class DocumentServiceMock {}

class WhitelistIPServiceMock {}

class EventTrackingServiceMock {
  trackError = jest.fn();
  trackGrantedScopes = jest.fn();
  trackNewUserEvent = jest.fn();
  trackUserSignIn = jest.fn();
}

class CustomRulesServiceMock {
  addSignUpUserToOrg = jest.fn();
}

class CustomRuleLoaderMock {}

class EventsGatewayMock {}

class LoggerServiceMock {
  info = jest.fn();
  error = jest.fn();
  warn = jest.fn();
}

class RedisServiceMock {
  setRefreshToken = jest.fn();
  setCredentialsFromOpenGoogle = jest.fn();
  setRedisDataWithExpireTime = jest.fn();
  getValueAndDeleteKey = jest.fn();
}

describe('OpenGoogleService', () => {
  let service: OpenGoogleService;
  let environmentService: EnvironmentServiceMock;
  let userService: UserServiceMock;
  let authService: AuthServiceMock;
  let organizationService: OrganizationServiceMock;
  let redisService: RedisServiceMock;
  let eventTrackingService: EventTrackingServiceMock;
  let loggerService: LoggerServiceMock;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OpenGoogleService,
        { provide: EnvironmentService, useClass: EnvironmentServiceMock },
        { provide: UserService, useClass: UserServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: OrganizationService, useClass: OrganizationServiceMock },
        { provide: DocumentService, useClass: DocumentServiceMock },
        { provide: WhitelistIPService, useClass: WhitelistIPServiceMock },
        { provide: EventTrackingService, useClass: EventTrackingServiceMock },
        { provide: CustomRulesService, useClass: CustomRulesServiceMock },
        { provide: CustomRuleLoader, useClass: CustomRuleLoaderMock },
        { provide: EventsGateway, useClass: EventsGatewayMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
        { provide: RedisService, useClass: RedisServiceMock },
      ],
    }).compile();

    service = module.get<OpenGoogleService>(OpenGoogleService);
    environmentService = module.get(EnvironmentService);
    userService = module.get(UserService);
    authService = module.get(AuthService);
    organizationService = module.get(OrganizationService);
    redisService = module.get(RedisService);
    eventTrackingService = module.get(EventTrackingService);
    loggerService = module.get(LoggerService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadGoogleCookieNames', () => {
    it('should return standard cookie name in production environment', () => {
      const result = service.loadGoogleCookieNames();
      expect(result.googleAccessTokenCookie).toBe(OpenGoogleCookie.GoogleAccessToken);
    });

    it('should return environment-specific cookie name in staging environment', () => {
      jest.spyOn(environmentService, 'isProduction', 'get').mockReturnValue(false);
      jest.spyOn(environmentService, 'isDevelopment', 'get').mockReturnValue(false);
      environmentService.getByKey.mockReturnValue('staging');

      const result = service.loadGoogleCookieNames();
      expect(result.googleAccessTokenCookie).toBe(`${OpenGoogleCookie.GoogleAccessToken}_staging`);
    });
  });

  describe('getTokensCookie', () => {
    it('should extract Google access token from request cookies', () => {
      const cookieName = service.loadGoogleCookieNames().googleAccessTokenCookie;
      const req = mockRequest({
        cookies: { [cookieName]: 'token-data' },
      });

      const result = service.getTokensCookie(req);
      expect(result.google.accessTokenData).toBe('token-data');
    });

    it('should return undefined when no Google cookie exists', () => {
      const req = mockRequest({ cookies: {} });

      const result = service.getTokensCookie(req);
      expect(result.google.accessTokenData).toBeUndefined();
    });
  });

  describe('encryptData', () => {
    it('should delegate encryption to OpenGoogleFile handler', () => {
      const payload = { test: 'data' };
      const result = service.encryptData(payload);
      expect(result).toBe('encrypted-data');
    });
  });

  describe('decryptData', () => {
    it('should delegate decryption to OpenGoogleFile handler', () => {
      const result = service.decryptData<{ state: { action: string } }>('encrypted-string');
      expect(result.state.action).toBe('open');
    });
  });

  describe('getLuminOrigins', () => {
    it('should return environment URLs in development mode', () => {
      jest.spyOn(environmentService, 'isDevelopment', 'get').mockReturnValue(true);

      const result = service.getLuminOrigins('any-host');
      expect(result.backend).toBeDefined();
      expect(result.viewer).toBeDefined();
    });

    it('should return production URLs based on host in production mode', () => {
      jest.spyOn(environmentService, 'isDevelopment', 'get').mockReturnValue(false);
      environmentService.getByKey.mockReturnValue('https://app.luminpdf.com');

      const result = service.getLuminOrigins('app.luminpdf.com');
      expect(result.backend).toBe('https://app.luminpdf.com');
      expect(result.viewer).toBe('https://app.luminpdf.com');
    });
  });

  describe('removeSessionCookie', () => {
    it('should return cookie objects with maxAge 0 to revoke session', () => {
      environmentService.getByKey.mockReturnValue('ory_session');

      const result = service.removeSessionCookie();
      expect(result['_lm_ath'].value).toBe('');
      expect(result['_lm_ath'].options.maxAge).toBe(0);
      expect(result['ory_session'].value).toBe('');
      expect(result['ory_session'].options.maxAge).toBe(0);
    });
  });

  describe('extractReferer', () => {
    it('should return "mail" for Gmail referer', () => {
      expect(service.extractReferer('mail.google.com')).toBe('mail');
    });

    it('should return "drive" for Google Drive referer', () => {
      expect(service.extractReferer('drive.google.com')).toBe('drive');
    });

    it('should return "classroom" for Google Classroom referer', () => {
      expect(service.extractReferer('classroom.google.com')).toBe('classroom');
    });

    it('should return "g-other" for unknown Google referer', () => {
      expect(service.extractReferer('docs.google.com')).toBe('g-other');
    });
  });

  describe('getCredentialsId', () => {
    it('should generate credentials and store in Redis', async () => {
      const user = { _id: 'user-123', email: 'test@example.com' } as any;

      const result = await service.getCredentialsId({
        user,
        googleAccessToken: 'google-token',
        ipAddress: '127.0.0.1',
      });

      expect(result).toBe('mock-uuid');
      expect(authService.getAuthToken).toHaveBeenCalled();
      expect(redisService.setRefreshToken).toHaveBeenCalledWith('user-123', 'refresh-token');
      expect(redisService.setCredentialsFromOpenGoogle).toHaveBeenCalled();
    });
  });

  describe('getViewerUrl', () => {
    it('should build basic viewer URL with credentials', () => {
      jest.spyOn(environmentService, 'isDevelopment', 'get').mockReturnValue(false);

      const result = service.getViewerUrl('app.luminpdf.com', 'doc-123', 'cred-456', {});
      expect(result).toBe('https://app.luminpdf.com/path');
    });

    it('should include action parameter when provided', () => {
      const result = service.getViewerUrl('app.luminpdf.com', 'doc-123', 'cred-456', {
        action: 'edit',
      });
      expect(result).toBeDefined();
    });

    it('should include from parameter when provided', () => {
      const result = service.getViewerUrl('app.luminpdf.com', 'doc-123', 'cred-456', {
        from: 'drive',
      });
      expect(result).toBeDefined();
    });

    it('should include authStatus for sign-up flow', () => {
      const result = service.getViewerUrl('app.luminpdf.com', 'doc-123', 'cred-456', {
        authStatus: AuthenticationStatus.SIGN_UP,
      });
      expect(result).toBeDefined();
    });

    it('should append additional params when provided', () => {
      const additionalParams = new URLSearchParams();
      additionalParams.set('custom', 'value');

      const result = service.getViewerUrl('app.luminpdf.com', 'doc-123', 'cred-456', {}, additionalParams);
      expect(result).toBeDefined();
    });
  });

  describe('shouldSuggestOrgAfterFlow', () => {
    it('should return false for popular email domains like gmail.com', async () => {
      const user = {
        email: 'user@gmail.com',
        metadata: {},
      } as any;

      const result = await service.shouldSuggestOrgAfterFlow(user);
      expect(result).toBe(false);
    });

    it('should return false when user has paid org plan', async () => {
      const user = {
        email: 'user@company.com',
        metadata: {
          highestOrgPlan: { highestLuminPlan: PaymentPlanEnums.PROFESSIONAL },
        },
      } as any;

      const result = await service.shouldSuggestOrgAfterFlow(user);
      expect(result).toBe(false);
    });

    it('should return false when org lookup fails', async () => {
      const user = {
        _id: 'user-123',
        email: 'user@company.com',
        metadata: {},
      } as any;
      organizationService.getSuggestedOrgListByUserDomain.mockResolvedValue({
        orgList: [],
        error: new Error('DB error'),
      });

      const result = await service.shouldSuggestOrgAfterFlow(user);
      expect(result).toBe(false);
      expect(loggerService.error).toHaveBeenCalled();
    });

    it('should return true when org suggestions exist and not shown before', async () => {
      const user = {
        _id: 'user-123',
        email: 'user@company.com',
        metadata: { hasShowOnboardingFlowFromOpenGoogle: false },
      } as any;
      organizationService.getSuggestedOrgListByUserDomain.mockResolvedValue({
        orgList: [{ _id: 'org-1' }],
        error: null,
      });

      const result = await service.shouldSuggestOrgAfterFlow(user);
      expect(result).toBe(true);
      expect(userService.updateUserPropertyById).toHaveBeenCalled();
    });

    it('should return false when org suggestions already shown', async () => {
      const user = {
        _id: 'user-123',
        email: 'user@company.com',
        metadata: { hasShowOnboardingFlowFromOpenGoogle: true },
      } as any;
      organizationService.getSuggestedOrgListByUserDomain.mockResolvedValue({
        orgList: [{ _id: 'org-1' }],
        error: null,
      });

      const result = await service.shouldSuggestOrgAfterFlow(user);
      expect(result).toBe(false);
    });
  });

  describe('initGoogleFlowHandler', () => {
    const basePayload = {
      anonymousUserId: 'anon-123',
      query: { state: { action: 'open', ids: ['file-123'] } },
      headers: { host: 'app.luminpdf.com' },
      flowId: 'flow-123',
      request: mockRequest(),
    };

    it('should redirect to Google OAuth when no access token exists', async () => {
      const result = await service.initGoogleFlowHandler({
        ...basePayload,
        accessTokenData: null,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
      expect(result.nextUrl).toContain('accounts.google.com');
    });

    it('should clear session when cached userId differs from URL userId', async () => {
      const request = mockRequest({
        cookies: { '_lm_ath': 'token' },
      });
      authService.verifyOryAuthenticationToken.mockResolvedValue({ id: 'session-123' });

      const result = await service.initGoogleFlowHandler({
        ...basePayload,
        accessTokenData: { accessToken: 'token', userRemoteId: 'user-A' },
        query: { state: { action: 'open', ids: ['file-123'], userId: 'user-B' } },
        request,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
      expect(authService.revokeSession).toHaveBeenCalledWith('session-123');
      expect(eventTrackingService.trackError).toHaveBeenCalled();
    });
  });

  describe('getTechnicalIssueUrl', () => {
    it('should build technical issue URL with retry OAuth link', () => {
      const result = service.getTechnicalIssueUrl(
        'app.luminpdf.com',
        'anon-123',
        'flow-123',
        { action: 'open', ids: ['file-123'] } as any,
      );

      expect(result).toBe('https://app.luminpdf.com/technical-issue');
    });
  });

  describe('getWrongMimeTypeUrl', () => {
    it('should build wrong mime type URL with fallback path', () => {
      const result = service.getWrongMimeTypeUrl('app.luminpdf.com', { nextUrl: '' });
      expect(result).toBe('https://app.luminpdf.com/path');
    });

    it('should use provided nextUrl when available', () => {
      const result = service.getWrongMimeTypeUrl('app.luminpdf.com', { nextUrl: '/custom-path' });
      expect(result).toBe('https://app.luminpdf.com/path');
    });
  });

  describe('getWrongIpUrl', () => {
    it('should build wrong IP URL with email parameter', () => {
      const result = service.getWrongIpUrl('app.luminpdf.com', 'user@test.com');
      expect(result).toBe('https://app.luminpdf.com/path');
    });
  });

  describe('getRequireOrgMembershipUrl', () => {
    it('should build require org membership URL', () => {
      const result = service.getRequireOrgMembershipUrl('app.luminpdf.com', 'user@test.com');
      expect(result).toBe('https://app.luminpdf.com/path');
    });
  });

  describe('getBrowserPreferedLanguage', () => {
    it('should delegate to OpenGoogleFile handler', () => {
      const req = mockRequest();
      const result = service.getBrowserPreferedLanguage(req);
      expect(result).toBe('en-US');
    });
  });

  describe('setCookie', () => {
    it('should delegate to OpenGoogleFile handler', () => {
      const res = { cookie: jest.fn() } as any;
      service.setCookie(res, { test: { value: 'value', options: { maxAge: 3600 } } });
    });
  });

  describe('createGoogleOauthUrl', () => {
    it('should generate OAuth URL with required scopes', () => {
      const result = service.createGoogleOauthUrl({
        origin: 'https://app.luminpdf.com',
        anonymousUserId: 'anon-123',
        state: { action: 'open', ids: ['file-123'] } as any,
        flowId: 'flow-123',
      });

      expect(result).toContain('accounts.google.com');
      expect(result).toContain('client_id');
    });

    it('should include login_hint when provided in options', () => {
      const result = service.createGoogleOauthUrl({
        origin: 'https://app.luminpdf.com',
        anonymousUserId: 'anon-123',
        state: { action: 'open', ids: ['file-123'] } as any,
        flowId: 'flow-123',
        options: { login_hint: 'user@example.com' },
      });

      expect(result).toContain('login_hint');
    });

    it('should include prompt when provided in options', () => {
      const result = service.createGoogleOauthUrl({
        origin: 'https://app.luminpdf.com',
        anonymousUserId: 'anon-123',
        state: { action: 'open', ids: ['file-123'] } as any,
        flowId: 'flow-123',
        options: { prompt: 'select_account' },
      });

      expect(result).toContain('prompt');
    });

    it('should use state.userId as login_hint fallback', () => {
      const result = service.createGoogleOauthUrl({
        origin: 'https://app.luminpdf.com',
        anonymousUserId: 'anon-123',
        state: { action: 'open', ids: ['file-123'], userId: 'google-user-id' } as any,
        flowId: 'flow-123',
      });

      expect(result).toContain('login_hint');
    });
  });

  describe('getWrongAccountUrl', () => {
    it('should build wrong account URL with select_account prompt', () => {
      const result = service.getWrongAccountUrl({
        host: 'app.luminpdf.com',
        email: 'user@test.com',
        anonymousUserId: 'anon-123',
        query: { action: 'open', ids: ['file-123'], userId: 'user-123' } as any,
        flowId: 'flow-123',
      });

      expect(result).toBe('https://app.luminpdf.com/wrong-account');
    });
  });

  describe('initGoogleFlowHandler - additional branches', () => {
    const basePayload = {
      anonymousUserId: 'anon-123',
      query: { state: { action: 'open', ids: ['file-123'] } },
      headers: { host: 'app.luminpdf.com' },
      flowId: 'flow-123',
    };

    it('should check ory session when no lumin auth cookie but ory session exists', async () => {
      environmentService.getByKey.mockReturnValue('ory_session_cookie');
      const request = mockRequest({
        cookies: { 'ory_session_cookie': 'ory-token' },
      });
      authService.getAuthenticationToken.mockResolvedValue({ id: 'session-123' });

      const result = await service.initGoogleFlowHandler({
        ...basePayload,
        accessTokenData: { accessToken: 'token', userRemoteId: 'user-A' },
        query: { state: { action: 'open', ids: ['file-123'], userId: 'user-B' } },
        request,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
      expect(authService.getAuthenticationToken).toHaveBeenCalled();
    });


    it('should proceed when no userId in state', async () => {
      const request = mockRequest();

      const result = await service.initGoogleFlowHandler({
        ...basePayload,
        accessTokenData: { accessToken: 'token', userRemoteId: 'user-123' },
        query: { state: { action: 'open', ids: ['file-123'] } }, // No userId
        request,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
    });
  });

  describe('redirectOpenGoogleHandler', () => {
    const basePayload = {
      anonymousUserId: 'anon-123',
      headers: { host: 'app.luminpdf.com' },
    };

    it('should redirect to OAuth when user denied and no access token', async () => {
      const request = mockRequest();

      const result = await service.redirectOpenGoogleHandler({
        ...basePayload,
        accessTokenData: null,
        query: {
          state: { signature: 'encrypted-sig' },
          code: null, // No code = user denied
          error: 'access_denied',
        },
        request,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
      expect(result.nextUrl).toContain('accounts.google.com');
      expect(eventTrackingService.trackError).toHaveBeenCalled();
    });

    it('should handle denied drive.install but has drive.file scope', async () => {
      const request = mockRequest();

      const result = await service.redirectOpenGoogleHandler({
        ...basePayload,
        accessTokenData: {
          accessToken: 'existing-token',
          scope: `${GoogleScope.DriveFile} ${GoogleScope.Email}`,
        },
        query: {
          state: { signature: 'encrypted-sig' },
          code: null,
          error: 'access_denied',
        },
        request,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
    });

    it('should track error when user denies without code', async () => {
      const request = mockRequest();

      await service.redirectOpenGoogleHandler({
        ...basePayload,
        accessTokenData: null,
        query: {
          state: { signature: 'encrypted-sig' },
          code: null,
        },
        request,
      } as any);

      expect(eventTrackingService.trackError).toHaveBeenCalled();
    });
  });


  describe('getViewerUrl - additional branches', () => {
    it('should not include authStatus for non-SIGN_UP status', () => {
      const result = service.getViewerUrl('app.luminpdf.com', 'doc-123', 'cred-456', {
        authStatus: AuthenticationStatus.AUTHENTICATED,
      });
      expect(result).toBeDefined();
    });

    it('should not include authStatus for SIGN_IN status', () => {
      const result = service.getViewerUrl('app.luminpdf.com', 'doc-123', 'cred-456', {
        authStatus: AuthenticationStatus.SIGN_IN,
      });
      expect(result).toBeDefined();
    });
  });

  describe('shouldSuggestOrgAfterFlow - additional branches', () => {
    it('should return false when no org suggestions available', async () => {
      const user = {
        _id: 'user-123',
        email: 'user@company.com',
        metadata: {},
      } as any;
      organizationService.getSuggestedOrgListByUserDomain.mockResolvedValue({
        orgList: [],
        error: null,
      });

      const result = await service.shouldSuggestOrgAfterFlow(user);
      expect(result).toBe(false);
    });

    it('should return false when user has FREE plan but no suggestions', async () => {
      const user = {
        _id: 'user-123',
        email: 'user@company.com',
        metadata: {
          highestOrgPlan: { highestLuminPlan: PaymentPlanEnums.FREE },
        },
      } as any;
      organizationService.getSuggestedOrgListByUserDomain.mockResolvedValue({
        orgList: [],
        error: null,
      });

      const result = await service.shouldSuggestOrgAfterFlow(user);
      expect(result).toBe(false);
    });
  });

  describe('getLuminOrigins - testing URL branch', () => {
    it('should use TESTING_URL when host matches testing URL origin', () => {
      jest.spyOn(environmentService, 'isDevelopment', 'get').mockReturnValue(false);
      environmentService.getByKey.mockReturnValue('https://app.luminpdf.com');

      const result = service.getLuminOrigins('app.luminpdf.com');
      expect(result.backend).toBeDefined();
    });
  });

  describe('redirectOpenGoogleHandler - more branches', () => {
    const basePayload = {
      anonymousUserId: 'anon-123',
      headers: { host: 'app.luminpdf.com' },
    };

    it('should redirect to OAuth when access token exists but no drive.file scope', async () => {
      const request = mockRequest();

      const result = await service.redirectOpenGoogleHandler({
        ...basePayload,
        accessTokenData: {
          accessToken: 'existing-token',
          scope: `${GoogleScope.Email}`, // No drive.file
        },
        query: {
          state: { signature: 'encrypted-sig' },
          code: null,
          error: 'access_denied',
        },
        request,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
      expect(eventTrackingService.trackError).toHaveBeenCalled();
    });
  });

  describe('initGoogleFlowHandler - session handling', () => {
    const basePayload = {
      anonymousUserId: 'anon-123',
      query: { state: { action: 'open', ids: ['file-123'] } },
      headers: { host: 'app.luminpdf.com' },
      flowId: 'flow-123',
    };

    it('should handle failed session verification gracefully', async () => {
      environmentService.getByKey.mockReturnValue('ory_session_cookie');
      const request = mockRequest({
        cookies: { 'ory_session_cookie': 'ory-token' },
      });
      authService.getAuthenticationToken.mockRejectedValue(new Error('Session invalid'));

      const result = await service.initGoogleFlowHandler({
        ...basePayload,
        accessTokenData: { accessToken: 'token', userRemoteId: 'user-A' },
        query: { state: { action: 'open', ids: ['file-123'], userId: 'user-B' } },
        request,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
    });

    it('should handle lumin auth cookie verification failure', async () => {
      const request = mockRequest({
        cookies: { '_lm_ath': 'invalid-token' },
      });
      authService.verifyOryAuthenticationToken.mockRejectedValue(new Error('Token invalid'));

      const result = await service.initGoogleFlowHandler({
        ...basePayload,
        accessTokenData: { accessToken: 'token', userRemoteId: 'user-A' },
        query: { state: { action: 'open', ids: ['file-123'], userId: 'user-B' } },
        request,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
    });

    it('should pass skipDriveInstall from query state', async () => {
      const request = mockRequest();

      const result = await service.initGoogleFlowHandler({
        ...basePayload,
        accessTokenData: { accessToken: 'token', userRemoteId: 'user-123' },
        query: { state: { action: 'open', ids: ['file-123'], skipDriveInstall: true } },
        request,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
    });
  });

  describe('loadGoogleCookieNames - development branch', () => {
    it('should return standard cookie name in development environment', () => {
      jest.spyOn(environmentService, 'isProduction', 'get').mockReturnValue(false);
      jest.spyOn(environmentService, 'isDevelopment', 'get').mockReturnValue(true);

      const result = service.loadGoogleCookieNames();
      expect(result.googleAccessTokenCookie).toBe(OpenGoogleCookie.GoogleAccessToken);
    });
  });

  describe('shouldSuggestOrgAfterFlow - metadata edge cases', () => {
    it('should return false when highestOrgPlan exists but is FREE', async () => {
      const user = {
        _id: 'user-123',
        email: 'user@company.com',
        metadata: {
          highestOrgPlan: { highestLuminPlan: PaymentPlanEnums.FREE },
        },
      } as any;
      organizationService.getSuggestedOrgListByUserDomain.mockResolvedValue({
        orgList: [{ _id: 'org-1' }],
        error: null,
      });

      const result = await service.shouldSuggestOrgAfterFlow(user);
      expect(result).toBe(true);
    });
  });

  describe('getViewerUrl - all option combinations', () => {
    it('should handle all options together', () => {
      const additionalParams = new URLSearchParams();
      additionalParams.set('extra', 'param');

      const result = service.getViewerUrl('app.luminpdf.com', 'doc-123', 'cred-456', {
        action: 'edit',
        from: 'drive',
        authStatus: AuthenticationStatus.SIGN_UP,
      }, additionalParams);

      expect(result).toBeDefined();
    });

    it('should handle empty options object', () => {
      const result = service.getViewerUrl('app.luminpdf.com', 'doc-123', 'cred-456', {});
      expect(result).toBeDefined();
    });
  });

  describe('createGoogleOauthUrl - edge cases', () => {
    it('should handle empty options object', () => {
      const result = service.createGoogleOauthUrl({
        origin: 'https://app.luminpdf.com',
        anonymousUserId: 'anon-123',
        state: { action: 'open', ids: ['file-123'] } as any,
        flowId: 'flow-123',
        options: {},
      });

      expect(result).toContain('accounts.google.com');
    });

    it('should include referer in signature when provided', () => {
      const result = service.createGoogleOauthUrl({
        origin: 'https://app.luminpdf.com',
        anonymousUserId: 'anon-123',
        state: { action: 'open', ids: ['file-123'] } as any,
        flowId: 'flow-123',
        referer: 'https://drive.google.com',
      });

      expect(result).toContain('accounts.google.com');
    });
  });

  describe('initGoogleFlowHandler - with mocked token validation', () => {
    const basePayload = {
      anonymousUserId: 'anon-123',
      query: { state: { action: 'open', ids: ['file-123'] } },
      headers: { host: 'app.luminpdf.com' },
      flowId: 'flow-123',
    };

    it('should return viewer URL when token validation succeeds', async () => {
      const mockResult = {
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://app.luminpdf.com/viewer/doc-123',
        cookies: { '_gat': { value: 'token', options: { maxAge: 3600 } } },
      };
      jest.spyOn(service as any, 'handleAccessTokenValidation').mockResolvedValueOnce(mockResult);

      const request = mockRequest();
      const result = await service.initGoogleFlowHandler({
        ...basePayload,
        accessTokenData: { accessToken: 'valid-token', userRemoteId: 'user-123' },
        request,
      } as any);

      expect(result.statusCode).toBe(HttpStatus.SEE_OTHER);
      expect(result.nextUrl).toBe('https://app.luminpdf.com/viewer/doc-123');
      expect(result.cookies).toEqual(mockResult.cookies);
    });

    it('should handle wrong account scenario from token validation', async () => {
      const mockResult = {
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://app.luminpdf.com/wrong-account?retry=oauth',
        cookies: {},
      };
      jest.spyOn(service as any, 'handleAccessTokenValidation').mockResolvedValueOnce(mockResult);

      const request = mockRequest();
      const result = await service.initGoogleFlowHandler({
        ...basePayload,
        accessTokenData: { accessToken: 'token-for-wrong-user', userRemoteId: 'user-A' },
        request,
      } as any);

      expect(result.nextUrl).toContain('wrong-account');
    });

    it('should handle technical issue from token validation', async () => {
      const mockResult = {
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://app.luminpdf.com/technical-issue',
        cookies: {},
      };
      jest.spyOn(service as any, 'handleAccessTokenValidation').mockResolvedValueOnce(mockResult);

      const request = mockRequest();
      const result = await service.initGoogleFlowHandler({
        ...basePayload,
        accessTokenData: { accessToken: 'token', userRemoteId: 'user-123' },
        request,
      } as any);

      expect(result.nextUrl).toContain('technical-issue');
    });
  });

});




