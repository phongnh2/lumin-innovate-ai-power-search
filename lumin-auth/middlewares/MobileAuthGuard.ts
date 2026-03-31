import { NextApiResponse } from 'next';
import { NextFunction, createMiddlewareDecorator } from 'next-api-decorators';

import { AUTH_HEADER_REGEX } from '@/constants/common';
import { TIdentityRequest } from '@/interfaces/common';
import { HttpErrorException } from '@/lib/exceptions/HttpErrorException';
import grpc from '@/lib/grpc';

function parseAuthHeader(hdrValue: unknown) {
  if (typeof hdrValue !== 'string') {
    return '';
  }
  const matches = hdrValue.match(AUTH_HEADER_REGEX);
  return matches && { scheme: matches[1], value: matches[2] };
}

export default createMiddlewareDecorator(async (request: TIdentityRequest, _: NextApiResponse, next: NextFunction): Promise<void> => {
  const isRequestFromMobile = request.headers['x-mobile'];
  if (!isRequestFromMobile) {
    throw HttpErrorException.NotAllowMethod({ message: 'Method not allowed' });
  }
  const accessToken = parseAuthHeader(request.headers['authorization']);
  const refreshToken = parseAuthHeader(request.headers['refreshtoken']);
  if (!accessToken || !refreshToken) {
    throw HttpErrorException.Unauthorized({ message: 'Unauthorized' });
  }

  const { email } =
    (await grpc.auth.verifyLuminToken({
      accessToken: accessToken.value,
      refreshToken: refreshToken.value as string
    })) || {};
  if (!email) {
    throw HttpErrorException.Forbidden({ message: 'Forbidden Resource' });
  }
  const { user = null } =
    (await grpc.user.getUserByEmail({
      email
    })) || {};
  request.user = user;
  return next();
});
