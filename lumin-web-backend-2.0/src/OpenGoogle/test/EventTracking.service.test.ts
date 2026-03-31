/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test } from '@nestjs/testing';
import { Request } from 'express';

import { LUMIN_AUTHENTICATION_COOKIE_NAME } from '../../constant';
import { LoggerService } from '../../Logger/Logger.service';
import { AuthService } from '../../Auth/auth.service';
import { PinpointService } from '../../Pinpoint/pinpoint.service';
import { UserService } from '../../User/user.service';
import { GA4Service } from '../../GA4/GA4.service';
import { BrazeService } from '../../Braze/braze.service';
import { EventTrackingService } from '../EventTracking.service';
import { OpenGoogleEvent } from '../open-google-event';
import { OpenGoogleEventType } from '../open-google-event';
import { OpenGoogleService } from '../OpenGoogle.service';

const mockRequest = (overrides: Record<string, unknown> = {}): Request => ({
  cookies: {},
  headers: { host: 'app.luminpdf.com', referer: 'https://drive.google.com' },
  originalUrl: '/open-google?state=test',
  eventAttributes: {
    httpAttributes: { userId: 'user-123', anonymousUserId: 'anon-123' },
    commonAttributes: { flowId: 'flow-123' },
  },
  logDelayTime: 0,
  ...overrides,
} as unknown as Request);

class LoggerServiceMock {
  info = jest.fn();
  error = jest.fn();
}

const openGoogleServiceMock = {
  getLuminOrigins: jest.fn().mockReturnValue({ backend: 'https://app.luminpdf.com', viewer: 'https://app.luminpdf.com' }),
  getBrowserPreferedLanguage: jest.fn().mockReturnValue('en-US'),
  getTokensCookie: jest.fn().mockReturnValue({ google: { accessTokenData: null } }),
};

class AuthServiceMock {
  verifyOryAuthenticationToken = jest.fn().mockResolvedValue(null);
}

class PinpointServiceMock {
  constructPayloadFromLogMessage = jest.fn().mockReturnValue({ eventData: 'mock' });
  add = jest.fn();
}

class UserServiceMock {
  findUserByEmail = jest.fn();
}

class GA4ServiceMock {
  getCommonAttributesForOpenGoogleEvent = jest.fn().mockReturnValue({ param1: 'value1' });
  send = jest.fn();
}

class BrazeServiceMock {
  trackNewUserEvent = jest.fn();
}

