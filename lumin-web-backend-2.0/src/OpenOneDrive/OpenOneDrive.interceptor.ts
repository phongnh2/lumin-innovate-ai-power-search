import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Request } from 'express';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { DefaultErrorCode } from 'Common/constants/ErrorCode';

import { LUMIN_AUTHENTICATION_COOKIE_NAME } from 'constant';
import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';

import { EventTrackingService } from './EventTracking/EventTracking.service';

@Injectable()
export class OpenOneDriveInterceptor implements NestInterceptor {
  constructor(
    private readonly eventTrackingService: EventTrackingService,
    private readonly loggerService: LoggerService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const orySessionName = this.environmentService.getByKey(EnvConstants.ORY_SESSION_NAME);
    const tokenExistence = {
      luminAccessToken: Boolean(req.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME]),
      orySessionCookie: Boolean(req.cookies[orySessionName]),
    };
    try {
      req.eventAttributes = {
        httpAttributes: this.loggerService.getCommonHttpAttributes(req),
        commonAttributes: {},
      };
      req.logDelayTime = 0;

      const { luminUserId, ...eventAttributes } = await this.eventTrackingService.getCommonEventAttributes(req);
      req.eventAttributes.httpAttributes.userId = luminUserId;
      req.eventAttributes.commonAttributes = {
        ...eventAttributes,
        tokenExistence,
      };
    } catch (error) {
      this.loggerService.error({
        ...req.eventAttributes.httpAttributes,
        error,
        stack: error.stack,
        errorCode: DefaultErrorCode.UNPROCESSABLE_ERROR,
        extraInfo: {
          ...req.eventAttributes.commonAttributes,
          url: req.url,
          message: error.message,
          tokenExistence,
          typeOfError: typeof error,
          instanceOfError: error instanceof Error,
          interceptor: 'OpenOneDriveInterceptor',
        },
      });
    }

    return next.handle();
  }
}
