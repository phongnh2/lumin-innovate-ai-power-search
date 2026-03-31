/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';

import { EnvironmentService } from '../../Environment/environment.service';
import { LoggerService } from '../../Logger/Logger.service';
import { EventTrackingService } from '../EventTracking.service';
import { OpenGoogleErrorCode } from '../interfaces/OpenGoogleError.interface';
import { OpenGoogleController } from '../OpenGoogle.controller';
import { OpenGoogleInterceptor } from '../OpenGoogle.interceptor';
import { OpenGoogleService } from '../OpenGoogle.service';

const mockRequest = (overrides: Record<string, unknown> = {}): Request => ({
  eventAttributes: {
    commonAttributes: { flowId: 'test-flow-id' },
    httpAttributes: {},
  },
  anonymousUserId: 'anonymous-123',
  cookies: {},
  headers: { host: 'test.luminpdf.com' },
  ...overrides,
} as unknown as Request);

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.getHeader = jest.fn().mockReturnValue('https://redirect-url.com');
  return res;
};

class OpenGoogleServiceMock {
  loadGoogleCookieNames = jest.fn().mockReturnValue({ googleAccessTokenCookie: 'google_access_token' });
  initGoogleFlowHandler = jest.fn();
  redirectOpenGoogleHandler = jest.fn();
  handlePostAuthentication = jest.fn();
  setCookie = jest.fn();
  getTechnicalIssueUrl = jest.fn().mockReturnValue('https://technical-issue.com');
  getWrongMimeTypeUrl = jest.fn().mockReturnValue('https://wrong-mimetype.com');
  decryptData = jest.fn().mockReturnValue({ state: { action: 'open', ids: ['file-id'] } });
  getTokensCookie = jest.fn().mockReturnValue({ google: { accessTokenData: null } });
}

class EventTrackingServiceMock {
  trackInitFlow = jest.fn();
  trackPageView = jest.fn();
  trackUnhandledError = jest.fn();
  trackError = jest.fn();
  getCommonEventAttributes = jest.fn().mockResolvedValue({});
}

class LoggerServiceMock {
  info = jest.fn();
  error = jest.fn();
  warn = jest.fn();
  getCommonHttpAttributes = jest.fn().mockReturnValue({});
}

class EnvironmentServiceMock {
  getByKey = jest.fn().mockReturnValue('test-value');
}

