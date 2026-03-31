import {
  ExceptionFilter, Catch, ArgumentsHost, HttpStatus,
} from '@nestjs/common';
import { isPlainObject } from 'lodash';

import { CustomHttpException } from 'Common/errors/http/CustomHttpException';
import { AllExceptionFilter } from 'Common/exceptions/all.exception.filter';

import { LoggerService } from 'Logger/Logger.service';

@Catch(CustomHttpException)
export class HttpExceptionFilter extends AllExceptionFilter implements ExceptionFilter {
  constructor(loggerService: LoggerService) {
    super(loggerService);
  }

  catch(exception: CustomHttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionMetadata = exception.error_metadata;
    const exceptionDetails = isPlainObject(exceptionMetadata) ? exceptionMetadata : {};

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      super.catch(exception, host, 'http');
    } else {
      const exceptionInfo = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ...this.loggerService.getCommonHttpAttributes(request),
        stack: exception.message,
        status: exception.getStatus(),
        code: exception.error_code,
      };
      this.loggerService.info(exceptionInfo);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      response
        .status(status)
        .json({
          statusCode: status,
          code: exception.error_code,
          timestamp: new Date().toISOString(),
          path: request.originalUrl || request.url,
          message: exception.message,
          ...exceptionDetails,
        });
    }
  }
}
