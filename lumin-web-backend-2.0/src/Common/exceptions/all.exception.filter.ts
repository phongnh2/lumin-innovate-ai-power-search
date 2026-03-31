import {
  Catch, ArgumentsHost, ExceptionFilter,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import * as chalk from 'chalk';

import { GraphqlException } from 'Common/errors/graphql/GraphException';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { CustomHttpException } from 'Common/errors/http/CustomHttpException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { LogMessage, LoggerService } from 'Logger/Logger.service';

@Catch()
export class AllExceptionFilter implements ExceptionFilter, GqlExceptionFilter {
  constructor(
    public readonly loggerService: LoggerService,
  ) { }

  catch(exception: CustomHttpException | GraphqlException, host: ArgumentsHost, type?: string): void {
    const requestType = this.getRequestType(host, type);
    let errorObj: LogMessage = {
      stack: (exception as any)?.stack,
    };
    if (requestType === 'graphql') {
      const ctx = GqlArgumentsHost.create(host);
      const request = ctx.getContext().req as IGqlRequest;
      const gqlException = exception as GraphqlException;
      let metaData = {};
      if (typeof gqlException.getMetadata === 'function') {
        metaData = gqlException?.getMetadata();
      }
      const args = host.getArgs();
      errorObj = {
        ...errorObj,
        ...this.loggerService.getCommonAttributes(request),
        ...(metaData && { extraInfo: metaData }),
        context: args[args.length - 1]?.fieldName,
      };
    } else {
      const ctx = host.switchToHttp();
      const request = ctx.getRequest();
      const response = ctx.getResponse();
      errorObj = {
        ...errorObj,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ...this.loggerService.getCommonHttpAttributes(request),
      };
      const unprocessable = HttpErrorException.UnprocessableError('Unprocessable Entity');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      response
        .status(unprocessable.getStatus())
        .json({
          statusCode: unprocessable.getStatus(),
          code: unprocessable.error_code,
          timestamp: new Date().toISOString(),
          path: request.originalUrl || request.url,
          message: unprocessable.message,
        });
    }

    /**
     * only use for development so we don't need to import environmentService
     */
    if (process.env.NODE_ENV === 'development') {
      console.error(chalk.red.bold('\n❌ Exception Caught:\n'));
      console.error(chalk.cyan('Stack:'), chalk.gray(errorObj.stack || 'N/A'));
      console.error(chalk.cyan('Details:'), chalk.yellow(JSON.stringify(errorObj, null, 2)));
    } else {
      this.loggerService.error(errorObj);
    }
    if (requestType === 'graphql') throw GraphErrorException.UnprocessableError('Unprocessable Entity');
  }

  getRequestType(host: ArgumentsHost, type?: string): string {
    return type || (host.getArgs().length === 4 ? 'graphql' : 'http');
  }
}
