import {
  CREATE_FREE_TRIAL_SUBCRIPTION,
  GET_BILLING_EMAIL,
  GET_REMAINING_PLAN,
  SUBSCRIPTION,
  CARD,
  CANCEL_SUBSCRIPTION,
  REACTIVE_SUBSCRIPTION,
  GET_COUPON_VALUE,
  GET_BILLING_WARNING,
  CHANGE_CARD_INFO,
  CLOSE_BILLING_WARNING_BANNER,
  RETRY_SUBSCRIPTION_IMMEDIATELY,
  GET_NEXT_PAYMENT_INFO,
  RETRIEVE_SETUP_INTENT,
  DEACTIVATE_SETUP_INTENT,
  GET_BILLING_CYCLE_OF_PLAN,
  CANCEL_ORGANIZATION_FREE_TRIAL,
  RETRIEVE_BILLING_INFO,
  PREVIEW_UPCOMING_DOC_STACK_INVOICE,
  REMOVE_PERSONAL_PAYMENT_METHOD,
  REMOVE_ORGANIZATION_PAYMENT_METHOD,
  RETRIEVE_ORGANIZATION_SETUP_INTENT,
  DEACTIVATE_ORGANIZATION_SETUP_INTENT,
  GET_CUSTOMER_INFO,
  GET_PAYMENT_METHOD,
  UPDATE_PAYMENT_METHOD,
  PREVIEW_UPCOMING_SUBSCRIPTION_INVOICE,
  CREATE_FREE_TRIAL_UNIFY_SUBSCRIPTION,
  GET_UNIFY_SUBSCRIPTION,
  CANCEL_UNIFY_SUBSCRIPTION,
} from 'graphQL/PaymentGraph';

import { FETCH_POLICY } from 'constants/graphConstant';

import { client } from '../../apollo';

export async function createFreeTrialSubcription({
  issuedId,
  issuer,
  period,
  currency,
  plan,
  orgId,
  stripeAccountId,
  isBlockedPrepaidCardOnTrial,
}) {
  const res = await client.mutate({
    mutation: CREATE_FREE_TRIAL_SUBCRIPTION,
    variables: {
      input: {
        issuedId,
        issuer,
        period,
        currency,
        plan,
        orgId,
        stripeAccountId,
        isBlockedPrepaidCardOnTrial,
      },
    },
  });
  return res.data.createFreeTrialSubscription;
}

export async function createFreeTrialUnifySubscription({
  paymentMethod,
  period,
  currency,
  orgId,
  stripeAccountId,
  isBlockedPrepaidCardOnTrial,
  subscriptionItems,
}) {
  const res = await client.mutate({
    mutation: CREATE_FREE_TRIAL_UNIFY_SUBSCRIPTION,
    variables: {
      input: {
        paymentMethod,
        period,
        currency,
        orgId,
        stripeAccountId,
        isBlockedPrepaidCardOnTrial,
        subscriptionItems,
      },
    },
  });
  return res.data.createFreeTrialUnifySubscription;
}

export async function getBillingEmail({ clientId, type }) {
  const res = await client.query({
    query: GET_BILLING_EMAIL,
    variables: {
      input: {
        clientId,
        type,
      },
    },
    fetchPolicy: 'no-cache',
  });
  return res.data.getBillingEmail;
}

export async function getRemainingPlan({ plan, period, currency, type = 'ORGANIZATION', clientId, quantity, couponCode, fetchOptions }) {
  const res = await client.query({
    query: GET_REMAINING_PLAN,
    variables: {
      input: {
        clientId,
        plan,
        period,
        currency,
        type,
        quantity,
        couponCode,
      },
    },
    fetchPolicy: 'no-cache',
    context: {
      fetchOptions,
    },
  });
  return res.data.getRemainingPlan;
}

export async function subscription({ clientId, type }) {
  const res = await client.query({
    query: SUBSCRIPTION,
    variables: {
      input: {
        clientId,
        type,
      },
    },
  });
  return res.data.subscription;
}

export async function getCard({ type, clientId, fetchOptions }) {
  const res = await client.query({
    query: CARD,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      input: {
        type,
        clientId,
      },
    },
    context: {
      fetchOptions,
    },
  });
  return res.data;
}