describe('EventTrackingService', () => {
  let service: EventTrackingService;
  let loggerService: LoggerServiceMock;
  let authService: AuthServiceMock;
  let pinpointService: PinpointServiceMock;
  let userService: UserServiceMock;
  let ga4Service: GA4ServiceMock;
  let brazeService: BrazeServiceMock;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventTrackingService,
        { provide: LoggerService, useClass: LoggerServiceMock },
        { provide: OpenGoogleService, useValue: openGoogleServiceMock as any },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: PinpointService, useClass: PinpointServiceMock },
        { provide: UserService, useClass: UserServiceMock },
        { provide: GA4Service, useClass: GA4ServiceMock },
        { provide: BrazeService, useClass: BrazeServiceMock },
      ],
    }).compile();

    service = module.get<EventTrackingService>(EventTrackingService);
    loggerService = module.get(LoggerService);
    authService = module.get(AuthService);
    pinpointService = module.get(PinpointService);
    userService = module.get(UserService);
    ga4Service = module.get(GA4Service);
    brazeService = module.get(BrazeService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    openGoogleServiceMock.getLuminOrigins.mockReturnValue({
      backend: 'https://app.luminpdf.com',
      viewer: 'https://app.luminpdf.com',
    });
    openGoogleServiceMock.getBrowserPreferedLanguage.mockReturnValue('en-US');
    openGoogleServiceMock.getTokensCookie.mockReturnValue({ google: { accessTokenData: null } });
    (authService.verifyOryAuthenticationToken as jest.Mock).mockResolvedValue(null);
  });

  describe('getCommonEventAttributes', () => {
    it('should return event attributes with request URL and referrer', async () => {
      const req = mockRequest();
      const state = { userId: 'google-user-123' };
      openGoogleServiceMock.getLuminOrigins.mockReturnValue({
        backend: 'https://app.luminpdf.com',
        viewer: 'https://app.luminpdf.com',
      });

      const result = await service.getCommonEventAttributes(req, state as any);

      expect(result.currentURL).toBeDefined();
      expect(result.currentURL).toContain('https://app.luminpdf.com');
      expect(result.referrer).toBe('https://drive.google.com');
      expect(result.acceptLanguage).toBe('en-US');
      expect(result.googleUserIdFromURL).toBe('google-user-123');
      expect(openGoogleServiceMock.getLuminOrigins).toHaveBeenCalledWith('app.luminpdf.com');
      expect(openGoogleServiceMock.getBrowserPreferedLanguage).toHaveBeenCalledWith(req);
    });

    it('should include luminUserId from request.user when available', async () => {
      const req = mockRequest({
        user: { _id: 'lumin-user-456', email: 'user@test.com' },
      });
      const state = { userId: 'google-user-123' };

      const result = await service.getCommonEventAttributes(req, state as any);

      expect(result.luminUserId).toBe('lumin-user-456');
      expect(authService.verifyOryAuthenticationToken).not.toHaveBeenCalled();
    });

    it('should fetch luminUserId from session when request.user is not available', async () => {
      const req = mockRequest({
        cookies: { [LUMIN_AUTHENTICATION_COOKIE_NAME]: 'session-token' },
      });
      const state = { userId: 'google-user-123' };
      authService.verifyOryAuthenticationToken.mockResolvedValue({
        identity: { traits: { email: 'user@test.com' } },
      });
      userService.findUserByEmail.mockResolvedValue({ _id: 'lumin-user-789' } as any);

      const result = await service.getCommonEventAttributes(req, state as any);

      expect(result.luminUserId).toBe('lumin-user-789');
      expect(authService.verifyOryAuthenticationToken).toHaveBeenCalledWith('session-token');
      expect(userService.findUserByEmail).toHaveBeenCalledWith('user@test.com');
    });

    it('should handle session verification failure gracefully', async () => {
      const req = mockRequest({
        cookies: { [LUMIN_AUTHENTICATION_COOKIE_NAME]: 'invalid-token' },
      });
      const state = { userId: 'google-user-123' };
      authService.verifyOryAuthenticationToken.mockRejectedValue(new Error('Invalid token'));

      const result = await service.getCommonEventAttributes(req, state as any);

      expect(result.luminUserId).toBeUndefined();
      expect(userService.findUserByEmail).not.toHaveBeenCalled();
    });

    it('should handle user not found after session verification', async () => {
      const req = mockRequest({
        cookies: { [LUMIN_AUTHENTICATION_COOKIE_NAME]: 'session-token' },
      });
      const state = { userId: 'google-user-123' };
      authService.verifyOryAuthenticationToken.mockResolvedValue({
        identity: { traits: { email: 'user@test.com' } },
      });
      userService.findUserByEmail.mockResolvedValue(null);

      const result = await service.getCommonEventAttributes(req, state as any);

      expect(result.luminUserId).toBeUndefined();
    });

    it('should include Google access token info when available', async () => {
      const req = mockRequest();
      const state = { userId: 'google-user-123' };
      const tokenData = JSON.stringify({
        scope: 'drive.file drive.install userinfo.email',
        expireAt: Date.now() + 3600000,
        userRemoteId: 'google-user-456',
      });
      openGoogleServiceMock.getTokensCookie.mockReturnValue({
        google: { accessTokenData: tokenData },
      });

      const result = await service.getCommonEventAttributes(req, state as any);

      expect(result.googleAccessTokenInfo).toBeDefined();
      const tokenInfo = result.googleAccessTokenInfo as any;
      expect(tokenInfo.scopes).toEqual(['drive.file', 'drive.install', 'userinfo.email']);
      expect(tokenInfo.userRemoteId).toBe('google-user-456');
      expect(tokenInfo.isExpired).toBe(false);
    });

    it('should mark token as expired when expireAt is in the past', async () => {
      const req = mockRequest();
      const state = { userId: 'google-user-123' };
      const tokenData = JSON.stringify({
        scope: 'drive.file',
        expireAt: Date.now() - 3600000,
        userRemoteId: 'google-user-456',
      });
      openGoogleServiceMock.getTokensCookie.mockReturnValue({
        google: { accessTokenData: tokenData },
      });

      const result = await service.getCommonEventAttributes(req, state as any);

      const tokenInfo = result.googleAccessTokenInfo as any;
      expect(tokenInfo.isExpired).toBe(true);
    });

    it('should return empty object and log error on exception', async () => {
      const req = mockRequest();
      const state = { userId: 'google-user-123' };
      openGoogleServiceMock.getLuminOrigins.mockImplementationOnce(() => {
        throw new Error('Service error');
      });

      const result = await service.getCommonEventAttributes(req, state as any);

      expect(result).toEqual({});
      expect(loggerService.error).toHaveBeenCalled();
      expect(loggerService.error.mock.calls[0][0].errorCode).toBe('error_getting_event_attributes');
    });
  });

  describe('trackInitFlow', () => {
    it('should log init flow event with delay', () => {
      const req = mockRequest();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      service.trackInitFlow(req);

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect((req as any).logDelayTime).toBe(1000);
      expect(pinpointService.add).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });
  });

  describe('trackPageView', () => {
    it('should log page view event with redirect URL', () => {
      const req = mockRequest();
      const redirectUrl = 'https://app.luminpdf.com/viewer';
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      service.trackPageView(req, redirectUrl);

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect((req as any).logDelayTime).toBe(1000);
      expect(pinpointService.add).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });
  });

  describe('trackNewUserEvent', () => {
    it('should track new user sign-up with all required data', () => {
      const req = mockRequest();
      const user = {
        _id: 'new-user-123',
        email: 'user@company.com',
      } as any;
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      service.trackNewUserEvent(req, user);

      expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
      expect(brazeService.trackNewUserEvent).toHaveBeenCalled();
      expect(pinpointService.add).toHaveBeenCalledTimes(2);
      expect(ga4Service.send).toHaveBeenCalledWith({
        eventName: 'user_sign_up_pinpoint',
        params: { param1: 'value1' },
        clientId: 'anon-123',
        userId: 'new-user-123',
      });
      setTimeoutSpy.mockRestore();
    });

    it('should identify business domain correctly', () => {
      const req = mockRequest();
      const user = {
        _id: 'new-user-123',
        email: 'user@company.com',
      } as any;

      service.trackNewUserEvent(req, user);

      const brazeCall = brazeService.trackNewUserEvent.mock.calls[0][0];
      expect(brazeCall.extraInfo.isBusinessDomain).toBe(true);
    });

    it('should identify non-business domain correctly', () => {
      const req = mockRequest();
      const user = {
        _id: 'new-user-123',
        email: 'user@gmail.com',
      } as any;

      service.trackNewUserEvent(req, user);

      const brazeCall = brazeService.trackNewUserEvent.mock.calls[0][0];
      expect(brazeCall.extraInfo.isBusinessDomain).toBe(false);
    });
  });

  describe('trackUserSignIn', () => {
    it('should track user sign-in event', () => {
      const req = mockRequest();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      service.trackUserSignIn(req);

      expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
      expect(pinpointService.add).toHaveBeenCalledTimes(2);
      expect(ga4Service.send).toHaveBeenCalledWith({
        eventName: 'user_sign_in_pinpoint',
        params: { param1: 'value1' },
        clientId: 'anon-123',
        userId: 'user-123',
      });
      setTimeoutSpy.mockRestore();
    });
  });

  describe('trackGrantedScopes', () => {
    it('should parse and track granted scopes', () => {
      const req = mockRequest();
      const grantedScopes = 'drive.file drive.install userinfo.email userinfo.profile openid';
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      service.trackGrantedScopes(req, grantedScopes);

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect((req as any).eventAttributes.commonAttributes.grantedScopes).toEqual([
        'drive.file',
        'drive.install',
        'userinfo.email',
        'userinfo.profile',
        'openid',
      ]);
      expect(pinpointService.add).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });

    it('should filter out unknown scopes', () => {
      const req = mockRequest();
      const grantedScopes = 'drive.file unknown.scope userinfo.email';

      service.trackGrantedScopes(req, grantedScopes);

      expect((req as any).eventAttributes.commonAttributes.grantedScopes).toEqual([
        'drive.file',
        'userinfo.email',
      ]);
    });

    it('should handle empty scopes string', () => {
      const req = mockRequest();

      service.trackGrantedScopes(req, '');

      expect((req as any).eventAttributes.commonAttributes.grantedScopes).toEqual([]);
    });
  });

  describe('trackError', () => {
    it('should log error with message and code', () => {
      const req = mockRequest();
      const error = {
        message: 'Access denied',
        code: 'ACCESS_DENIED',
        stack: 'Error stack trace',
      };
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      service.trackError(req, error);

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect((req as any).logDelayTime).toBe(1000);
      expect(pinpointService.add).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });

    it('should include error metadata when provided', () => {
      const req = mockRequest();
      const error = {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
      const errorMetadata = { field: 'email', reason: 'invalid format' };

      service.trackError(req, error, errorMetadata);

      expect(pinpointService.add).toHaveBeenCalled();
      const pinpointCall = pinpointService.add.mock.calls[0][0];
      expect(pinpointCall).toBeInstanceOf(OpenGoogleEvent);
    });
  });

  describe('trackUnhandledError', () => {
    it('should log unhandled error with default error code', () => {
      const req = mockRequest();
      const error = new Error('Unexpected error');
      error.stack = 'Error stack';
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      service.trackUnhandledError(req, error);

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(pinpointService.add).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });
  });

  describe('logGeoLocationError', () => {
    it('should log geo location error with third party error code', () => {
      const req = mockRequest();
      const error = new Error('Geo location service unavailable');
      error.stack = 'Geo error stack';
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      service.logGeoLocationError(req, error);

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(pinpointService.add).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });
  });

  describe('logDelayTime increment', () => {
    it('should increment logDelayTime for each tracking call', () => {
      const req = mockRequest({ logDelayTime: 0 });

      service.trackInitFlow(req);
      expect((req as any).logDelayTime).toBe(1000);

      service.trackPageView(req, 'https://app.luminpdf.com/viewer');
      expect((req as any).logDelayTime).toBe(2000);

      service.trackError(req, { message: 'Error', code: 'ERROR' });
      expect((req as any).logDelayTime).toBe(3000);
    });
  });

  describe('logToPinpoint with GA4 forwarding', () => {
    it('should forward to GA4 when forwardToGa4 is true', () => {
      const req = mockRequest();
      const user = { _id: 'user-123', email: 'user@test.com' } as any;

      service.trackNewUserEvent(req, user);

      expect(ga4Service.send).toHaveBeenCalled();
      expect(ga4Service.getCommonAttributesForOpenGoogleEvent).toHaveBeenCalled();
    });

    it('should not forward to GA4 when forwardToGa4 is false', () => {
      const req = mockRequest();

      service.trackInitFlow(req);

      expect(ga4Service.send).not.toHaveBeenCalled();
    });

    it('should use default event type when not provided', () => {
      const req = mockRequest();

      service.trackInitFlow(req);

      expect(pinpointService.add).toHaveBeenCalled();
      const addedEvent = pinpointService.add.mock.calls[0][0];
      expect(addedEvent).toBeInstanceOf(OpenGoogleEvent);
    });
  });
});
