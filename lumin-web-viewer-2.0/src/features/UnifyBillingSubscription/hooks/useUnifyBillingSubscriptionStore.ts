import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from 'hooks/zustandStore/logger';

import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';

import { GetUnifySubscriptionData } from 'interfaces/payment/payment.interface';

interface UnifyBillingSubscriptionState {
  upcomingInvoice?: GetUnifySubscriptionData['upcomingInvoice'];
  subscription: GetUnifySubscriptionData['subscription'];
  setUnifyBillingSubscriptionData: (payload: GetUnifySubscriptionData) => void;
  setSubscriptionData: (payload: GetUnifySubscriptionData['subscription']) => void;
  reset: VoidFunction;
}

export const defaultSubscription: GetUnifySubscriptionData['subscription'] = {
  payment: {
    period: null,
    status: null,
    currency: null,
    subscriptionItems: [
      {
        id: null,
        quantity: 1,
        planRemoteId: null,
        period: null,
        currency: null,
        paymentType: UnifySubscriptionPlan.FREE,
        paymentStatus: null,
        productName: UnifySubscriptionProduct.PDF,
        amount: 0,
      },
      {
        id: null,
        quantity: 1,
        planRemoteId: null,
        period: null,
        currency: null,
        paymentType: UnifySubscriptionPlan.FREE,
        paymentStatus: null,
        productName: UnifySubscriptionProduct.SIGN,
        amount: 0,
      },
    ],
    remainingPlan: null,
  },
};

const createUnifyBillingSubscriptionSlice: StateCreator<UnifyBillingSubscriptionState, [], [['zustand/immer', never]]> =
  immer((set) => ({
    upcomingInvoice: null as GetUnifySubscriptionData['upcomingInvoice'],
    subscription: defaultSubscription,
    setSubscriptionData: (payload: GetUnifySubscriptionData['subscription']) => set({ subscription: payload }),
    setUnifyBillingSubscriptionData: ({ upcomingInvoice, subscription }: GetUnifySubscriptionData) =>
      set({ upcomingInvoice, subscription }),
    reset: () => set({ upcomingInvoice: null, subscription: null }),
  }));

export const useUnifyBillingSubscriptionStore = create<UnifyBillingSubscriptionState, [['zustand/immer', never]]>(
  logger(createUnifyBillingSubscriptionSlice, 'useUnifyBillingSubscriptionStore')
);
