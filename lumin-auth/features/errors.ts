import { TFunction } from 'i18next';

import { ErrorCode } from '@/constants/errorCode';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { LoginService } from '@/interfaces/user';
import { getAuthenticationMethodMessage, getAuthenticationMethodText } from '@/utils/auth.utils';
import { avoidNonOrphansWord } from '@/utils/string.utils';
export enum Code {
  InvalidArgument = 'invalid_argument',
  Unauthenticated = 'unauthenticated'
}

export type SerializedError<T = unknown> = {
  code: string;
  message?: string;
  meta: T;
};

export function isSerializedError<T = unknown>(err: unknown): err is { status: number; data: SerializedError<T> } {
  let ok = typeof err === 'object' && err != null && 'status' in err && 'data' in err;

  const anyErr = err as any;
  ok = ok && typeof anyErr.status === 'number' && ['string', 'number'].includes(typeof anyErr.data.code);
  return ok;
}

export function isRawOryError(err: unknown): boolean {
  const isObjectType = typeof err === 'object' && err != null && 'id' in err && 'code' in err && 'message' in err;
  const anyError = err as any;
  return isObjectType && anyError && typeof anyError.id === 'string' && typeof anyError.code === 'number';
}

export function isFrontendApiError(err: unknown): boolean {
  const isObjectType = typeof err === 'object' && err != null && 'message' in err && 'code' in err;
  const anyError = err as any;
  return isObjectType && anyError && typeof anyError.message === 'string';
}

export const getServerError = (error: { data: { meta: { loginService?: LoginService } } }, t: TFunction) => ({
  [ErrorCode.User.INCORRECT_EMAIL_PASSWORD]: t(CommonErrorMessage.User.INCORRECT_CREDENTIAL),
  [ErrorCode.Password.LEAKED_PASSWORD]: t(CommonErrorMessage.Password.LEAKED_PASSWORD),
  [ErrorCode.Password.SIMILARITY_PASSWORD]: t(CommonErrorMessage.Password.SIMILARITY_PASSWORD),
  [ErrorCode.User.EMAIL_IS_BANNED]: avoidNonOrphansWord(t(CommonErrorMessage.User.EMAIL_IS_BANNED)),
  [ErrorCode.User.EMAIL_EXISTS]: avoidNonOrphansWord(t(CommonErrorMessage.User.EMAIL_READY_EXISTS)),
  [ErrorCode.User.RECAPTCHA_V2_VALIDATION_FAILED]: t(CommonErrorMessage.User.RECAPTCHA_V2_VALIDATION_FAILED),
  [ErrorCode.User.USER_NOT_FOUND]: t(CommonErrorMessage.User.USER_NOT_FOUND),
  [ErrorCode.Auth.SESSION_ALREADY_AVAILABLE]: t(CommonErrorMessage.Auth.SESSION_ALREADY_AVAILABLE),
  [ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD]: getAuthenticationMethodMessage(
    getAuthenticationMethodText((error.data?.meta?.loginService as LoginService) || 'unknown_third_party', t)
  )
});
