/**
 * https://www.debuggr.io/react-update-unmounted-component/#:~:text=Warning%3A%20Can't%20perform%20a,in%20a%20useEffect%20cleanup%20function.
 */
import { useEffect, useRef } from 'react';

export function useIsMountedRef() {
  const isMountedRef = useRef(null);
  useEffect(() => {
    isMountedRef.current = true;
    return () => isMountedRef.current = false;
  }, []);
  return isMountedRef;
}
