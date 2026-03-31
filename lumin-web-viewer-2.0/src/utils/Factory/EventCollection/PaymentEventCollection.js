import { isNil, merge, omitBy } from 'lodash';

import { getCommonAttributes } from 'utils/getCommonAttributes';

import { VARIATION_NAME } from 'features/CNC/constants/events/variation';

import { AWS_EVENTS } from 'constants/awsEvents';
import { GA_EVENTS } from 'constants/gaEvents';

import { EventCollection } from './EventCollection';
import GaAdapter from '../GaAdapter';

export const EVENT_FIELD_ACTION = {
  TOUCHED: 'touched',
  COMPLETED: 'completed',
  CHANGED: 'changed',
};

export const EVENT_FIELD_NAME = {
  CIRCLE_DROPDOWN: 'circle_dropdown',
  STRIPE_FORM: 'stripe_form',
  CURRENCY_DROPDOWN: 'currency_dropdown',
};

export class PaymentEventCollection extends EventCollection {
  constructor(variationName) {
    super();
    this.variationName = variationName;
  }

  userFillPaymentForm({
    fieldName,
    url,
    freeTrialDays,
    action,
    formStripePlanOrPriceId,
    formStripeProductId,
    organizationId,
  }) {
    return this.record({
      name: AWS_EVENTS.PAYMENT.USER_FILL_PAYMENT_FORM,
      attributes: {
        fieldName,
        action,
        url,
        formStripePlanOrPriceId,
        formStripeProductId,
        freeTrialLengthDays: freeTrialDays,
        organizationId,
        variationName: this.variationName,
      },
    });
  }

  preinspectCardInfo({
    freeTrialDays,
    StripeCustomerId,
    organizationId,
    chargeType,
    cardBrand,
    cardCountry,
    cardExpMonth,
    cardExpYear,
    cardFunding,
    cardLast4,
  }) {
    return this.record({
      name: AWS_EVENTS.PAYMENT.PREINSPECT_CARD_INFO,
      attributes: {
        freeTrialDays,
        StripeCustomerId,
        organizationId,
        chargeType,
        cardBrand,
        cardCountry,
        cardExpMonth,
        cardExpYear,
        cardFunding,
        cardLast4,
        variationName: this.variationName,
      },
    });
  }

  paymentError({
    url,
    formStripePlanOrPriceId,
    formStripeProductId,
    freeTrialDays,
    StripeCustomerId,
    errorMessage,
    organizationId,
    cardBrand,
    cardCountry,
    cardExpMonth,
    cardExpYear,
    cardFunding,
    cardLast4,
  }) {
    return this.record({
      name: AWS_EVENTS.PAYMENT.ERROR,
      attributes: {
        url,
        formStripePlanOrPriceId,
        formStripeProductId,
        freeTrialLengthDays: freeTrialDays,
        StripeCustomerId: StripeCustomerId || '',
        errorMessage,
        organizationId,
        cardBrand,
        cardCountry,
        cardExpMonth,
        cardExpYear,
        cardFunding,
        cardLast4,
        variationName: this.variationName,
      },
    });
  }

  async paymentSuccess({
    url,
    formStripePlanOrPriceId,
    formStripeProductId,
    freeTrialDays,
    StripeCustomerId,
    value,
    currency,
    organizationId,
    subscriptionRemoteId,
    planRemoteId,
    cardBrand,
    cardCountry,
    cardExpMonth,
    cardExpYear,
    cardFunding,
    cardLast4,
  }) {
    const attributes = {
      url,
      formStripePlanOrPriceId,
      formStripeProductId,
      freeTrialLengthDays: freeTrialDays,
      StripeCustomerId: StripeCustomerId || '',
      StripeSubscriptionId: subscriptionRemoteId || '',
      StripePlanId: planRemoteId || '',
      value,
      currency,
      organizationId,
      cardBrand,
      cardCountry,
      cardExpMonth,
      cardExpYear,
      cardFunding,
      cardLast4,
      variationName: this.variationName,
    };
    const params = {
      name: freeTrialDays ? GA_EVENTS.PAYMENT.START_FREE_TRIAL : GA_EVENTS.PAYMENT.START_OFFICIAL_SUBSCRIPTION,
      attributes,
      forwardFromPinpoint: false,
    };
    const mergedParams = omitBy(merge({}, { attributes: await getCommonAttributes(params.attributes) }, params), isNil);
    GaAdapter.send(mergedParams);
    return this.record({
      name: AWS_EVENTS.PAYMENT.PAYMENT_SUCCESS,
      attributes,
    });
  }

  userSubmitPaymentForm({
    url,
    formStripePlanOrPriceId,
    formStripeProductId,
    freeTrialDays,
    StripeCustomerId,
    organizationId,
  }) {
    return this.record({
      name: AWS_EVENTS.PAYMENT.USER_SUBMIT_PAYMENT_FORM,
      attributes: {
        url,
        formStripePlanOrPriceId,
        formStripeProductId,
        freeTrialLengthDays: freeTrialDays,
        organizationId,
        StripeCustomerId: StripeCustomerId || '',
        variationName: this.variationName,
      },
    });
  }

  subscriptionCanceled({ subscriptionId, reason }) {
    return this.record({
      name: AWS_EVENTS.PAYMENT.SUBSCRIPTION_CANCELED,
      attributes: {
        subscriptionId,
        reason,
        variationName: this.variationName,
      },
    });
  }
}

export default new PaymentEventCollection();

export const billingModalEvent = new PaymentEventCollection(VARIATION_NAME.CHECKOUT_ON_VIEWER_WEB_POP_OVER);
export const checkOutModalEvent = new PaymentEventCollection(
  VARIATION_NAME.CHECKOUT_ON_VIEWER_CNC_MODAL_LEFT_HAND_SIDE
);
