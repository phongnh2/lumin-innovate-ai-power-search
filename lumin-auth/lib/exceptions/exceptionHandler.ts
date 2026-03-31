import { NextApiRequest, NextApiResponse } from 'next';

import { LoggerScope } from '@/constants/common';
import { HttpErrorCode } from '@/constants/errorCode';
import { TIdentityRequest } from '@/interfaces/common';

import { logger } from '../logger/logger';

import { BaseException } from './base.exception';

export function exceptionHandler(error: BaseException, request: NextApiRequest, res: NextApiResponse) {
  const httpAttributes = logger.getCommonHttpAttributes(request as TIdentityRequest);
  if (error instanceof BaseException) {
    logger.info({ message: error.getResponseError().message, meta: { ...error.getMetaData(), ...httpAttributes } });
    return res.status(error.getStatus()).json(error.getResponseError());
  }
  logger.error({ err: error as unknown as Error, meta: httpAttributes, scope: LoggerScope.ERROR.UNKNOWN_ERROR });
  return res.status(HttpErrorCode.UNPROCESS_ENTITY).json({ message: (error as any).message });
}
