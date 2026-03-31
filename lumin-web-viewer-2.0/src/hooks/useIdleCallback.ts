import { UnsupportedBehavior, useIdleCallback as useIdleCallbackBase } from '@shopify/react-idle';

export const useIdleCallback = (
  callback: () => void,
  config?: { unsupportedBehavior?: UnsupportedBehavior | undefined }
): void =>
  useIdleCallbackBase(callback, {
    unsupportedBehavior: UnsupportedBehavior.Immediate,
    ...config,
  });
