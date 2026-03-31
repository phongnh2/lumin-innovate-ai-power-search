import { onLCP, onFID, onCLS, onINP, onFCP, onTTFB } from 'web-vitals';

import logger from 'helpers/logger';

import UserEventConstants from 'constants/eventConstants';

const reportVital = (data) => {
  const { name, value, rating, delta, id, navigationType, entries } = data;
  const webVitalsData = {
    webVitals: {
      name,
      value,
      rating,
      delta,
      id,
      navigationType,
      entries: entries.map(({ duration, name, entryType, value }) => ({
        duration,
        name,
        entryType,
        value
      }))
    }
  };
  logger.logInfo({
    reason: UserEventConstants.EventType.WEB_VITALS,
    message: name,
    attributes: webVitalsData,
  });
};

export default () => {
  onCLS(reportVital);
  onFID(reportVital);
  onLCP(reportVital);
  onINP(reportVital);
  onFCP(reportVital);
  onTTFB(reportVital);
};
