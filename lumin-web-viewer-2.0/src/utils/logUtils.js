import { LOGGER } from 'constants/lumin-common';
import logger from 'helpers/logger';

const logShareDocument = (users, message) => {
  const sharedUserIds = users.map((x) => x._id || 'nonLuminUser');
  logger.logInfo({
    message,
    reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
    attributes: { sharedUserIds },
  });
};

export default { logShareDocument };
