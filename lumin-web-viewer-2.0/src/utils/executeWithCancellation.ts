import { OPERATION_CANCELED_MESSAGE } from 'constants/lumin-common';

export const executeWithCancellation =
  <T>({
    callback,
    signal,
    onCancel,
  }: {
    callback: (...args: unknown[]) => Promise<T>;
    signal: AbortSignal | null;
    onCancel?: () => void;
  }): ((...args: unknown[]) => Promise<T>) =>
  async (...args: unknown[]) => {
    if (!signal) {
      return callback(...args);
    }

    if (signal.aborted) {
      onCancel?.();
      throw new Error(OPERATION_CANCELED_MESSAGE);
    }

    const cancelPromise = new Promise<never>((_, reject) => {
      const abortHandler = () => {
        onCancel?.();
        reject(new Error(OPERATION_CANCELED_MESSAGE));
      };
      signal.addEventListener('abort', abortHandler, { once: true });
    });

    return Promise.race([callback(...args), cancelPromise]);
  };