export async function cancelSubscription({ type, clientId }) {
  const res = await client.mutate({
    mutation: CANCEL_SUBSCRIPTION,
    variables: {
      input: {
        type,
        clientId,
      },
    },
  });
  return res.data.cancelSubscription;
}

export async function reactivateSubscription() {
  const res = await client.mutate({
    mutation: REACTIVE_SUBSCRIPTION,
  });
  return res.data.reactiveSubscription;
}

export async function applyCouponCode({ period, currency, plan, couponCode, orgId, stripeAccountId }) {
  const res = await client.query({
    query: GET_COUPON_VALUE,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      input: {
        couponCode,
        period,
        plan,
        currency,
        orgId,
        stripeAccountId,
      },
    },
  });
  return res.data;
}

export async function getBillingWarning(clientId) {
  const res = await client.query({
    query: GET_BILLING_WARNING,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      clientId,
    },
  });

  return res.data.getBillingWarning;
}

export async function changeCardInfo({ clientId, paymentMethodId, email, type }) {
  const res = await client.mutate({
    mutation: CHANGE_CARD_INFO,
    variables: {
      input: {
        clientId,
        paymentMethodId,
        email,
        type,
      },
    },
  });

  return res.data.changeCardInfo;
}

export async function closeBillingWarningBanner(clientId, bannerType) {
  const { data } = await client.mutate({
    mutation: CLOSE_BILLING_WARNING_BANNER,
    variables: {
      clientId,
      bannerType,
    },
  });

  return data.closeBillingBanner;
}

export async function retryFailedSubscription(clientId) {
  const { data } = await client.mutate({
    mutation: RETRY_SUBSCRIPTION_IMMEDIATELY,
    variables: {
      clientId,
    },
  });
  return data.retryFailedSubscription;
}

export async function getNextPaymentInfo({ plan, period, currency, stripeAccountId, clientId }) {
  const { data } = await client.query({
    query: GET_NEXT_PAYMENT_INFO,
    variables: {
      input: {
        plan,
        period,
        currency,
        stripeAccountId,
        clientId,
      },
    },
  });
  return data.getNextPaymentInfo;
}

export async function retrieveSetupIntent({ reCaptchaTokenV3, reCaptchaAction }) {
  const { data } = await client.mutate({
    mutation: RETRIEVE_SETUP_INTENT,
    variables: {
      input: {
        reCaptchaTokenV3,
        reCaptchaAction,
      },
    },
  });
  return data.retrieveSetupIntentV3;
}

export async function retrieveOrganizationSetupIntent({ orgId, type, reCaptchaTokenV3, reCaptchaAction }) {
  const { data } = await client.mutate({
    mutation: RETRIEVE_ORGANIZATION_SETUP_INTENT,
    variables: {
      input: {
        orgId,
        type,
        reCaptchaTokenV3,
        reCaptchaAction,
      }
    },
  });
  return data.retrieveOrganizationSetupIntentV2;
}

export async function deactivateSetupIntent({ stripeAccountId }) {
  const { data } = await client.mutate({
    mutation: DEACTIVATE_SETUP_INTENT,
    variables: { stripeAccountId },
  });

  return data.deactivateSetupIntent;
}

export async function deactivateOrganizationSetupIntent({ orgId, stripeAccountId }) {
  const { data } = await client.mutate({
    mutation: DEACTIVATE_ORGANIZATION_SETUP_INTENT,
    variables: {
      orgId,
      stripeAccountId,
    },
  });
  return data.deactivateOrganizationSetupIntent;
}

export async function getBillingCycleOfPlan({ plan, period, currency, quantity, couponCode, stripeAccountId }) {
  const { data } = await client.query({
    query: GET_BILLING_CYCLE_OF_PLAN,
    variables: {
      input: {
        plan,
        period,
        currency,
        quantity,
        couponCode,
        stripeAccountId,
      },
    },
  });
  return data.getBillingCycleOfPlan;
}

