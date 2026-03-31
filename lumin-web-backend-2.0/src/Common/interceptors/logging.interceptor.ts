import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, forwardRef,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Utils } from 'Common/utils/Utils';

import { LoggerService } from 'Logger/Logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(forwardRef(() => LoggerService))
    private readonly loggerService: LoggerService,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = Utils.getGqlRequest(context);
    return next
      .handle()
      .pipe(
        map((data) => {
          const exceptionInfo = {
            ...this.loggerService.getCommonAttributes(request),
            ...this.loggerService.getCommonVariables(request),
            context: request.body.operationName,
          };
          this.loggerService.info(exceptionInfo);
          return data;
        }),
      );
  }
}
