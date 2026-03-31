import { useEffect, useCallback, useMemo } from 'react';

import { makeCancelable } from 'utils/makeCancelable';

const useMakeCancelable = (promise: () => Promise<unknown>): (Promise<unknown> | (() => void))[] => {
  const instance = useMemo(() => makeCancelable(promise), [promise]);

  const cancel = useCallback(() => instance.cancel(), [instance]);

  useEffect(
    () => () => {
      cancel();
    },
    [cancel]
  );
  return [instance.promise, cancel];
};

export default useMakeCancelable;
