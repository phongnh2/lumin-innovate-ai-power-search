import { merge } from 'lodash';

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 500;

interface IRetryOptions {
  interval: number;
  maxRetries: number;
}

type TFuncType<TInput, TReturn> = (input?: TInput) => TReturn | Promise<TReturn>;

export class Retry {
  static sleep = (timer: number): Promise<number> => new Promise((resolve) => {
    let timeoutId: any = null;
    timeoutId = setTimeout(() => {
      resolve(timeoutId as number);
    }, timer);
  });

  static async Do<TInput = unknown, TReturn = unknown>(fn: TFuncType<TInput, TReturn>, options?: IRetryOptions, count: number = 1): Promise<TReturn> {
    const opts = merge(
      { interval: RETRY_INTERVAL, maxRetries: MAX_RETRIES },
      options,
    );
    try {
      const result = await fn();
      return result;
    } catch (error) {
      if (count >= opts.maxRetries) {
        throw error;
      }
      const id = await Retry.sleep(opts.interval);
      clearTimeout(id);
      return Retry.Do(fn, options, count + 1);
    }
  }
}
