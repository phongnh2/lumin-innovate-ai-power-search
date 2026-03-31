import { AWS_EVENTS } from 'constants/awsEvents';
import { GA_EVENTS } from 'constants/gaEvents';
import { VARIATION_NAME } from 'features/CNC/constants/events/variation';

jest.mock('utils/getCommonAttributes', () => ({
  getCommonAttributes: jest.fn((attrs) => Promise.resolve(attrs)),
}));

jest.mock('../../GaAdapter', () => ({
  send: jest.fn(),
}));

jest.mock('../EventCollection', () => ({
  EventCollection: class {
    record = jest.fn();
  },
}));

import {
  PaymentEventCollection,
  EVENT_FIELD_ACTION,
  EVENT_FIELD_NAME,
  billingModalEvent,
  checkOutModalEvent,
} from '../PaymentEventCollection';
import GaAdapter from '../../GaAdapter';

describe('PaymentEventCollection', () => {
  let collection;
  const testVariation = 'test-variation';

  beforeEach(() => {
    collection = new PaymentEventCollection(testVariation);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should set variationName', () => {
      expect(collection.variationName).toBe(testVariation);
    });
  });

  describe('constants', () => {
    test('EVENT_FIELD_ACTION should have correct values', () => {
      expect(EVENT_FIELD_ACTION).toEqual({
        TOUCHED: 'touched',
        COMPLETED: 'completed',
        CHANGED: 'changed',
      });
    });

    test('EVENT_FIELD_NAME should have correct values', () => {
      expect(EVENT_FIELD_NAME).toEqual({
        CIRCLE_DROPDOWN: 'circle_dropdown',
        STRIPE_FORM: 'stripe_form',
        CURRENCY_DROPDOWN: 'currency_dropdown',
      });
    });
  });

  describe('userFillPaymentForm', () => {
    test('should record with correct attributes', () => {
      const params = {
        fieldName: 'cardNumber',
        url: 'https://example.com',
        freeTrialDays: 14,
        action: 'completed',
        formStripePlanOrPriceId: 'price_123',
        formStripeProductId: 'prod_123',
        organizationId: 'org-123',
      };

      collection.userFillPaymentForm(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.PAYMENT.USER_FILL_PAYMENT_FORM,
        attributes: {
          fieldName: params.fieldName,
          action: params.action,
          url: params.url,
          formStripePlanOrPriceId: params.formStripePlanOrPriceId,
          formStripeProductId: params.formStripeProductId,
          freeTrialLengthDays: params.freeTrialDays,
          organizationId: params.organizationId,
          variationName: testVariation,
        },
      });
    });
  });

  describe('preinspectCardInfo', () => {
    test('should record with card info attributes', () => {
      const params = {
        freeTrialDays: 7,
        StripeCustomerId: 'cus_123',
        organizationId: 'org-123',
        chargeType: 'subscription',
        cardBrand: 'visa',
        cardCountry: 'US',
        cardExpMonth: 12,
        cardExpYear: 2025,
        cardFunding: 'credit',
        cardLast4: '4242',
      };

      collection.preinspectCardInfo(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.PAYMENT.PREINSPECT_CARD_INFO,
        attributes: {
          ...params,
          variationName: testVariation,
        },
      });
    });
  });

  describe('paymentError', () => {
    test('should record error with all attributes', () => {
      const params = {
        url: 'https://example.com',
        formStripePlanOrPriceId: 'price_123',
        formStripeProductId: 'prod_123',
        freeTrialDays: 14,
        StripeCustomerId: 'cus_123',
        errorMessage: 'Card declined',
        organizationId: 'org-123',
        cardBrand: 'visa',
        cardCountry: 'US',
        cardExpMonth: 12,
        cardExpYear: 2025,
        cardFunding: 'credit',
        cardLast4: '4242',
      };

      collection.paymentError(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.PAYMENT.ERROR,
        attributes: {
          url: params.url,
          formStripePlanOrPriceId: params.formStripePlanOrPriceId,
          formStripeProductId: params.formStripeProductId,
          freeTrialLengthDays: params.freeTrialDays,
          StripeCustomerId: params.StripeCustomerId,
          errorMessage: params.errorMessage,
          organizationId: params.organizationId,
          cardBrand: params.cardBrand,
          cardCountry: params.cardCountry,
          cardExpMonth: params.cardExpMonth,
          cardExpYear: params.cardExpYear,
          cardFunding: params.cardFunding,
          cardLast4: params.cardLast4,
          variationName: testVariation,
        },
      });
    });

    test('should use empty string when StripeCustomerId is undefined', () => {
      const params = {
        url: 'https://example.com',
        formStripePlanOrPriceId: 'price_123',
        formStripeProductId: 'prod_123',
        freeTrialDays: 14,
        StripeCustomerId: undefined,
        errorMessage: 'Card declined',
        organizationId: 'org-123',
      };

      collection.paymentError(params);

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            StripeCustomerId: '',
          }),
        })
      );
    });
  });

  describe('paymentSuccess', () => {
    const baseParams = {
      url: 'https://example.com',
      formStripePlanOrPriceId: 'price_123',
      formStripeProductId: 'prod_123',
      freeTrialDays: 0,
      StripeCustomerId: 'cus_123',
      value: 100,
      currency: 'usd',
      organizationId: 'org-123',
      subscriptionRemoteId: 'sub_123',
      planRemoteId: 'plan_123',
      cardBrand: 'visa',
      cardCountry: 'US',
      cardExpMonth: 12,
      cardExpYear: 2025,
      cardFunding: 'credit',
      cardLast4: '4242',
    };

    test('should record success and send to GA for official subscription', async () => {
      await collection.paymentSuccess(baseParams);

      expect(GaAdapter.send).toHaveBeenCalledWith(
        expect.objectContaining({
          name: GA_EVENTS.PAYMENT.START_OFFICIAL_SUBSCRIPTION,
        })
      );

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.PAYMENT.PAYMENT_SUCCESS,
        attributes: expect.objectContaining({
          url: baseParams.url,
          value: baseParams.value,
          currency: baseParams.currency,
          variationName: testVariation,
        }),
      });
    });

    test('should use free trial GA event when freeTrialDays > 0', async () => {
      await collection.paymentSuccess({ ...baseParams, freeTrialDays: 14 });

      expect(GaAdapter.send).toHaveBeenCalledWith(
        expect.objectContaining({
          name: GA_EVENTS.PAYMENT.START_FREE_TRIAL,
        })
      );
    });

    test('should handle undefined StripeCustomerId, subscriptionRemoteId, planRemoteId', async () => {
      await collection.paymentSuccess({
        ...baseParams,
        StripeCustomerId: undefined,
        subscriptionRemoteId: undefined,
        planRemoteId: undefined,
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            StripeCustomerId: '',
            StripeSubscriptionId: '',
            StripePlanId: '',
          }),
        })
      );
    });
  });

  describe('userSubmitPaymentForm', () => {
    test('should record submit event', () => {
      const params = {
        url: 'https://example.com',
        formStripePlanOrPriceId: 'price_123',
        formStripeProductId: 'prod_123',
        freeTrialDays: 14,
        StripeCustomerId: 'cus_123',
        organizationId: 'org-123',
      };

      collection.userSubmitPaymentForm(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.PAYMENT.USER_SUBMIT_PAYMENT_FORM,
        attributes: {
          url: params.url,
          formStripePlanOrPriceId: params.formStripePlanOrPriceId,
          formStripeProductId: params.formStripeProductId,
          freeTrialLengthDays: params.freeTrialDays,
          organizationId: params.organizationId,
          StripeCustomerId: params.StripeCustomerId,
          variationName: testVariation,
        },
      });
    });

    test('should use empty string when StripeCustomerId is undefined', () => {
      collection.userSubmitPaymentForm({
        url: 'https://example.com',
        StripeCustomerId: undefined,
      });

      expect(collection.record).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            StripeCustomerId: '',
          }),
        })
      );
    });
  });

  describe('subscriptionCanceled', () => {
    test('should record cancellation event', () => {
      const params = {
        subscriptionId: 'sub_123',
        reason: 'too_expensive',
      };

      collection.subscriptionCanceled(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.PAYMENT.SUBSCRIPTION_CANCELED,
        attributes: {
          subscriptionId: params.subscriptionId,
          reason: params.reason,
          variationName: testVariation,
        },
      });
    });
  });

  describe('exported instances', () => {
    test('billingModalEvent should have correct variationName', () => {
      expect(billingModalEvent.variationName).toBe(VARIATION_NAME.CHECKOUT_ON_VIEWER_WEB_POP_OVER);
    });

    test('checkOutModalEvent should have correct variationName', () => {
      expect(checkOutModalEvent.variationName).toBe(VARIATION_NAME.CHECKOUT_ON_VIEWER_CNC_MODAL_LEFT_HAND_SIDE);
    });
  });
});
