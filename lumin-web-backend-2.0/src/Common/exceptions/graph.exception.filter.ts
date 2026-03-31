import {
  Catch, HttpStatus, ArgumentsHost,
} from '@nestjs/common';
import {
  GqlExceptionFilter, GqlArgumentsHost,
} from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { GraphqlException } from 'Common/errors/graphql/GraphException';
import { AllExceptionFilter } from 'Common/exceptions/all.exception.filter';

import { LoggerService } from 'Logger/Logger.service';

@Catch(GraphqlException)
export class GraphExceptionFilter extends AllExceptionFilter implements GqlExceptionFilter {
  constructor(loggerService: LoggerService) {
    super(loggerService);
  }

  catch(exception: GraphqlException, host: ArgumentsHost): GraphqlException {
    const metadata = exception.getMetadata() || {};
    if (exception.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR && !(metadata.originError instanceof GraphQLError)) {
      super.catch(exception, host);
      return null;
    }
    if (metadata.originError instanceof GraphQLError) {
      return this.catch(metadata.originError as GraphqlException, host);
    }
    const ctx = GqlArgumentsHost.create(host);
    const request = ctx.getContext().req;
    const args = host.getArgs();
    const exceptionInfo = {
      context: args[args.length - 1]?.fieldName,
      stack: exception.stack,
      status: exception.getStatus(),
      errorCode: exception.extensions.code,
      metadata: exception.getMetadata(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...this.loggerService.getCommonAttributes(request),
    };
    this.loggerService.info(exceptionInfo as unknown);
    return exception;
  }
}
