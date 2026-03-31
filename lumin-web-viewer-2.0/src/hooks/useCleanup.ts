import { useEffect } from 'react';

export const useCleanup = (callback: () => unknown, deps?: unknown[]) => {
  useEffect(
    () => () => {
      callback();
    },
    deps || [callback]
  );
};
