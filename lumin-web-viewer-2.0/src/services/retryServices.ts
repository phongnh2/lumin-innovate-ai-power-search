/* eslint-disable no-await-in-loop */

const DEFAULT_MAX_RETRIES = 2;

export class RetryService {
  static async retry<T>({
    fn,
    maxRetries = DEFAULT_MAX_RETRIES,
    onError,
    shouldCancel,
  }: {
    fn: () => Promise<T>;
    maxRetries?: number;
    onError?: (error: any) => Promise<T>;
    shouldCancel?: boolean;
  }): Promise<T> {
    let attempts = 0;
    while (attempts <= maxRetries && !shouldCancel) {
      try {
        return await fn();
      } catch (error) {
        if (attempts >= maxRetries) {
          if (typeof onError === 'function') {
            return await onError(error);
          }
          throw error;
        }
      } finally {
        attempts++;
      }
    }
  }
}
