import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, ContextType as NestContextType,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidV4 } from 'uuid';

import { CommonConstants } from 'Common/constants/CommonConstants';

import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { EnvironmentService } from 'Environment/environment.service';

type ContextType = NestContextType | 'graphql';
type Context = {
  req: Request | IGqlRequest;
  res: Response
}

@Injectable()
export class AnonymousUserInterceptor implements NestInterceptor {
  constructor(private readonly environmentService: EnvironmentService) {}

  private getContext(context: ExecutionContext) {
    const contextType = context.getType<ContextType>();
    switch (contextType) {
      case 'graphql': {
        const ctx = GqlExecutionContext.create(context);
        if (ctx.getInfo().operation.operation === 'subscription') {
          return null;
        }
        return ctx.getContext<Context>();
      }
      case 'http': {
        const ctx = context.switchToHttp();
        return {
          req: ctx.getRequest<Request>(),
          res: ctx.getResponse<Response>(),
        };
      }
      default:
        return null;
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = this.getContext(context);
    if (ctx && ctx.req) {
      const isSSE = ctx.req.headers.accept === CommonConstants.SSE_ACCEPT_HEADER;
      if (isSSE) {
        return next.handle();
      }

      ctx.req.anonymousUserId = (ctx.req.cookies || {})[CommonConstants.ANONYMOUS_USER_ID_COOKIE];
      if (!ctx.req.anonymousUserId) {
        const id = uuidV4();
        ctx.req.anonymousUserId = id;
        ctx.res.cookie(CommonConstants.ANONYMOUS_USER_ID_COOKIE, id, {
          maxAge: moment.duration(1, 'year').asMilliseconds(),
          path: '/',
          ...(!this.environmentService.isDevelopment && {
            domain: '.luminpdf.com',
          }),
        });
      }
    }
    return next.handle().pipe(map((data) => data));
  }
}
