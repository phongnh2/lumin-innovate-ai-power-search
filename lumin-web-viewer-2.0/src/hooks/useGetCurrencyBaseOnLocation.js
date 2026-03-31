import { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { userServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils } from 'utils';

import { LocalStorageKey } from 'constants/localStorageKey';
import { ERROR_MESSAGE_LOCATION_CURRENCY } from 'constants/messages';
import { CURRENCY } from 'constants/paymentConstant';

const useGetCurrencyBaseOnLocation = () => {
  const dispatch = useDispatch();
  const { value: locationCurrency, loading } = useSelector(selectors.getLocationCurrency, shallowEqual);

  const fetchCurrencyBaseOnLocation = async () => {
    try {
      const data = await userServices.getCurrencyBaseOnLocation();
      localStorage.setItem(LocalStorageKey.CURRENCY, data.currency);
      dispatch(actions.updateLocationCurrency(data.currency));
    } catch (error) {
      toastUtils.openUnknownErrorToast();
      logger.logError({ message: ERROR_MESSAGE_LOCATION_CURRENCY, error });
      dispatch(actions.updateLocationCurrency(CURRENCY.USD.value));
    }
  };

  useEffect(() => {
    if (!locationCurrency) {
      fetchCurrencyBaseOnLocation();
    }
  }, []);

  return {
    locationCurrency,
    loading,
  };
};

export { useGetCurrencyBaseOnLocation };
