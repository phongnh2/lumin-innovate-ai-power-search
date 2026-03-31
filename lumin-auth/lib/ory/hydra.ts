import { OAuth2Api, Configuration } from '@ory/client';

import { environment } from '@/configs/environment';

import { HYDRA_ADMIN_URL } from '../../config';
import sanitizedAxiosInstance from '../exceptions/sanitizedAxios';

export const hydraAdmin = new OAuth2Api(
  new Configuration({
    basePath: HYDRA_ADMIN_URL,
    baseOptions: {
      headers: {
        Authorization: `Bearer ${environment.internal.ory.adminApiKey}`
      }
    }
  }),
  undefined,
  sanitizedAxiosInstance
);
