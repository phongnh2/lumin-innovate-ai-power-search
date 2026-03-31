import { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

import { LocalStorageKey } from 'constants/localStorageKey';
import { ErrorCode } from 'constants/lumin-common';

type AxiosError = {
  response: {
    status: number;
    data: { code: string };
  };
};

export default (instance: AxiosInstance) => {
  axiosRetry(instance, {
    retries: 2,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      const { response } = error as AxiosError;
      if (response.data && response.data.code === ErrorCode.Common.TOKEN_EXPIRED && response.status === 401) {
        localStorage.removeItem(LocalStorageKey.ORY_ACCESS_TOKEN);
        return true;
      }
      return false;
    },
  });
};
