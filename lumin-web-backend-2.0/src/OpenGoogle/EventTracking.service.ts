import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { Utils } from 'Common/utils/Utils';

import { AuthService } from 'Auth/auth.service';
import { BrazeService } from 'Braze/braze.service';
import { LUMIN_AUTHENTICATION_COOKIE_NAME } from 'constant';
import { GA4Service } from 'GA4/GA4.service';
import { LogMessage, LoggerService } from 'Logger/Logger.service';
import { OpenGoogleEvent, OpenGoogleEventType } from 'OpenGoogle/open-google-event';
import { PinpointService } from 'Pinpoint/pinpoint.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { IGoogleStateQuery } from './dtos/OpenGoogle.dto';
import { OpenGoogleService } from './OpenGoogle.service';

enum EventName {
  PageView = 'page_view',
  UserSignUp = 'user_sign_up',
  GrantPermissions = 'grant_permissions',
  InitOpenGoogleFlow = 'init_open_google_flow',
  DeleteOldCookies = 'delete_old_cookies',
  VariantView = 'variant_view',
  UserSignIn = 'user_sign_in',
}

const DELAY_TIME = 1000;
@Injectable()
export class EventTrackingService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly openGoogleService: OpenGoogleService,
    private readonly authService: AuthService,
    private readonly pinpointService: PinpointService,
    private readonly userService: UserService,
    private readonly ga4Service: GA4Service,
    private readonly brazeService: BrazeService,
  ) {}

  async getCommonEventAttributes(request: Request, state: IGoogleStateQuery): Promise<Record<string, unknown>> {
    try {
      const { backend: backendOrigin } = this.openGoogleService.getLuminOrigins(request.headers.host);
      const url = new URL(request.originalUrl, backendOrigin);
      const attributes: Record<string, unknown> = {
        currentURL: url.toString(),
        referrer: request.headers.referer,
        acceptLanguage: this.openGoogleService.getBrowserPreferedLanguage(request),
        googleUserIdFromURL: state.userId,
      };
      const { google } = this.openGoogleService.getTokensCookie(request);
      if (!request.user) {
        const session = await this.authService.verifyOryAuthenticationToken(request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] as string)
          .catch(() => null);
        if (session) {
          const user = await this.userService.findUserByEmail(session.identity.traits.email as string);
          if (user) {
            attributes.luminUserId = user._id;
          }
        }
      } else {
        attributes.luminUserId = request.user._id;
      }
      if (google.accessTokenData) {
        const {
          scope, expireAt, userRemoteId,
        } = JSON.parse(google.accessTokenData);
        attributes.googleAccessTokenInfo = {
          scopes: this.parseGrantedScopes(scope as string),
          expireAt,
          isExpired: expireAt < Date.now(),
          userRemoteId,
        };
      }
      return attributes;
    } catch (error) {
      this.loggerService.error({
        ...request.eventAttributes.httpAttributes,
        error: error.message,
        errorCode: 'error_getting_event_attributes',
        stack: error.stack,
        extraInfo: request.eventAttributes.commonAttributes,
      });
      return {};
    }
  }

  trackInitFlow(request: Request): void {
    const payload = {
      ...request.eventAttributes.httpAttributes,
      extraInfo: {
        name: EventName.InitOpenGoogleFlow,
        ...request.eventAttributes.commonAttributes,
      },
    };
    this.logInfoWithDelay({ payload }, request);
  }

  // Event tracking
  trackPageView(request: Request, redirectUrl: string): void {
    const payload = {
      ...request.eventAttributes.httpAttributes,
      extraInfo: {
        name: EventName.PageView,
        ...request.eventAttributes.commonAttributes,
        redirectUrl,
      },
    };
    this.logInfoWithDelay({ payload }, request);
  }

  trackNewUserEvent(request: Request, user: User): void {
    const userId = user._id;
    const payload = {
      ...request.eventAttributes.httpAttributes,
      userId,
      luminUserId: userId,
      extraInfo: {
        name: EventName.UserSignUp,
        method: 'Google',
        isBusinessDomain: Utils.isBusinessDomain(user.email),
        ...request.eventAttributes.commonAttributes,
      },
    };
    // Current analysis use this event so we will keep it
    this.logInfoWithDelay({ payload }, request);
    this.logInfoWithDelay({ payload, eventType: OpenGoogleEventType.USER_SIGN_UP, forwardToGa4: true }, request);
    this.brazeService.trackNewUserEvent(payload);
  }

  trackUserSignIn(request: Request): void {
    const payload = {
      ...request.eventAttributes.httpAttributes,
      extraInfo: {
        name: EventName.UserSignIn,
        method: 'Google',
        ...request.eventAttributes.commonAttributes,
      },
    };
    this.logInfoWithDelay({ payload }, request);
    this.logInfoWithDelay({ payload, eventType: OpenGoogleEventType.USER_SIGN_IN, forwardToGa4: true }, request);
  }

  trackGrantedScopes(request: Request, grantedScopes: string): void {
    const scopes = this.parseGrantedScopes(grantedScopes);
    const payload = {
      ...request.eventAttributes.httpAttributes,
      extraInfo: {
        name: EventName.GrantPermissions,
        ...request.eventAttributes.commonAttributes,
        grantedPermissions: scopes,
      },
    };
    this.logInfoWithDelay({ payload }, request);
    request.eventAttributes.commonAttributes.grantedScopes = scopes;
  }

  // Error tracking
  trackError(request: Request, error: { message: string, code: string, stack?: any }, errorMetadata?: Record<string, unknown>): void {
    const payload = {
      ...request.eventAttributes.httpAttributes,
      error: error.message,
      errorCode: error.code,
      stack: error.stack,
      extraInfo: {
        ...request.eventAttributes.commonAttributes,
        errorMetadata,
      },
    };
    this.logErrorWithDelay(payload, request);
  }

  trackUnhandledError(request: Request, error: Error): void {
    const payload = {
      ...request.eventAttributes.httpAttributes,
      error: error.message,
      errorCode: 'unhandled_exception',
      stack: error.stack,
      extraInfo: request.eventAttributes.commonAttributes,
    };
    this.logErrorWithDelay(payload, request);
  }

  logGeoLocationError(request: Request, error: Error): void {
    const payload = {
      ...request.eventAttributes.httpAttributes,
      errorCode: ErrorCode.Common.THIRD_PARTY_ERROR,
      error: error.message,
      stack: error.stack,
      extraInfo: request.eventAttributes.commonAttributes,
    };
    this.logErrorWithDelay(payload, request);
  }

  private logToPinpoint(params: { level: 'info' | 'error', payload: LogMessage, eventType?: string, forwardToGa4?: boolean }): void {
    const {
      payload, eventType, forwardToGa4,
    } = params;
    const eventAttributes = this.pinpointService.constructPayloadFromLogMessage(params);
    const e = new OpenGoogleEvent(eventAttributes, eventType);
    this.pinpointService.add(e);
    if (forwardToGa4) {
      const eventName = Utils.camelToSnakeCase(eventType || OpenGoogleEventType.DEFAULT).concat('_pinpoint');
      const ga4Params = this.ga4Service.getCommonAttributesForOpenGoogleEvent(payload);
      this.ga4Service.send({
        eventName,
        params: ga4Params,
        clientId: payload.anonymousUserId,
        userId: payload.userId,
      });
    }
  }

  private logInfoWithDelay(params: { payload: Record<string, unknown>, eventType?: string, forwardToGa4?: boolean }, request: Request): void {
    const { payload, eventType, forwardToGa4 } = params;
    setTimeout(() => this.loggerService.info(payload), request.logDelayTime);
    request.logDelayTime += DELAY_TIME;
    this.logToPinpoint({
      level: 'info', payload, eventType, forwardToGa4,
    });
  }

  private logErrorWithDelay(payload: Record<string, unknown>, request: Request): void {
    setTimeout(() => this.loggerService.error(payload), request.logDelayTime);
    request.logDelayTime += DELAY_TIME;
    this.logToPinpoint({ level: 'error', payload });
  }

  private parseGrantedScopes(grantedScopes: string): string[] {
    const scopes = ['drive.file', 'drive.install', 'userinfo.email', 'userinfo.profile', 'openid'];
    return scopes.filter((scope) => grantedScopes.includes(scope));
  }
}
