import produce from 'immer';
import get from 'lodash/get';

// eslint-disable-next-line default-param-last
export default (initialState) => (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'SET_PURCHASE_STATE':
      return {
        ...state,
        isPurchasing: payload.isPurchasing,
      };
    case 'SET_BILLING_WARNING': {
      const { clientId, data } = payload;
      return {
        ...state,
        billingWarning: {
          ...state.billingWarning,
          [clientId]: data,
        },
      };
    }
    case 'DELETE_BILLING_BANNER': {
      const { clientId, bannerType } = payload;

      return produce(state, (draftState) => {
        const { billingWarning } = draftState;
        const warnings = get(billingWarning, `[${clientId}].warnings`, []);
        if (warnings.length === 1) {
          Reflect.deleteProperty(billingWarning, clientId);
        } else {
          const bannerIndex = warnings.find(({ type }) => type === bannerType);
          warnings.splice(bannerIndex, 1);
        }
      });
    }
    default:
      return state;
  }
};
