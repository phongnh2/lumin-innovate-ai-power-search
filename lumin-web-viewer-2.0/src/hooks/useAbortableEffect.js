/**
 * https://www.debuggr.io/react-update-unmounted-component/#:~:text=Warning%3A%20Can't%20perform%20a,in%20a%20useEffect%20cleanup%20function.
 */

import { useEffect } from 'react';

export function useAbortableEffect(effect, dependencies) {
  const status = {}; // mutable status object
  useEffect(() => {
    status.aborted = false;
    // pass the mutable object to the effect callback
    // store the returned value for cleanup
    const cleanUpFn = effect(status);
    return () => {
      // mutate the object to signal the consumer
      // this effect is cleaning up
      status.aborted = true;
      if (typeof cleanUpFn === 'function') {
        // run the cleanup function
        cleanUpFn();
      }
    };
  }, [...dependencies]);
}
