import { RetryService } from '../retryServices';

describe('retryServices', () => {
  it('should succeed on first attempt', async () => {
    const result = await RetryService.retry({fn:  () => Promise.resolve('success'), maxRetries: 3});
    expect(result).toBe('success');
  });

  it('should succeed after multiple attempts', async () => {
    let count = 0;
    const result = await RetryService.retry({
      fn: () => {
        count++;
        if (count < 3) {
          return Promise.reject('error');
        } else {
          return Promise.resolve('success');
        }
      },
    });
    expect(result).toBe('success');
  });

  it('should fail after maxRetries attempts', async () => {
    let count = 0;
    try {
      await RetryService.retry({
        fn: () => {
          count++;
          return Promise.reject('error');
        },
        maxRetries: 3,
      });
    } catch (error) {
      expect(error).toBe('error');
      expect(count).toBe(4);
    }
  });

  it('onError type function', async () => {
    const result = await RetryService.retry({
      fn: () => Promise.reject('error'),
      onError: () => Promise.resolve('success'),
    });
    expect(result).toBe('success');
  });
});
