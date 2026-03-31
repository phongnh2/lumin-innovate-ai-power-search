import { useEffect, useRef } from 'react';

import { trackingQuickSearchValue } from '../utils';

const STOP_TYPING_PERIOD_TIME = 3000;

export const useTrackingSearchValue = ({ searchKeyword }: { searchKeyword: string }) => {
  const trackingSearchValueTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchKeyword) {
      if (trackingSearchValueTimeoutRef.current) {
        clearTimeout(trackingSearchValueTimeoutRef.current);
      }

      trackingSearchValueTimeoutRef.current = setTimeout(() => {
        trackingQuickSearchValue();
      }, STOP_TYPING_PERIOD_TIME);
    }

    return () => {
      if (trackingSearchValueTimeoutRef.current) {
        clearTimeout(trackingSearchValueTimeoutRef.current);
      }
    };
  }, [searchKeyword]);
};
