import { useEffect, useRef } from 'react';

const useLatestRef = <T>(value: T): { current: T } => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};

export { useLatestRef };

export default useLatestRef;
