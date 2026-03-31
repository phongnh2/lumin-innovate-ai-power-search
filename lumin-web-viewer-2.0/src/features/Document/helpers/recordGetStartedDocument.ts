import timeTracking from 'screens/Viewer/time-tracking';

import { eventTracking } from 'utils';

import { LocalStorageKey } from 'constants/localStorageKey';
import {
  START_DOWNLOAD_DOCUMENT,
  OPEN_STARTED_DOCUMENT,
  FIRST_PAGE_RENDER,
  TIME_USER_STAY,
} from 'constants/timeTracking';

type RecordGetStartedDocumentParams = {
  keepAlive: boolean;
  fromNewAuthFlow: boolean;
};
export default ({ keepAlive = false, fromNewAuthFlow = false }: RecordGetStartedDocumentParams): void => {
  if (fromNewAuthFlow) {
    const timeToStartDownloadMS = timeTracking.isFinishedTracking(START_DOWNLOAD_DOCUMENT)
      ? timeTracking.trackingTimeOf(START_DOWNLOAD_DOCUMENT)
      : 0;
    const timeToFirstPageRenderedMS = timeTracking.isFinishedTracking(FIRST_PAGE_RENDER)
      ? timeTracking.trackingTimeOf(FIRST_PAGE_RENDER)
      : 0;
    const timeUserStay = timeTracking.trackingTimeOf(TIME_USER_STAY);
    const data = {
      eventName: OPEN_STARTED_DOCUMENT,
      metrics: {
        timeToStartDownloadMS,
        timeToFirstPageRenderedMS,
        timeUserStay,
      },
    };
    if (keepAlive) {
      localStorage.setItem(LocalStorageKey.OPEN_STARTED_DOCUMENT, JSON.stringify(data));
    } else {
      // eslint-disable-next-line no-void
      void eventTracking(data.eventName, {}, data.metrics);
    }
    timeTracking.unRegister(START_DOWNLOAD_DOCUMENT);
    timeTracking.unRegister(FIRST_PAGE_RENDER);
    timeTracking.unRegister(OPEN_STARTED_DOCUMENT);
  }
};
