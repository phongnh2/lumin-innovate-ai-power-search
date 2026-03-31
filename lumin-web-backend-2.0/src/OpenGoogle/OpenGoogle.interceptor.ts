import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { tap } from 'rxjs';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { DefaultErrorCode } from 'Common/constants/ErrorCode';

import { LUMIN_AUTHENTICATION_COOKIE_NAME } from 'constant';
import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';

import { IGoogleStateQuery } from './dtos/OpenGoogle.dto';
import { EventTrackingService } from './EventTracking.service';
import { TSignaturePayload } from './interfaces/OpenGoogle.interface';
import { OpenGoogleService } from './OpenGoogle.service';
import { FlowContext } from '../Common/interceptors/FlowId.interceptor';

@Injectable()
export class OpenGoogleInterceptor implements NestInterceptor {
  constructor(
    private readonly eventTrackingService: EventTrackingService,
    private readonly loggerService: LoggerService,
    private readonly openGoogleService: OpenGoogleService,
    private readonly reflector: Reflector,
    private readonly environmentService: EnvironmentService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const startAt = process.hrtime();
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const tokens = this.openGoogleService.getTokensCookie(req);
    const flowContext = this.reflector.get<FlowContext>(
      'flow_context',
      context.getHandler(),
    );
    const orySessionName = this.environmentService.getByKey(EnvConstants.ORY_SESSION_NAME);
    const tokenExistence = {
      googleAccessToken: Boolean(tokens.google.accessTokenData),
      luminAccessToken: Boolean(req.cookies[LUMIN_AUTHENTICATION_COOKIE_NAME]),
      orySessionCookie: Boolean(req.cookies[orySessionName]),
    };
    try {
      req.eventAttributes = {
        httpAttributes: this.loggerService.getCommonHttpAttributes(req),
        commonAttributes: {},
      };
      req.logDelayTime = 0;
      let state = JSON.parse(req.query.state as string);
      if ([FlowContext.Redirect, FlowContext.PostAuth].includes(flowContext)) {
        state = this.openGoogleService.decryptData<TSignaturePayload>(state.signature as string).state;
      }

      const { luminUserId, ...eventAttributes } = await this.eventTrackingService.getCommonEventAttributes(req, state as IGoogleStateQuery);
      req.eventAttributes.httpAttributes.userId = luminUserId;
      req.eventAttributes.commonAttributes = {
        ...eventAttributes,
        tokenExistence,
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
          interceptor: 'OpenGoogleInterceptor',
        },
      });
    }

    return next.handle().pipe(tap(() => {
      const executeTime = process.hrtime(startAt);
      const { userId } = req.eventAttributes.httpAttributes;
      const { flowId } = req.eventAttributes.commonAttributes;
      const { rss } = process.memoryUsage();

      const executeTimeInMs = executeTime[0] * 1000 + executeTime[1] / 1000000;
      if (executeTimeInMs > 3000) {
        this.loggerService.info({
          context: this.constructor.name,
          extraInfo: {
            executeTimeInMs,
            userId,
            flowId,
            flowContext,
            rss,
          },
        });
      }
    }));
  }
}
