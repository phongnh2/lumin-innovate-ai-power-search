import { indexedDBService } from 'services';

import { LOGGER } from 'constants/lumin-common';

import logger from './logger';

export const autoTurnOnAutoCompleteToggle = async (userId: string): Promise<void> => {
  try {
    const isFeatureEnabled = await indexedDBService.isEnabledAutoCompleteFormField(userId);
    // user not yet turned on or turned off the feature
    if (typeof isFeatureEnabled === 'undefined') {
      await indexedDBService.setAutoCompleteFormField(true, userId);
    }
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.AUTO_TURN_ON_AUTO_COMPLETE_ERROR,
      error: error as Error,
    });
  }
};
