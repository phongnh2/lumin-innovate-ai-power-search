import { useCallback } from 'react';

import { enqueueSnackbar } from '@libs/snackbar';

import { useTranslation } from 'hooks/useTranslation';

import logger from 'helpers/logger';

const GOOGLE_ONE_TAP_ERROR_TYPES = {
  MISSING_CREDENTIAL: 'missing_credential',
  FETCH_TOKEN_FAILED: 'fetch_token_failed',
  LOGIN_FLOW_FAILED: 'login_flow_failed',
  NETWORK_ERROR: 'network_error',
  UNKNOWN: 'unknown',
} as const;

type GoogleOneTapErrorType = typeof GOOGLE_ONE_TAP_ERROR_TYPES[keyof typeof GOOGLE_ONE_TAP_ERROR_TYPES];

const getErrorType = (error: Error | string): GoogleOneTapErrorType => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes('Missing credential')) {
    return GOOGLE_ONE_TAP_ERROR_TYPES.MISSING_CREDENTIAL;
  }
  if (errorMessage.includes('Failed to fetch token')) {
    return GOOGLE_ONE_TAP_ERROR_TYPES.FETCH_TOKEN_FAILED;
  }
  if (errorMessage.includes('Missing oidc flow') || errorMessage.includes('login')) {
    return GOOGLE_ONE_TAP_ERROR_TYPES.LOGIN_FLOW_FAILED;
  }
  if (errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
    return GOOGLE_ONE_TAP_ERROR_TYPES.NETWORK_ERROR;
  }
  return GOOGLE_ONE_TAP_ERROR_TYPES.UNKNOWN;
};

const shouldShowUserNotification = (errorType: GoogleOneTapErrorType): boolean => {
  const silentErrors: GoogleOneTapErrorType[] = [GOOGLE_ONE_TAP_ERROR_TYPES.MISSING_CREDENTIAL];
  return !silentErrors.includes(errorType);
};

export const useGoogleOneTapErrorHandler = () => {
  const { t } = useTranslation();

  const handleError = useCallback(
    (error?: Error | string) => {
      if (!error) return;

      const normalizedError = error instanceof Error ? error : new Error(String(error));
      const errorType = getErrorType(normalizedError);

      logger.logError({
        reason: 'GoogleOneTapError',
        error: normalizedError,
        attributes: { errorType },
      });

      if (shouldShowUserNotification(errorType)) {
        const messageKey =
          errorType === GOOGLE_ONE_TAP_ERROR_TYPES.NETWORK_ERROR
            ? 'googleOneTap.networkError'
            : 'googleOneTap.signInFailed';

        enqueueSnackbar({
          message: t(messageKey),
          variant: 'error',
        });
      }
    },
    [t]
  );

  return { handleError };
};
