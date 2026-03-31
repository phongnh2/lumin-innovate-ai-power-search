import { useFeatureIsOn } from '@growthbook/growthbook-react';
import { useEffect } from 'react';
import { usePrevious } from 'react-use';

import logger from 'helpers/logger';

import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { useCheckFeatureIsLoading } from './useCheckFeatureIsLoading';

type Payload = {
  isOn: boolean;
  loading: boolean;
};

type Params = {
  key: string;
  attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK;
};

let timeoutId: ReturnType<typeof setTimeout> | undefined;
const isProductionBranch = process.env.ENV === 'production';

const useGetFeatureIsOn = ({ key, attributeToCheckLoading }: Params): Payload => {
  const isOn = useFeatureIsOn(key);
  const { loading } = useCheckFeatureIsLoading(attributeToCheckLoading);
  const previousLoading = usePrevious(loading);

  useEffect(() => {
    /**
     * Monitor loading time exceeding 15 seconds
     * This will be removed after we resolve the issue
     */
    const timeout = isProductionBranch ? 15 : 2;
    if (loading && previousLoading && !timeoutId) {
      timeoutId = setTimeout(() => {
        logger.logError({
          reason: `[Growthbook] Feature flag loading exceeded ${timeout}s for key: ${key}`,
        });
      }, timeout * 1000);

      if (!loading) {
        clearTimeout(timeoutId);
      }
      return () => clearTimeout(timeoutId);
    }
  }, [loading, key, previousLoading]);

  return { isOn: !loading && isOn, loading };
};

export { useGetFeatureIsOn };
