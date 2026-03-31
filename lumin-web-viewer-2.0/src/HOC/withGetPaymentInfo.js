import { merge } from 'lodash';
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

export const PaymentInfoContext = React.createContext();

const initialState = {
  data: {},
  loading: true,
};

const withGetPaymentInfo = (Component) => (props) => {
  const [{ data, loading }, setState] = useState(initialState);
  const { nextPlanRemoteId, nextProductId } = data;
  const eventQueue = useRef([]);
  const updateState = useCallback((newData) => setState((prev) => merge({}, prev, newData)), []);

  const injectPaymentInfo = (params) =>
    merge({}, params, {
      formStripePlanOrPriceId: nextPlanRemoteId,
      formStripeProductId: nextProductId,
    });

  const pushToQueue = useCallback(({ callback, params }) => eventQueue.current.push({ callback, params }), []);

  const triggerEvent = useCallback(
    ({ callback, params }) => {
      if (loading) {
        pushToQueue({ callback, params });
      } else {
        callback(injectPaymentInfo(params));
      }
    },
    [loading, pushToQueue]
  );

  useEffect(() => {
    if (!loading) {
      eventQueue.current.forEach(({ callback, params }) => callback(injectPaymentInfo(params)));
      eventQueue.current = [];
    }
  }, [loading, eventQueue.current.length]);

  const context = useMemo(
    () => ({
      nextPlanRemoteId: data.nextPlanRemoteId,
      nextProductId: data.nextProductId,
      loading,
      updateState,
      triggerEvent,
    }),
    [data.nextPlanRemoteId, data.nextProductId, loading, triggerEvent, updateState]
  );
  return (
    <PaymentInfoContext.Provider
      value={context}
    >
      <Component {...props} />
    </PaymentInfoContext.Provider>
  );
};

withGetPaymentInfo.propTypes = {

};

export default withGetPaymentInfo;
