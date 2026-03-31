import rafSchd from 'raf-schd';
import { useEffect, useMemo } from 'react';

import useEnableWebReskin from './useEnableWebReskin';

type UseHideTooltipOnScrollProps = {
  container: HTMLElement;
};

const useHideTooltipOnScroll = ({ container }: UseHideTooltipOnScrollProps) => {
  const { isEnableReskin } = useEnableWebReskin();

  const scrollHandler = useMemo(
    () =>
      rafSchd(() => {
        const tooltipElement = document.querySelector('[role="tooltip"]');
        if (tooltipElement) {
          Object.assign((tooltipElement as HTMLElement).style, {
            display: 'none',
          });
        }
      }),
    []
  );

  useEffect(() => {
    if (isEnableReskin) {
      container?.addEventListener('scroll', scrollHandler, { passive: true });
    }
    return () => {
      scrollHandler.cancel();
      container?.removeEventListener('scroll', scrollHandler);
    };
  }, [container, isEnableReskin, scrollHandler]);
};

export default useHideTooltipOnScroll;
