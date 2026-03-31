import { useContext, useEffect } from 'react';

import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';

export function useLayoutScroll(func, deps = []) {
  const { bodyScrollRef } = useContext(AppLayoutContext);

  const scrollTop = () => {
    bodyScrollRef.current.scrollTop = 0;
  };

  useEffect(() => {
    const ref = bodyScrollRef.current;
    const handler = (event) => {
      func(ref, event);
    };
    ref && ref.addEventListener('scroll', handler, { passive: true });
    return () => {
      ref && ref.removeEventListener('scroll', handler);
    };
  }, [deps]);

  return {
    scrollTop,
  };
}
