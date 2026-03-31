import { isString } from 'lodash';

import { WsErrorException } from 'Common/errors/WsException';

import { LoggerService } from 'Logger/Logger.service';

export function HandleSocketErrors(loggerService?: LoggerService) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        const logger = loggerService || this.loggerService;

        if (logger) {
          logger.error({
            error,
            stack: error.stack,
            context: `${target.constructor.name}.${propertyName}`,
            method: propertyName,
          });
        }

        if (error instanceof WsErrorException || error.name === 'WsException') {
          throw error;
        }

        if (error.message === 'Invalid user') {
          throw WsErrorException.Unauthorized('Invalid user');
        }

        if (error.message === 'Document not found') {
          throw WsErrorException.NotFound('Document not found');
        }

        const errorMessage = isString(error.message) ? error.message as string : 'An unexpected error occurred';
        throw WsErrorException.InternalServerError(errorMessage);
      }
    };
  };
}
