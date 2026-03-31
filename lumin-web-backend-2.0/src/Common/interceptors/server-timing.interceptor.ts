import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { serverTiming } from 'Common/timing/servertiming';
import { Utils } from 'Common/utils/Utils';

import { ContextType } from 'constant';

@Injectable()
export class ServerTimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = process.hrtime();
    return next.handle().pipe(map((data) => {
      if (context.getType() === ContextType.HTTP) {
        /**
         * FIXME: Server timing is not working for /open/google or /open/onedrive api.
         * Need to fix it with Redirect decorator
         * Error: "Cannot set headers after they are sent to the client"
         */
        const httpReq: Request = context.switchToHttp().getRequest();
        if (
          httpReq.url.startsWith('/open/google')
          || httpReq.url.startsWith('/open/onedrive')
          || httpReq.headers.accept === CommonConstants.SSE_ACCEPT_HEADER
        ) {
          return data;
        }
      }
      const request = Utils.getGqlRequest(context);
      if (request && request.res) {
        serverTiming.setTiming(request.res, process.hrtime(startTime), 'process');
      }
      return data;
    }));
  }
}
