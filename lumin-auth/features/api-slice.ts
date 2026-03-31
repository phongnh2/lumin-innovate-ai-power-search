import { FetchArgs, createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/dist/query/react';

import { ErrorCode } from '@/constants/errorCode';
import sessionManagement from '@/lib/session';

type FetchArgsExtra = FetchArgs & { forceNewToken?: boolean };

export const api = createApi({
  reducerPath: 'accountApi',
  tagTypes: ['identity'],
  baseQuery: retry(
    async (args: string | FetchArgsExtra, apiQuery, extraOptions) => {
      const result = await fetchBaseQuery({
        baseUrl: '/api',
        prepareHeaders: async headers => {
          const shouldForceNewToken = typeof args === 'object' && Boolean((args as FetchArgsExtra)?.forceNewToken);
          const token = await sessionManagement.getAuthorizeToken({ forceNew: shouldForceNewToken });
          if (token) {
            headers.set('authorization', `Bearer ${token}`);
          }
          return headers;
        }
      })(args, apiQuery, extraOptions);

      if (!result.error) {
        return {
          data: result.data ?? null,
          meta: result.meta
        };
      }
      if ((result.error?.data as any)?.code !== ErrorCode.Auth.TOKEN_EXPIRED) {
        retry.fail(result.error);
      } else {
        const token = await sessionManagement.getAuthorizeToken({ forceNew: true });
        result.meta?.request.headers.set('authorization', `Bearer ${token}`);
      }

      return result;
    },
    {
      maxRetries: 2
    }
  ),
  endpoints: () => ({})
});
