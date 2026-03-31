import axios, { AxiosError } from 'axios';

import { LoggerScope } from '@/constants/common';
import { ErrorCode, GetOryErrorCode } from '@/constants/errorCode';
import { isRawOryError } from '@/features/errors';
import { SelfServiceFlow } from '@/interfaces/ory';
import { ValidationError } from '@/lib/ory/validation-error';

import { clientLogger } from '../logger';
import { logger } from '../logger/logger';

import { HttpErrorException } from './HttpErrorException';
import { IException } from './interfaces/exception';

const isServer = typeof window === 'undefined';

// eslint-disable-next-line sonarjs/cognitive-complexity
function transform(error: unknown | Error | AxiosError): IException {
  try {
    if (!axios.isAxiosError(error)) {
      return {
        message: JSON.stringify(error)
      };
    }
    if (error.response) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: errorFlow, status, headers } = error.response as { data: any; status: number; headers: Record<string, string> };
      switch (status) {
        case 400:
          let errors;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (isRawOryError((errorFlow as any)?.error)) {
            errors = ValidationError.fromRawError(errorFlow as { error: Record<string, unknown>; redirect_browser_to: string }).messages();
          } else {
            errors = ValidationError.fromSelfServiceFlow(errorFlow as unknown as SelfServiceFlow).messages();
          }
          return {
            message: errors[0].message,
            code: GetOryErrorCode(errors[0].id as number)
          };
        case 401:
          return {
            message: 'unauthorized',
            code: 401
          };
        case 403: {
          const validationErrors = ValidationError.fromRawError(errorFlow as { error: Record<string, unknown>; redirect_browser_to: string }).messages();
          const [unprocessError] = validationErrors;
          const errorMeta = {
            errorId: unprocessError?.id,
            errorStructure: errorFlow.error ? Object.keys(errorFlow.error) : [],
            redirectBrowserTo: errorFlow.redirect_browser_to,
            errorReason: errorFlow.error?.reason
          };

          if (isServer) {
            logger.error({
              err: error,
              message: 'Request failed with 403',
              meta: errorMeta,
              scope: LoggerScope.ERROR.ORY_EXCEPTION
            });
          } else {
            clientLogger.error({
              reason: LoggerScope.ERROR.ORY_EXCEPTION,
              message: 'Request failed with 403',
              attributes: errorMeta
            });
          }

          return {
            meta: {
              errorCode: unprocessError.id
            },
            message: errorFlow.error?.reason,
            code: 403
          };
        }
        case 422:
          const [unprocessError] = ValidationError.fromRawError(errorFlow as { error: Record<string, unknown>; redirect_browser_to: string }).messages();
          if (unprocessError.id === ErrorCode.Auth.BROWSER_LOCATION_CHANGE_REQUIRED) {
            return {
              message: ErrorCode.Auth.BROWSER_LOCATION_CHANGE_REQUIRED,
              meta: {
                redirect_browser_to: unprocessError.ext?.redirect_browser_to,
                set_cookie: headers['set-cookie']
              },
              code: ErrorCode.Auth.BROWSER_LOCATION_CHANGE_REQUIRED
            };
          }
        case 429:
          return {
            message: 'too many requests',
            code: 429
          };
        default:
          return {
            message: errorFlow.error?.reason || 'Something went wrong',
            code: status
          };
      }
    }
    return { message: JSON.stringify(error) };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (isServer) {
      logger.error({ err: error as Error, message: err?.message, scope: LoggerScope.ERROR.ORY_EXCEPTION });
    } else {
      clientLogger.error({ attributes: { error: err }, message: err?.message, reason: LoggerScope.ERROR.ORY_EXCEPTION });
    }
    throw err;
  }
}

export function oryExceptionHandler(error: unknown | Error | AxiosError) {
  const { message, code, meta } = transform(error);
  if (code) {
    throw HttpErrorException.BadRequest({
      message,
      code,
      meta
    });
  }
  if (isServer) {
    logger.error({ err: error as Error, message, meta, scope: LoggerScope.ERROR.ORY_EXCEPTION });
  } else {
    clientLogger.error({ attributes: { error }, message, reason: LoggerScope.ERROR.ORY_EXCEPTION });
  }
  throw Error(message);
}