export async function cancelOrganizationFreeTrial(orgId) {
  const res = await client.mutate({
    mutation: CANCEL_ORGANIZATION_FREE_TRIAL,
    variables: {
      orgId,
    },
  });
  return res.data.cancelOrganizationFreeTrial;
}

export async function retrieveBillingInfo(clientId, type) {
  const { data } = await client.query({
    query: RETRIEVE_BILLING_INFO,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      input: {
        clientId,
        type,
      },
    },
  });
  return {
    subscription: data.subscription,
    upcomingInvoice: data.upcomingInvoice,
    payment: data.payment,
  };
}

export async function previewUpcomingDocStackInvoice({
  orgId,
  plan,
  period,
  currency,
  couponCode,
  startTrial,
  stripeAccountId,
  fetchOptions,
}) {
  const { data } = await client.query({
    query: PREVIEW_UPCOMING_DOC_STACK_INVOICE,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      input: {
        orgId,
        plan,
        period,
        currency,
        couponCode,
        startTrial,
        stripeAccountId,
      },
    },
    context: {
      fetchOptions,
    },
  });
  return data.previewUpcomingDocStackInvoice;
}

export async function previewUpcomingSubscriptionInvoice({
  orgId,
  period,
  currency,
  couponCode,
  startTrial,
  stripeAccountId,
  subscriptionItems,
  fetchOptions,
}) {
  const { data } = await client.query({
    query: PREVIEW_UPCOMING_SUBSCRIPTION_INVOICE,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      input: {
        orgId,
        period,
        currency,
        couponCode,
        startTrial,
        stripeAccountId,
        subscriptionItems,
      },
    },
    context: {
      fetchOptions,
    },
  });
  return data.previewUpcomingSubscriptionInvoice;
}

export async function removePersonalPaymentMethod() {
  const res = await client.mutate({
    mutation: REMOVE_PERSONAL_PAYMENT_METHOD,
  });
  return res.data.removePersonalPaymentMethod;
}

export async function removeOrganizationPaymentMethod(orgId) {
  const res = await client.mutate({
    mutation: REMOVE_ORGANIZATION_PAYMENT_METHOD,
    variables: {
      orgId,
    },
  });
  return res.data.removeOrganizationPaymentMethod;
}

export async function getPaymentMethod({ clientId, fetchOptions }) {
  const res = await client.query({
    query: GET_PAYMENT_METHOD,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      clientId,
    },
    context: {
      fetchOptions,
    },
  });
  return res.data.getPaymentMethod;
}

export async function getCustomerInfo({ type, clientId, fetchOptions }) {
  const res = await client.query({
    query: GET_CUSTOMER_INFO,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      input: {
        type,
        clientId,
      },
    },
    context: {
      fetchOptions,
    },
  });
  return res.data.customerInfo;
}

export async function updatePaymentMethod({ clientId, paymentMethodId, email, type }) {
  const res = await client.mutate({
    mutation: UPDATE_PAYMENT_METHOD,
    variables: {
      input: {
        clientId,
        paymentMethodId,
        email,
        type,
      },
    },
  });

  return res.data.updatePaymentMethod;
}

export async function getUnifySubscription({ clientId, type }) {
  const res = await client.query({
    query: GET_UNIFY_SUBSCRIPTION,
    variables: {
      input: {
        clientId,
        type,
      },
    },
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getUnifySubscription;
}

export async function cancelUnifySubscription({ clientId, type, subscriptionItems }) {
  const res = await client.mutate({
    mutation: CANCEL_UNIFY_SUBSCRIPTION,
    variables: { input: { clientId, type, subscriptionItems } },
  });
  return res.data.cancelUnifySubscription;
}

export default {
  createFreeTrialSubcription,
  getBillingEmail,
  subscription,
  getCard,
  cancelSubscription,
  reactivateSubscription,
  changeCardInfo,
  getNextPaymentInfo,
  retrieveSetupIntent,
  deactivateSetupIntent,
  getBillingCycleOfPlan,
  retrieveBillingInfo,
  removePersonalPaymentMethod,
  removeOrganizationPaymentMethod,
  getPaymentMethod,
  getCustomerInfo,
  updatePaymentMethod,
  cancelUnifySubscription,
};
