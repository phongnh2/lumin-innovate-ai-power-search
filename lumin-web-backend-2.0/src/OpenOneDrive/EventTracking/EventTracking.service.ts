import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AuthenticationStatus, OneDrivePermission } from 'Common/constants/OpenFlowFileConstants';
import { Utils } from 'Common/utils/Utils';

import { AuthService } from 'Auth/auth.service';
import { LUMIN_AUTHENTICATION_COOKIE_NAME } from 'constant';
import { GA4Service } from 'GA4/GA4.service';
import { LoggerService, LogMessage } from 'Logger/Logger.service';
import { OpenOneDriveService } from 'OpenOneDrive/OpenOneDrive.service';
import { PinpointService } from 'Pinpoint/pinpoint.service';
import { UserService } from 'User/user.service';

import { OneDriveEvent, OpenOneDriveEventType } from './OneDriveEvent';

const DELAY_TIME = 1000;
@Injectable()
export class EventTrackingService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly pinpointService: PinpointService,
    private readonly ga4Service: GA4Service,
    private readonly openOneDriveService: OpenOneDriveService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async getCommonEventAttributes(request: Request): Promise<Record<string, unknown>> {
    try {
      const { backend: backendOrigin } = this.openOneDriveService.getLuminOrigins(request.headers.host);
      const url = new URL(request.originalUrl, backendOrigin);
      const attributes: Record<string, unknown> = {
        currentURL: url.toString(),
        referrer: request.headers.referer,
        acceptLanguage: this.openOneDriveService.getBrowserPreferedLanguage(request),
      };
      if (!request.user) {
        const session = await this.authService
          .verifyOryAuthenticationToken(
            request.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME] as string,
          )
          .catch(() => null);
        if (session) {
          const user = await this.userService.findUserByEmail(session.identity.traits.email as string);
          if (user) {
            attributes.luminUserId = user._id;
            attributes.isBusinessDomain = Utils.isBusinessDomain(user.email);
          }
        }
      } else {
        attributes.luminUserId = request.user._id;
        attributes.isBusinessDomain = Utils.isBusinessDomain(request.user.email as string);
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

  constructPayload(request: Request, eventBody: Record<string, unknown>): Record<string, unknown> {
    return {
      ...request.eventAttributes.httpAttributes,
      extraInfo: {
        ...eventBody,
        ...request.eventAttributes.commonAttributes,
      },
    };
  }

  trackInitFlow(request: Request): void {
    const payload = this.constructPayload(request, {
      name: 'init_open_one_drive_flow',
    });
    this.recordEvent({ payload }, request);
  }

  trackPageView(request: Request, redirectUrl: string): void {
    const payload = this.constructPayload(request, {
      name: 'page_view',
      redirectUrl,
    });
    this.recordEvent({ payload }, request);
  }

  trackGrantedScopes(request: Request): void {
    const scopes = [
      OneDrivePermission.Email,
      OneDrivePermission.FilesReadWriteAll,
      OneDrivePermission.Profile,
    ];
    const payload = this.constructPayload(request, {
      name: 'grant_permissions',
      grantedPermissions: scopes,
    });
    this.recordEvent({ payload }, request);
    request.eventAttributes.commonAttributes.grantedScopes = scopes;
  }

  trackError(
    request: Request,
    error: { message?: string, code: string, stack?: any, claims?: string },
    errorMetadata?: Record<string, unknown>,
  ): void {
    const payload = {
      error: error.message,
      errorCode: error.code,
      stack: error.stack,
      claims: error.claims,
      ...this.constructPayload(request, { errorMetadata }),
    };
    this.recordEvent({ payload }, request, 'error');
  }

  private recordEvent(
    params: {
      payload: Record<string, unknown>;
      eventType?: string;
      forwardToGa4?: boolean;
    },
    request: Request,
    level: 'info' | 'error' = 'info',
  ): void {
    const { payload, eventType, forwardToGa4 } = params;
    const logger = level === 'info'
      ? () => this.loggerService.info(payload)
      : () => this.loggerService.error(payload);
    setTimeout(() => logger(), request.logDelayTime);
    request.logDelayTime += DELAY_TIME;
    this.logToPinpoint({
      level,
      payload,
      eventType,
      forwardToGa4,
    });
  }

  private logToPinpoint(params: {
    level: 'info' | 'error';
    payload: LogMessage;
    eventType?: string;
    forwardToGa4?: boolean;
  }): void {
    const {
      payload, eventType, forwardToGa4,
    } = params;
    const eventAttributes = this.pinpointService.constructPayloadFromLogMessage(params);
    const e = new OneDriveEvent(eventAttributes, eventType);
    this.pinpointService.add(e);
    if (forwardToGa4) {
      const eventName = Utils.camelToSnakeCase(
        eventType || OpenOneDriveEventType.DEFAULT,
      ).concat('_pinpoint');
      const ga4Params = this.ga4Service.getCommonAttributesForOpenOneDriveEvent(payload);
      this.ga4Service.send({
        eventName,
        params: ga4Params,
        clientId: payload.anonymousUserId,
        userId: payload.userId,
      });
    }
  }

  public trackAuthenticationEvent(authStatus: Omit<AuthenticationStatus, 'authenticated'>, request: Request) {
    const signInEvent = authStatus === AuthenticationStatus.SIGN_IN;
    const payload = this.constructPayload(request, {
      name: signInEvent ? 'user_sign_in' : 'user_sign_up',
      method: 'Microsoft',
    });
    this.recordEvent(
      {
        payload,
        eventType: signInEvent
          ? OpenOneDriveEventType.USER_SIGN_IN
          : OpenOneDriveEventType.USER_SIGN_UP,
        forwardToGa4: true,
      },
      request,
    );
  }
}
