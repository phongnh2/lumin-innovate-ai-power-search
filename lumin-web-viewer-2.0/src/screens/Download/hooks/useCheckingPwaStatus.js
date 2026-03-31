import { useEffect, useState } from 'react';
import { useIsMountedRef } from 'hooks';

/**
 * we need to fake the time checking PWA because the "beforeinstallprompt" event won't be triggered
 * when the PWA has been installed
 */
const CHECKING_TIME_OUT = 1200;

function useCheckingPwaStatus() {
  const [checking, setChecking] = useState(true);
  const isMounted = useIsMountedRef();
  useEffect(() => {
    const timeout = setTimeout(() => {
      isMounted.current && setChecking(false);
    }, CHECKING_TIME_OUT);
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  return { checking };
}

export default useCheckingPwaStatus;
