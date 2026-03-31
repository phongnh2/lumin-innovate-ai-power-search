import { NextApiResponse } from 'next';
import { NextFunction, createMiddlewareDecorator } from 'next-api-decorators';

import { ErrorCode } from '@/constants/errorCode';
import { TIdentityRequest } from '@/interfaces/common';
import { HttpErrorException } from '@/lib/exceptions/HttpErrorException';
import JWTService from '@/lib/jwt';

export default createMiddlewareDecorator(async (request: TIdentityRequest, _: NextApiResponse, next: NextFunction): Promise<void> => {
  const bearerToken = request.headers.authorization?.replace('Bearer ', '');
  if (!bearerToken) {
    throw HttpErrorException.Unauthorized({ message: 'Unauthorized' });
  }
  try {
    const jwtService = new JWTService();
    const { id, identity } = await jwtService.verifyAuthorizationToken(bearerToken);
    request.sessionId = id as string;
    if (identity) {
      request.identity = identity;
    }
    return next();
  } catch (err: any) {
    if (err?.code === 'ERR_JWT_EXPIRED') {
      throw HttpErrorException.Unauthorized({ message: 'Token expired', code: ErrorCode.Auth.TOKEN_EXPIRED });
    }
    throw err;
  }
});
