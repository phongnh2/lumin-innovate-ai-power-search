import rafSchd from 'raf-schd';
import { useEffect, useContext, useMemo } from 'react';
import { useContextMenu } from 'react-contexify';

import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';

const useCloseContextMenuOnScroll = () => {
  const { bodyScrollRef } = useContext(AppLayoutContext);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { hideAll } = useContextMenu();

  const scrollHandler = useMemo(
    () =>
      rafSchd(() => {
        hideAll();
      }),
    []
  );

  useEffect(() => {
    (bodyScrollRef.current as HTMLDivElement)?.addEventListener('scroll', scrollHandler, { passive: true });
    return () => {
      scrollHandler.cancel();
      (bodyScrollRef.current as HTMLDivElement)?.removeEventListener('scroll', scrollHandler);
    };
  }, [scrollHandler]);
};

export default useCloseContextMenuOnScroll;
