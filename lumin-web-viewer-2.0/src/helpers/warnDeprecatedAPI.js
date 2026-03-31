import logger from 'helpers/logger';
import { LOGGER } from 'constants/lumin-common';

export default (deprecated, current, majorVersion = '7.0') => {
  logger.logInfo({
    message: `instance.${deprecated} is deprecated, please use instance.${current} instead. The deprecated API will be removed in ${majorVersion}.`,
    reason: LOGGER.Service.PDFTRON,
  });
};
