import { eventTracking } from 'utils';

import UserEventConstants from 'constants/eventConstants';
import { BASEURL } from 'constants/urls';

const trackLoadingCoreBundle = async (data: PerformanceResourceTiming): Promise<void> => {
  const bundleName = data.name.replace(`${BASEURL as string}/`, '');
  const {
    initiatorType,
    workerStart,
    redirectStart,
    redirectEnd,
    fetchStart,
    domainLookupStart,
    domainLookupEnd,
    connectStart,
    connectEnd,
    secureConnectionStart,
    requestStart,
    responseStart,
    responseEnd,
    transferSize,
  } = data;
  await eventTracking(
    UserEventConstants.EventType.TIMING,
    {
      timerName: 'PDFTronBundleLoad',
      elapsedTimeMS: data.duration,
      bundleName,
      initiatorType,
    },
    {
      workerStart,
      redirectStart,
      redirectEnd,
      fetchStart,
      domainLookupStart,
      domainLookupEnd,
      connectStart,
      connectEnd,
      secureConnectionStart,
      requestStart,
      responseStart,
      responseEnd,
      transferSize,
    }
  );
};

export default trackLoadingCoreBundle;