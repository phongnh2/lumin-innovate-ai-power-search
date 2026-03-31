import axios from 'axios';

import { environment } from '@/configs/environment';
import { LocalStorageKey } from '@/constants/localStorageKey';
import { clientLogger } from '@/lib/logger';
import { isClientSide } from '@/utils/commonUtils';
import { getErrorMessage } from '@/utils/error.utils';
import LocalStorageUtils from '@/utils/localStorage.utils';

export const fetchAndStoreUserLocation = (): void => {
  if (!isClientSide()) {
    return;
  }

  const storedCountry = LocalStorageUtils.get({ key: LocalStorageKey.USER_LOCATION_COUNTRY });
  const storedCity = LocalStorageUtils.get({ key: LocalStorageKey.USER_LOCATION_CITY });

  if (storedCountry && storedCity) {
    return;
  }

  axios
    .get<{ countryCode: string; regionName: string; city: string }>(environment.public.host.backendUrl + '/user/user-location', { withCredentials: true })
    .then(({ data }) => {
      if (data?.countryCode != null) {
        LocalStorageUtils.set({
          key: LocalStorageKey.USER_LOCATION_COUNTRY,
          value: String(data.countryCode)
        });
      }
      if (data?.city != null) {
        LocalStorageUtils.set({
          key: LocalStorageKey.USER_LOCATION_CITY,
          value: String(data.city)
        });
      }
    })
    .catch((e: Error) => {
      clientLogger.error({
        message: getErrorMessage(e),
        reason: 'UserLocationFetchError',
        attributes: {}
      });
    });
};
