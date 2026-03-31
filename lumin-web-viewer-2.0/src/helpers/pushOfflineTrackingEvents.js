import { indexedDBService } from 'services';

import { eventTracking } from 'utils';

const pushOfflineTrackingEvents = async () => {
  const trackingEvents = await indexedDBService.getOfflineTrackingEvents();
  trackingEvents.forEach((trackingEvent) => {
    eventTracking(trackingEvent.name, trackingEvent.additionalAttributes, trackingEvent.metrics);
  });
  indexedDBService.clearOfflineTrackingEvents();
};

export default pushOfflineTrackingEvents;
