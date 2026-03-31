import { isObject, isString } from 'lodash';
import { TFunction } from 'next-i18next';

type ErrorWithMessage = {
  message: string;
};

type ErrorMessage = {
  key: string;
  interpolation: Record<string, unknown>;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as Record<string, unknown>).message === 'string';
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

export const getErrorMetadata = (error: unknown): Record<string, any> | null => {
  return typeof error === 'object' && error !== null ? (error as any).data?.meta || {} : null;
};

export const getErrorMessageTranslated = (error: unknown, t: TFunction) => {
  if (!error) {
    return '';
  }

  if (isObject(error) && (error as ErrorMessage).key && (error as ErrorMessage).interpolation) {
    return t((error as ErrorMessage).key, { ...(error as ErrorMessage).interpolation }) as string;
  }

  if (isString(error)) {
    return t(error);
  }

  return '';
};
