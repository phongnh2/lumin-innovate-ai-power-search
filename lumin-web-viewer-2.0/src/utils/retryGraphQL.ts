import pRetry, { AbortError, FailedAttemptError } from 'p-retry';

import { STATUS_CODE } from 'constants/lumin-common';

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_DELAY = 1000;
const DEFAULT_MAX_DELAY = 8000;

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  retryCondition?: (error: ErrorWithGraphQL) => boolean;
  onFailedAttempt?: (error: FailedAttemptError) => void | Promise<void>;
}

interface GraphQLError {
  extensions?: {
    statusCode?: number;
  };
}

interface NetworkError {
  statusCode?: number;
}

interface ErrorWithGraphQL {
  graphQLErrors?: GraphQLError[];
  networkError?: NetworkError;
}

const defaultRetryCondition = (error: ErrorWithGraphQL): boolean => {
  const hasUnavailableServiceGraphQL = error?.graphQLErrors?.some(
    (gqlError) => gqlError?.extensions?.statusCode === STATUS_CODE.SERVICE_UNAVAILABLE
  );
  const hasUnavailableServiceNetwork = error?.networkError?.statusCode === STATUS_CODE.SERVICE_UNAVAILABLE;
  return hasUnavailableServiceGraphQL || hasUnavailableServiceNetwork;
};

export const retryGraphQLOperation = async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    initialDelay = DEFAULT_INITIAL_DELAY,
    maxDelay = DEFAULT_MAX_DELAY,
    retryCondition = defaultRetryCondition,
    onFailedAttempt = () => {},
  } = options;

  return pRetry(
    async () => {
      try {
        return await fn();
      } catch (error) {
        const typedError = error as ErrorWithGraphQL;

        if (!retryCondition(typedError)) {
          throw new AbortError(error instanceof Error ? error : new Error(String(error)));
        }

        throw error;
      }
    },
    {
      retries: maxRetries,
      factor: 2,
      minTimeout: initialDelay,
      maxTimeout: maxDelay,
      onFailedAttempt,
    }
  );
};

export const retryOnUnavailableService = <T>(fn: () => Promise<T>): Promise<T> =>
  retryGraphQLOperation(fn, {
    maxRetries: DEFAULT_MAX_RETRIES,
    initialDelay: DEFAULT_INITIAL_DELAY,
    retryCondition: defaultRetryCondition,
  });
