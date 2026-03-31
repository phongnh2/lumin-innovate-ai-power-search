import { GrowthBook } from '@growthbook/growthbook-react';
import { useEffect } from 'react';

import { GrowthBookServices } from 'services/growthBookServices';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

import { useGetAttributesGrowthBook } from './useGetAttributesGrowthBook';

const growthBookServices = GrowthBookServices.instance();
const growthBookInstance = growthBookServices.getGrowthBookInstance;

growthBookInstance
  .init({
    streaming: true,
    /**
     * If the network request takes longer than this (in milliseconds), continue
     * @see https://docs.growthbook.io/lib/react#built-in-fetching-and-caching
     */
    timeout: 15 * 1000,
  })
  .catch((err) => {
    logger.logError({
      reason: LOGGER.Service.GROWTHBOOK_ERROR,
      message: 'Failed to load feature GrowthBook',
      error: err as Error,
    });
  });

const useSetupGrowthBook = (): GrowthBook<Record<string, any>> => {
  const attributes = useGetAttributesGrowthBook();

  useEffect(() => {
    if (attributes) {
      growthBookInstance.setAttributes(attributes).catch((err) => {
        logger.logError({
          reason: LOGGER.Service.GROWTHBOOK_ERROR,
          message: 'Failed to set attributes to GrowthBook',
          error: err,
        });
      });
    }
  }, [attributes]);

  return growthBookInstance;
};

export { useSetupGrowthBook };
