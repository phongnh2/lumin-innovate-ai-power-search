import timeTracking from 'screens/Viewer/time-tracking';

import { eventTracking } from 'utils';

import { RENDER_PDF_DOCUMENT } from 'constants/timeTracking';

export default (sharedPinpointAttributes: Record<string, unknown>): void => {
  if (timeTracking.isExist(RENDER_PDF_DOCUMENT)) {
    // eslint-disable-next-line no-void
    void eventTracking(
      RENDER_PDF_DOCUMENT,
      { ...sharedPinpointAttributes },
      {
        waitingTimeInMS: timeTracking.trackingTimeOf(RENDER_PDF_DOCUMENT),
      }
    );
  }
};
