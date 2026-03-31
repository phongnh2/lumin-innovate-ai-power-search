import { useRouter } from 'next/router';

import { QUERY_KEYS } from '@/constants/common';
import { extractReturnToFromRouter, getReturnParamValues } from '@/utils/auth.utils';

const useGetQueryValuesFromReturnTo = (returnKey?: string) => {
  const router = useRouter();
  const returnToValue = (router.query[returnKey ?? QUERY_KEYS.RETURN_TO] || extractReturnToFromRouter(router)) as string;

  return {
    returnToValue,
    returnToParams: { ...(returnToValue && getReturnParamValues(returnToValue)) }
  };
};

export default useGetQueryValuesFromReturnTo;
