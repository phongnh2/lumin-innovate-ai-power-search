import { JSONValue, useFeatureValue } from '@growthbook/growthbook-react';

import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { useCheckFeatureIsLoading } from './useCheckFeatureIsLoading';

type Payload<T> = {
  value: T;
  loading: boolean;
};

type Params<T> = {
  key: string;
  fallback: T;
  attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK;
};

const useGetFeatureValue = <T extends JSONValue>({ key, fallback, attributeToCheckLoading }: Params<T>): Payload<T> => {
  const value = useFeatureValue(key, fallback) as T;
  const { loading } = useCheckFeatureIsLoading(attributeToCheckLoading);

  return {
    value: loading ? fallback : value,
    loading,
  };
};

export { useGetFeatureValue };
