import logger from 'helpers/logger';
import { LOGGER } from 'constants/lumin-common';

export default (arg) => {
  let zoomLevel;

  if (typeof arg === 'string') {
    zoomLevel = Number.parseFloat(arg) / 100;

    const endsWithPercentage = arg.indexOf('%') === arg.length - 1;
    if (endsWithPercentage) {
      logger.logInfo({
        message: `Zoom level in string format will be treated as percentage, ${arg} will be converted to ${zoomLevel}`,
        reason: LOGGER.Service.PDFTRON,
      });
    }
  } else if (typeof arg === 'number') {
    zoomLevel = arg;
  }

  return zoomLevel;
};
