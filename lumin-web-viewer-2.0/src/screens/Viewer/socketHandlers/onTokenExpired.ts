import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

interface Error {
  name?: string;
  message: string;
  response?: string;
  status?: number;
}

export default (callback = () => {}) =>
  (error: Error) => {
    callback();
    logger.logError({
      reason: LOGGER.Service.COMMON_ERROR,
      error,
    });
  };
