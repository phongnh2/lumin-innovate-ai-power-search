import axios from 'axios';

import type { Identity } from '@/interfaces/ory';
import { frontendApi } from '@/lib/ory';

import { api } from '../api-slice';

export const identityApi = api.injectEndpoints({
  endpoints: builder => ({
    getIdentity: builder.query<Identity | null | undefined, void>({
      providesTags: ['identity'],
      queryFn: async () => {
        try {
          const { data: sess } = await frontendApi.toSession();
          return { data: sess.identity };
        } catch (err) {
          if (!axios.isAxiosError(err) || !err.response) {
            throw err;
          }
          if (err.response?.status === 401) {
            return { data: null };
          }

          return {
            error: {
              status: err.response.status,
              data: err
            }
          };
        }
      }
    })
  })
});

export const { useGetIdentityQuery } = identityApi;
