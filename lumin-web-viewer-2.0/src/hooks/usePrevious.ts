import { useEffect, useRef } from 'react';

type PreviousOptions = {
  allowNullish?: boolean;
};

export const usePrevious = <T>(value: T, options?: PreviousOptions): T => {
  const { allowNullish = true } = options || {};
  const ref = useRef<T>(null);
  useEffect(() => {
    if ((!allowNullish && value) || allowNullish) {
      ref.current = value;
    }
  });

  return ref.current;
};

export default usePrevious;
