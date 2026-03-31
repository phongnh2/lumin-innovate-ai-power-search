import { useEffect, useRef } from 'react';

import logger from 'helpers/logger';
import trackLoadingCoreBundle from 'helpers/trackLoadingCoreBundle';

import { CoreBundleNeedTrackEvent } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';

const observeWithEntryTypes = (observer: PerformanceObserver): void => {
  try {
    observer.observe({ buffered: true, entryTypes: ['resource'] });
  } catch (err) {
    logger.logError({
      error: err as Error,
      reason: LOGGER.Service.PERFORMANCE_OBSERVER_ERROR,
    });
  }
};

const useTrackCoreBundleLoadingTime = (): void => {
  const listFileBundle = useRef(CoreBundleNeedTrackEvent);

  useEffect(() => {
    let observer: PerformanceObserver;
    if (PerformanceObserver) {
      observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(async (entry) => {
          if (listFileBundle.current.find((fileName) => entry.name.includes(fileName))) {
            await trackLoadingCoreBundle(entry as PerformanceResourceTiming);
            listFileBundle.current = listFileBundle.current.filter((fileName) => !entry.name.includes(fileName));
          }
          if (!listFileBundle.current.length) {
            observer.disconnect();
          }
        });
      });
      try {
        observer.observe({ type: 'resource', buffered: true });
      } catch (error) {
        if ((error as Error).message.includes('entryTypes')) {
          observeWithEntryTypes(observer);
        } else {
          logger.logError({
            error: error as Error,
            reason: LOGGER.Service.PERFORMANCE_OBSERVER_ERROR,
          });
        }
      }
    }
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);
};

export default useTrackCoreBundleLoadingTime;