describe('OpenGoogleController', () => {
  let controller: OpenGoogleController;
  let openGoogleService: OpenGoogleServiceMock;
  let eventTrackingService: EventTrackingServiceMock;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [OpenGoogleController],
      providers: [
        { provide: OpenGoogleService, useClass: OpenGoogleServiceMock },
        { provide: EventTrackingService, useClass: EventTrackingServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
        { provide: EnvironmentService, useClass: EnvironmentServiceMock },
        { provide: Reflector, useValue: { get: jest.fn() } },
        OpenGoogleInterceptor,
      ],
    }).compile();

    controller = module.get<OpenGoogleController>(OpenGoogleController);
    openGoogleService = module.get(OpenGoogleService);
    eventTrackingService = module.get(EventTrackingService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initGoogleFlow', () => {
    const query = { state: { action: 'open', ids: ['file-123'] } };

    it('should redirect first-time user to Google OAuth consent screen', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      openGoogleService.initGoogleFlowHandler.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://oauth.google.com/auth',
        cookies: { token: { value: 'abc' } },
      });

      await controller.initGoogleFlow(req, res, query as any);

      expect(eventTrackingService.trackInitFlow).toHaveBeenCalledWith(req);
      expect(openGoogleService.initGoogleFlowHandler).toHaveBeenCalledWith({
        anonymousUserId: 'anonymous-123',
        query,
        accessTokenData: null,
        headers: req.headers,
        flowId: 'test-flow-id',
        request: req,
      });
      expect(openGoogleService.setCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.SEE_OTHER);
      expect(res.redirect).toHaveBeenCalledWith('https://oauth.google.com/auth');
      expect(eventTrackingService.trackPageView).toHaveBeenCalledWith(req, 'https://redirect-url.com');
    });

    it('should use existing Google session when user has valid access token', async () => {
      const accessTokenData = { accessToken: 'token-123', email: 'user@test.com' };
      const req = mockRequest({
        cookies: { google_access_token: JSON.stringify(accessTokenData) },
      }) as Request;
      const res = mockResponse() as Response;
      openGoogleService.initGoogleFlowHandler.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://app.luminpdf.com/viewer/docId',
        cookies: {},
      });

      await controller.initGoogleFlow(req, res, query as any);

      expect(openGoogleService.initGoogleFlowHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          accessTokenData,
        }),
      );
    });

    it('should show technical issue page when flow fails unexpectedly', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new Error('Something went wrong');
      openGoogleService.initGoogleFlowHandler.mockRejectedValue(error);

      await controller.initGoogleFlow(req, res, query as any);

      expect(eventTrackingService.trackUnhandledError).toHaveBeenCalledWith(req, error);
      expect(openGoogleService.getTechnicalIssueUrl).toHaveBeenCalledWith(
        'test.luminpdf.com',
        'anonymous-123',
        'test-flow-id',
        query.state,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.SEE_OTHER);
      expect(res.redirect).toHaveBeenCalledWith('https://technical-issue.com');
      expect(eventTrackingService.trackPageView).toHaveBeenCalled();
    });

    it('should track analytics for every redirect regardless of outcome', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      openGoogleService.initGoogleFlowHandler.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://next.com',
        cookies: {},
      });

      await controller.initGoogleFlow(req, res, query as any);

      expect(eventTrackingService.trackPageView).toHaveBeenCalledWith(req, 'https://redirect-url.com');
    });

    it('should handle requests from interceptor edge cases gracefully', async () => {
      const req = mockRequest({ eventAttributes: undefined }) as Request;
      const res = mockResponse() as Response;
      openGoogleService.initGoogleFlowHandler.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://next.com',
        cookies: {},
      });

      await controller.initGoogleFlow(req, res, query as any);

      expect(openGoogleService.initGoogleFlowHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          flowId: undefined,
        }),
      );
    });
  });

  describe('redirectOpenGoogle', () => {
    const query = {
      code: 'auth-code-123',
      state: { signature: 'encrypted-signature' },
    };

    it('should redirect user to document viewer after Google OAuth callback', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      openGoogleService.redirectOpenGoogleHandler.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://app.luminpdf.com/viewer/docId',
        cookies: { token: { value: 'new-token' } },
      });

      await controller.redirectOpenGoogle(req, res, query as any);

      expect(openGoogleService.redirectOpenGoogleHandler).toHaveBeenCalledWith({
        anonymousUserId: 'anonymous-123',
        query,
        accessTokenData: null,
        headers: req.headers,
        request: req,
      });
      expect(openGoogleService.setCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.SEE_OTHER);
      expect(res.redirect).toHaveBeenCalledWith('https://app.luminpdf.com/viewer/docId');
      expect(eventTrackingService.trackPageView).toHaveBeenCalledWith(req, 'https://redirect-url.com');
    });

    it('should preserve existing Google session during OAuth redirect', async () => {
      const accessTokenData = { accessToken: 'token-456', scope: 'drive.file' };
      const req = mockRequest({
        cookies: { google_access_token: JSON.stringify(accessTokenData) },
      }) as Request;
      const res = mockResponse() as Response;
      openGoogleService.redirectOpenGoogleHandler.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://viewer.com',
        cookies: {},
      });

      await controller.redirectOpenGoogle(req, res, query as any);

      expect(openGoogleService.redirectOpenGoogleHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          accessTokenData,
        }),
      );
    });

    it('should show technical issue page when token exchange fails', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new Error('Token exchange failed');
      openGoogleService.redirectOpenGoogleHandler.mockRejectedValue(error);

      await controller.redirectOpenGoogle(req, res, query as any);

      expect(eventTrackingService.trackUnhandledError).toHaveBeenCalledWith(req, error);
      expect(openGoogleService.decryptData).toHaveBeenCalledWith('encrypted-signature');
      expect(openGoogleService.getTechnicalIssueUrl).toHaveBeenCalledWith(
        'test.luminpdf.com',
        'anonymous-123',
        'test-flow-id',
        { action: 'open', ids: ['file-id'] },
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.SEE_OTHER);
      expect(res.redirect).toHaveBeenCalledWith('https://technical-issue.com');
    });

    it('should track analytics for OAuth redirect regardless of outcome', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      openGoogleService.redirectOpenGoogleHandler.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://next.com',
        cookies: {},
      });

      await controller.redirectOpenGoogle(req, res, query as any);

      expect(eventTrackingService.trackPageView).toHaveBeenCalledWith(req, 'https://redirect-url.com');
    });

    it('should handle requests from interceptor edge cases gracefully', async () => {
      const req = mockRequest({ eventAttributes: undefined }) as Request;
      const res = mockResponse() as Response;
      openGoogleService.redirectOpenGoogleHandler.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://next.com',
        cookies: {},
      });

      await controller.redirectOpenGoogle(req, res, query as any);

      expect(openGoogleService.redirectOpenGoogleHandler).toHaveBeenCalled();
    });
  });

  describe('postAuth', () => {
    const query = {
      state: { signature: 'post-auth-signature' },
    };

    it('should redirect authenticated user to document viewer', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      openGoogleService.handlePostAuthentication.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://app.luminpdf.com/viewer/123',
        cookies: { session: { value: 'session-token' } },
      });

      await controller.postAuth(req, res, query as any);

      expect(openGoogleService.handlePostAuthentication).toHaveBeenCalledWith({
        accessTokenData: null,
        anonymousUserId: 'anonymous-123',
        state: query.state,
        headers: req.headers,
        request: req,
      });
      expect(openGoogleService.setCookie).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(HttpStatus.SEE_OTHER, 'https://app.luminpdf.com/viewer/123');
      expect(eventTrackingService.trackPageView).toHaveBeenCalled();
    });

    it('should use existing Google session for document access', async () => {
      const accessTokenData = { accessToken: 'post-token', expireAt: Date.now() + 3600000 };
      const req = mockRequest({
        cookies: { google_access_token: JSON.stringify(accessTokenData) },
      }) as Request;
      const res = mockResponse() as Response;
      openGoogleService.handlePostAuthentication.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://viewer.com/doc',
        cookies: {},
      });

      await controller.postAuth(req, res, query as any);

      expect(openGoogleService.handlePostAuthentication).toHaveBeenCalledWith(
        expect.objectContaining({
          accessTokenData,
        }),
      );
    });

    it('should show unsupported file type page for non-PDF files like video', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const invalidMimeTypeError = {
        code: OpenGoogleErrorCode.INVALID_MIMETYPE,
        message: 'Unsupported file type',
        metadata: { mimetype: 'video/mp4', nextUrl: '/documents' },
      };
      openGoogleService.handlePostAuthentication.mockRejectedValue(invalidMimeTypeError);

      await controller.postAuth(req, res, query as any);

      expect(eventTrackingService.trackError).toHaveBeenCalledWith(
        req,
        { message: 'Unsupported file type', code: OpenGoogleErrorCode.INVALID_MIMETYPE },
        { mimetype: 'video/mp4', nextUrl: '/documents' },
      );
      expect(openGoogleService.getWrongMimeTypeUrl).toHaveBeenCalledWith(
        'test.luminpdf.com',
        { mimetype: 'video/mp4', nextUrl: '/documents' },
      );
      expect(res.redirect).toHaveBeenCalledWith(HttpStatus.SEE_OTHER, 'https://wrong-mimetype.com');
      expect(eventTrackingService.trackPageView).toHaveBeenCalled();
    });

    it('should show technical issue page when authentication fails', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new Error('Database connection failed');
      openGoogleService.handlePostAuthentication.mockRejectedValue(error);

      await controller.postAuth(req, res, query as any);

      expect(eventTrackingService.trackUnhandledError).toHaveBeenCalledWith(req, error);
      expect(openGoogleService.decryptData).toHaveBeenCalledWith('post-auth-signature');
      expect(openGoogleService.getTechnicalIssueUrl).toHaveBeenCalledWith(
        'test.luminpdf.com',
        'anonymous-123',
        'test-flow-id',
        { action: 'open', ids: ['file-id'] },
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.SEE_OTHER);
      expect(res.redirect).toHaveBeenCalledWith('https://technical-issue.com');
    });

    it('should track analytics after successful document access', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      openGoogleService.handlePostAuthentication.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://viewer.com',
        cookies: {},
      });

      await controller.postAuth(req, res, query as any);

      expect(eventTrackingService.trackPageView).toHaveBeenCalledWith(req, 'https://redirect-url.com');
    });

    it('should track analytics even when file type is unsupported', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const invalidMimeTypeError = {
        code: OpenGoogleErrorCode.INVALID_MIMETYPE,
        message: 'Bad type',
        metadata: { mimetype: 'audio/mp3', nextUrl: '/home' },
      };
      openGoogleService.handlePostAuthentication.mockRejectedValue(invalidMimeTypeError);

      await controller.postAuth(req, res, query as any);

      expect(eventTrackingService.trackPageView).toHaveBeenCalledWith(req, 'https://redirect-url.com');
    });

    it('should track analytics even when authentication fails', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      openGoogleService.handlePostAuthentication.mockRejectedValue(new Error('Unexpected'));

      await controller.postAuth(req, res, query as any);

      expect(eventTrackingService.trackPageView).toHaveBeenCalledWith(req, 'https://redirect-url.com');
    });

    it('should handle requests from interceptor edge cases gracefully', async () => {
      const req = mockRequest({ eventAttributes: undefined }) as Request;
      const res = mockResponse() as Response;
      openGoogleService.handlePostAuthentication.mockResolvedValue({
        statusCode: HttpStatus.SEE_OTHER,
        nextUrl: 'https://next.com',
        cookies: {},
      });

      await controller.postAuth(req, res, query as any);

      expect(openGoogleService.handlePostAuthentication).toHaveBeenCalled();
    });
  });
});
