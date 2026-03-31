import paymentService, {
  createFreeTrialSubcription,
  createFreeTrialUnifySubscription,
  cancelOrganizationFreeTrial,
} from '../paymentService';
import * as paymentGraph from 'services/graphServices/payment';
import { eventTracking } from 'utils/recordUtil';
import UserEventConstants from 'constants/eventConstants';
import { Plans } from 'constants/plan';

jest.mock('services/graphServices/payment');
jest.mock('utils/recordUtil');

describe('paymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFreeTrialSubcription', () => {
    it('should create free trial subscription successfully', async () => {
      const mockData = { subscriptionId: 'sub_123' };
      paymentGraph.createFreeTrialSubcription.mockResolvedValue({ data: mockData });

      const params = {
        orgId: 'org_123',
        issuedId: 'issued_123',
        issuer: 'user_123',
        period: 'MONTHLY',
        currency: 'USD',
        plan: 'PREMIUM',
        stripeAccountId: 'stripe_123',
        isBlockedPrepaidCardOnTrial: false,
      };

      const result = await createFreeTrialSubcription(params);

      expect(paymentGraph.createFreeTrialSubcription).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockData);
    });

    it('should handle error when creating free trial subscription', async () => {
      paymentGraph.createFreeTrialSubcription.mockRejectedValue(new Error('Create failed'));

      const params = {
        orgId: 'org_123',
        issuedId: 'issued_123',
        issuer: 'user_123',
        period: 'MONTHLY',
        currency: 'USD',
        plan: 'PREMIUM',
        stripeAccountId: 'stripe_123',
        isBlockedPrepaidCardOnTrial: false,
      };

      await expect(createFreeTrialSubcription(params)).rejects.toThrow('Create failed');
    });
  });

  describe('createFreeTrialUnifySubscription', () => {
    it('should create free trial unify subscription successfully', async () => {
      const mockData = { subscriptionId: 'sub_unify_123' };
      paymentGraph.createFreeTrialUnifySubscription.mockResolvedValue({ data: mockData });

      const params = {
        orgId: 'org_123',
        paymentMethod: 'pm_123',
        period: 'MONTHLY',
        currency: 'USD',
        stripeAccountId: 'stripe_123',
        isBlockedPrepaidCardOnTrial: false,
        subscriptionItems: [],
      };

      const result = await createFreeTrialUnifySubscription(params);

      expect(paymentGraph.createFreeTrialUnifySubscription).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockData);
    });
  });

  describe('getBillingEmail', () => {
    it('should get billing email', () => {
      const mockResult = { email: 'test@example.com' };
      paymentGraph.getBillingEmail.mockReturnValue(mockResult);

      const params = { clientId: 'client_123', type: 'ORGANIZATION' };
      const result = paymentService.getBillingEmail(params);

      expect(paymentGraph.getBillingEmail).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getRemainingPlan', () => {
    it('should get remaining plan with all parameters', () => {
      const mockResult = { remaining: 100 };
      paymentGraph.getRemainingPlan.mockReturnValue(mockResult);

      const params = {
        plan: 'PREMIUM',
        period: 'MONTHLY',
        currency: 'USD',
        type: 'ORGANIZATION',
        clientId: 'client_123',
        quantity: 5,
        couponCode: 'COUPON123',
        fetchOptions: {},
      };

      const result = paymentService.getRemainingPlan(params);

      expect(paymentGraph.getRemainingPlan).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('subscription', () => {
    it('should get subscription', () => {
      const mockResult = { subscription: {} };
      paymentGraph.subscription.mockReturnValue(mockResult);

      const params = { clientId: 'client_123', type: 'ORGANIZATION' };
      const result = paymentService.subscription(params);

      expect(paymentGraph.subscription).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('canOrganizationUpgrade', () => {
    it('should return true when upgrading period', () => {
      const currentPayment = { period: 'MONTHLY', quantity: 5 };
      const nextPayment = { period: 'ANNUAL', quantity: 5 };

      const result = paymentService.canOrganizationUpgrade(currentPayment, nextPayment);

      expect(result).toBe(true);
    });

    it('should return true when same period but increasing quantity', () => {
      const currentPayment = { period: 'MONTHLY', quantity: 5 };
      const nextPayment = { period: 'MONTHLY', quantity: 10 };

      const result = paymentService.canOrganizationUpgrade(currentPayment, nextPayment);

      expect(result).toBe(true);
    });

    it('should return false when same period and same quantity', () => {
      const currentPayment = { period: 'MONTHLY', quantity: 5 };
      const nextPayment = { period: 'MONTHLY', quantity: 5 };

      const result = paymentService.canOrganizationUpgrade(currentPayment, nextPayment);

      expect(result).toBe(false);
    });

    it('should return false when downgrading period', () => {
      const currentPayment = { period: 'ANNUAL', quantity: 5 };
      const nextPayment = { period: 'MONTHLY', quantity: 5 };

      const result = paymentService.canOrganizationUpgrade(currentPayment, nextPayment);

      expect(result).toBe(false);
    });

    it('should have curentPeriod = 0 & nextPeriod = 0', () => {
      const currentPayment = { period: undefined, quantity: 5 };
      const nextPayment = { period: undefined, quantity: 5 };

      const result = paymentService.canOrganizationUpgrade(currentPayment, nextPayment);

      expect(result).toBe(false);
    });
  });

  describe('canUserUpgrade', () => {
    it('should return true when current plan is FREE', () => {
      const currentPayment = { type: Plans.FREE, period: 'MONTHLY' };
      const nextPayment = { plan: 'PREMIUM', period: 'MONTHLY' };

      const result = paymentService.canUserUpgrade(currentPayment, nextPayment);

      expect(result).toBe(true);
    });

    it('should return false when downgrading plan', () => {
      const currentPayment = { type: 'PROFESSIONAL', period: 'MONTHLY' };
      const nextPayment = { plan: 'PERSONAL', period: 'MONTHLY' };

      const result = paymentService.canUserUpgrade(currentPayment, nextPayment);

      expect(result).toBe(false);
    });

    it('should return false when downgrading period', () => {
      const currentPayment = { type: 'PREMIUM', period: 'ANNUAL' };
      const nextPayment = { plan: 'PREMIUM', period: 'MONTHLY' };

      const result = paymentService.canUserUpgrade(currentPayment, nextPayment);

      expect(result).toBe(false);
    });

    it('should return false when same period and same plan', () => {
      const currentPayment = { type: 'PREMIUM', period: 'MONTHLY' };
      const nextPayment = { plan: 'PREMIUM', period: 'MONTHLY' };

      const result = paymentService.canUserUpgrade(currentPayment, nextPayment);

      expect(result).toBe(false);
    });

    it('should return true when upgrading plan with same period', () => {
      const currentPayment = { type: 'PERSONAL', period: 'MONTHLY' };
      const nextPayment = { plan: 'PROFESSIONAL', period: 'MONTHLY' };

      const result = paymentService.canUserUpgrade(currentPayment, nextPayment);

      expect(result).toBe(true);
    });

    it('should return true when upgrading period with same plan', () => {
      const currentPayment = { type: 'PREMIUM', period: 'MONTHLY' };
      const nextPayment = { plan: 'PREMIUM', period: 'ANNUAL' };

      const result = paymentService.canUserUpgrade(currentPayment, nextPayment);

      expect(result).toBe(true);
    });
  });

  describe('getCard', () => {
    it('should get card info', () => {
      const mockResult = { card: {} };
      paymentGraph.getCard.mockReturnValue(mockResult);

      const params = { type: 'ORGANIZATION', clientId: 'client_123', fetchOptions: {} };
      const result = paymentService.getCard(params);

      expect(paymentGraph.getCard).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription', () => {
      const mockResult = { success: true };
      paymentGraph.cancelSubscription.mockReturnValue(mockResult);

      const params = { clientId: 'client_123', type: 'ORGANIZATION' };
      const result = paymentService.cancelSubscription(params);

      expect(paymentGraph.cancelSubscription).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate subscription and track event', async () => {
      const mockResult = {
        data: {
          planRemoteId: 'plan_123',
          type: 'PREMIUM',
        },
      };
      paymentGraph.reactivateSubscription.mockResolvedValue(mockResult);

      const result = await paymentService.reactivateSubscription();

      expect(paymentGraph.reactivateSubscription).toHaveBeenCalled();
      expect(eventTracking).toHaveBeenCalledWith(UserEventConstants.EventType.USER_REACTIVATED_PAID, {
        stripePlanOrPriceId: 'plan_123',
        planName: 'PREMIUM',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('applyCouponCode', () => {
    it('should apply coupon code', () => {
      const mockResult = { discount: 20 };
      paymentGraph.applyCouponCode.mockReturnValue(mockResult);

      const params = {
        period: 'MONTHLY',
        currency: 'USD',
        plan: 'PREMIUM',
        couponCode: 'SAVE20',
        orgId: 'org_123',
        stripeAccountId: 'stripe_123',
      };

      const result = paymentService.applyCouponCode(params);

      expect(paymentGraph.applyCouponCode).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getBillingWarning', () => {
    it('should get billing warning', () => {
      const mockResult = { warning: 'Payment failed' };
      paymentGraph.getBillingWarning.mockReturnValue(mockResult);

      const result = paymentService.getBillingWarning('client_123', 'ORGANIZATION');

      expect(paymentGraph.getBillingWarning).toHaveBeenCalledWith('client_123', 'ORGANIZATION');
      expect(result).toEqual(mockResult);
    });
  });

  describe('changeCardInfo', () => {
    it('should change card info', () => {
      const mockResult = { success: true };
      paymentGraph.changeCardInfo.mockReturnValue(mockResult);

      const params = {
        clientId: 'client_123',
        paymentMethodId: 'pm_123',
        email: 'test@example.com',
        type: 'ORGANIZATION',
      };

      const result = paymentService.changeCardInfo(params);

      expect(paymentGraph.changeCardInfo).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('closeBillingWarningBanner', () => {
    it('should close billing warning banner', () => {
      const mockResult = { success: true };
      paymentGraph.closeBillingWarningBanner.mockReturnValue(mockResult);

      const result = paymentService.closeBillingWarningBanner('client_123', 'PAYMENT_FAILED');

      expect(paymentGraph.closeBillingWarningBanner).toHaveBeenCalledWith('client_123', 'PAYMENT_FAILED');
      expect(result).toEqual(mockResult);
    });
  });

  describe('retryFailedSubscription', () => {
    it('should retry failed subscription', () => {
      const mockResult = { success: true };
      paymentGraph.retryFailedSubscription.mockReturnValue(mockResult);

      const result = paymentService.retryFailedSubscription('client_123');

      expect(paymentGraph.retryFailedSubscription).toHaveBeenCalledWith('client_123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getNextPaymentInfo', () => {
    it('should get next payment info', () => {
      const mockResult = { nextPayment: {} };
      paymentGraph.getNextPaymentInfo.mockReturnValue(mockResult);

      const params = {
        plan: 'PREMIUM',
        period: 'MONTHLY',
        currency: 'USD',
        stripeAccountId: 'stripe_123',
        orgId: 'org_123',
      };

      const result = paymentService.getNextPaymentInfo(params);

      expect(paymentGraph.getNextPaymentInfo).toHaveBeenCalledWith({
        plan: 'PREMIUM',
        period: 'MONTHLY',
        currency: 'USD',
        stripeAccountId: 'stripe_123',
        clientId: 'org_123',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('retrieveSetupIntent', () => {
    it('should retrieve setup intent', () => {
      const mockResult = { clientSecret: 'secret_123' };
      paymentGraph.retrieveSetupIntent.mockReturnValue(mockResult);

      const params = {
        reCaptchaTokenV3: 'token_123',
      };

      const result = paymentService.retrieveSetupIntent(params);

      expect(paymentGraph.retrieveSetupIntent).toHaveBeenCalledWith({ reCaptchaTokenV3: 'token_123' });
      expect(result).toEqual(mockResult);
    });
  });

  describe('retrieveOrganizationSetupIntent', () => {
    it('should retrieve organization setup intent', () => {
      const mockResult = { clientSecret: 'secret_org_123' };
      paymentGraph.retrieveOrganizationSetupIntent.mockReturnValue(mockResult);

      const params = {
        orgId: 'org_123',
        type: 'ORGANIZATION',
        reCaptchaTokenV3: 'token_123',
      };

      const result = paymentService.retrieveOrganizationSetupIntent(params);

      expect(paymentGraph.retrieveOrganizationSetupIntent).toHaveBeenCalledWith({
        orgId: 'org_123',
        type: 'ORGANIZATION',
        reCaptchaTokenV3: 'token_123',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('deactivateSetupIntent', () => {
    it('should deactivate setup intent', () => {
      const mockResult = { success: true };
      paymentGraph.deactivateSetupIntent.mockReturnValue(mockResult);

      const result = paymentService.deactivateSetupIntent('stripe_123');

      expect(paymentGraph.deactivateSetupIntent).toHaveBeenCalledWith('stripe_123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('deactivateOrganizationSetupIntent', () => {
    it('should deactivate organization setup intent', () => {
      const mockResult = { success: true };
      paymentGraph.deactivateOrganizationSetupIntent.mockReturnValue(mockResult);

      const params = { orgId: 'org_123', stripeAccountId: 'stripe_123' };
      const result = paymentService.deactivateOrganizationSetupIntent(params);

      expect(paymentGraph.deactivateOrganizationSetupIntent).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getBillingCycleOfPlan', () => {
    it('should get billing cycle of plan', () => {
      const mockResult = { nextBillingDate: '2024-01-01' };
      paymentGraph.getBillingCycleOfPlan.mockReturnValue(mockResult);

      const params = {
        plan: 'PREMIUM',
        period: 'MONTHLY',
        currency: 'USD',
        quantity: 5,
        couponCode: 'SAVE20',
        stripeAccountId: 'stripe_123',
      };

      const result = paymentService.getBillingCycleOfPlan(params);

      expect(paymentGraph.getBillingCycleOfPlan).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('cancelOrganizationFreeTrial', () => {
    it('should cancel organization free trial', async () => {
      const mockResult = { success: true };
      paymentGraph.cancelOrganizationFreeTrial.mockResolvedValue(mockResult);

      const result = await cancelOrganizationFreeTrial('org_123');

      expect(paymentGraph.cancelOrganizationFreeTrial).toHaveBeenCalledWith('org_123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('retrieveBillingInfo', () => {
    it('should retrieve billing info', async () => {
      const mockResult = { billingInfo: {} };
      paymentGraph.retrieveBillingInfo.mockResolvedValue(mockResult);

      const result = await paymentService.retrieveBillingInfo('client_123', 'ORGANIZATION');

      expect(paymentGraph.retrieveBillingInfo).toHaveBeenCalledWith('client_123', 'ORGANIZATION');
      expect(result).toEqual(mockResult);
    });
  });

  describe('previewUpcomingDocStackInvoice', () => {
    it('should preview upcoming doc stack invoice', () => {
      const mockResult = { invoice: {} };
      paymentGraph.previewUpcomingDocStackInvoice.mockReturnValue(mockResult);

      const params = {
        orgId: 'org_123',
        plan: 'PREMIUM',
        period: 'MONTHLY',
        currency: 'USD',
        couponCode: 'SAVE20',
        startTrial: false,
        stripeAccountId: 'stripe_123',
        fetchOptions: {},
      };

      const result = paymentService.previewUpcomingDocStackInvoice(params);

      expect(paymentGraph.previewUpcomingDocStackInvoice).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('previewUpcomingSubscriptionInvoice', () => {
    it('should preview upcoming subscription invoice', () => {
      const mockResult = { invoice: {} };
      paymentGraph.previewUpcomingSubscriptionInvoice.mockReturnValue(mockResult);

      const params = {
        orgId: 'org_123',
        period: 'MONTHLY',
        currency: 'USD',
        couponCode: 'SAVE20',
        startTrial: false,
        stripeAccountId: 'stripe_123',
        subscriptionItems: [],
        fetchOptions: {},
      };

      const result = paymentService.previewUpcomingSubscriptionInvoice(params);

      expect(paymentGraph.previewUpcomingSubscriptionInvoice).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('removePersonalPaymentMethod', () => {
    it('should remove personal payment method', () => {
      const mockResult = { success: true };
      paymentGraph.removePersonalPaymentMethod.mockReturnValue(mockResult);

      const result = paymentService.removePersonalPaymentMethod();

      expect(paymentGraph.removePersonalPaymentMethod).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeOrganizationPaymentMethod', () => {
    it('should remove organization payment method', () => {
      const mockResult = { success: true };
      paymentGraph.removeOrganizationPaymentMethod.mockReturnValue(mockResult);

      const result = paymentService.removeOrganizationPaymentMethod('org_123');

      expect(paymentGraph.removeOrganizationPaymentMethod).toHaveBeenCalledWith('org_123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getPaymentMethodAndCustomerInfo', () => {
    it('should get payment method and customer info', async () => {
      const mockPaymentMethod = { card: {} };
      const mockCustomerInfo = { customer: {} };
      paymentGraph.getPaymentMethod.mockResolvedValue(mockPaymentMethod);
      paymentGraph.getCustomerInfo.mockResolvedValue(mockCustomerInfo);

      const params = { type: 'ORGANIZATION', clientId: 'client_123', fetchOptions: {} };
      const result = await paymentService.getPaymentMethodAndCustomerInfo(params);

      expect(paymentGraph.getPaymentMethod).toHaveBeenCalledWith({
        clientId: 'client_123',
        fetchOptions: {},
      });
      expect(paymentGraph.getCustomerInfo).toHaveBeenCalledWith(params);
      expect(result).toEqual([mockPaymentMethod, mockCustomerInfo]);
    });
  });

  describe('updatePaymentMethod', () => {
    it('should update payment method', () => {
      const mockResult = { success: true };
      paymentGraph.updatePaymentMethod.mockReturnValue(mockResult);

      const params = {
        clientId: 'client_123',
        paymentMethodId: 'pm_123',
        email: 'test@example.com',
        type: 'ORGANIZATION',
      };

      const result = paymentService.updatePaymentMethod(params);

      expect(paymentGraph.updatePaymentMethod).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUnifySubscription', () => {
    it('should get unify subscription', () => {
      const mockResult = { subscription: {} };
      paymentGraph.getUnifySubscription.mockReturnValue(mockResult);

      const params = { clientId: 'client_123', type: 'ORGANIZATION' };
      const result = paymentService.getUnifySubscription(params);

      expect(paymentGraph.getUnifySubscription).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('cancelUnifySubscription', () => {
    it('should cancel unify subscription', () => {
      const mockResult = { success: true };
      paymentGraph.cancelUnifySubscription.mockReturnValue(mockResult);

      const params = {
        clientId: 'client_123',
        type: 'ORGANIZATION',
        subscriptionItems: [],
      };

      const result = paymentService.cancelUnifySubscription(params);

      expect(paymentGraph.cancelUnifySubscription).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });
});
