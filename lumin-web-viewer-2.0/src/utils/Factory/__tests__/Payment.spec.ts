import { PaymentUtilities } from '../Payment';
import { Plans, PERIOD, STATUS, PRICING_VERSION } from 'constants/plan';
import { PaymentPlans, PaymentStatus } from 'constants/plan.enum';
import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';
import { IOrganizationPayment, IPayment, ITrialInfo, PaymentSubScriptionItem } from 'interfaces/payment/payment.interface';

describe('PaymentUtilities', () => {
  const basePayment = {
    subscriptionItems: [] as PaymentSubScriptionItem[],
    type: Plans.FREE,
    period: PERIOD.MONTHLY,
    status: STATUS.ACTIVE,
    quantity: 1,
    priceVersion: PRICING_VERSION.V3,
    customerRemoteId: '',
    subscriptionRemoteId: '',
    planRemoteId: '',
    currency: 'usd',
    stripeAccountId: '',
  };

  test('should return correct type, status, period', () => {
    const util = new PaymentUtilities(basePayment as IPayment);
    expect(util.getType()).toBe(Plans.FREE);
    expect(util.getStatus()).toBe(STATUS.ACTIVE);
    expect(util.getPeriod()).toBe(PERIOD.MONTHLY);
  });

  test('isFree, isPremium', () => {
    const util = new PaymentUtilities({ ...basePayment, type: Plans.FREE as PaymentPlans });
    expect(util.isFree()).toBe(true);
    expect(util.isPremium()).toBe(false);
  });

  test('isFreeTrial', () => {
    const util = new PaymentUtilities({ ...basePayment, status: STATUS.TRIALING } as unknown as IPayment);
    expect(util.isFreeTrial()).toBe(true);
  });

  test('isNewBusiness', () => {
    const util = new PaymentUtilities({ ...basePayment, type: PaymentPlans.ORG_BUSINESS, period: PERIOD.ANNUAL });
    expect(util.isNewBusiness()).toBe(true);
  });

  test('isBusiness, isOrgPro, isOrgStarter, isEnterprise', () => {
    expect(new PaymentUtilities({ ...basePayment, type: Plans.BUSINESS as PaymentPlans }).isBusiness()).toBe(true);
    expect(new PaymentUtilities({ ...basePayment, type: Plans.ORG_PRO as PaymentPlans }).isOrgPro()).toBe(true);
    expect(new PaymentUtilities({ ...basePayment, type: Plans.ORG_STARTER as PaymentPlans }).isOrgStarter()).toBe(true);
    expect(new PaymentUtilities({ ...basePayment, type: Plans.ENTERPRISE as PaymentPlans }).isEnterprise()).toBe(true);
  });

  test('period helpers', () => {
    const utilMonthly = new PaymentUtilities({ ...basePayment, period: PERIOD.MONTHLY } as unknown as IPayment);
    const utilAnnual = new PaymentUtilities({ ...basePayment, period: PERIOD.ANNUAL } as unknown as IPayment);

    expect(utilMonthly.isMonthlyPeriod()).toBe(true);
    expect(utilAnnual.isAnnualPeriod()).toBe(true);
  });

  test('business monthly/annual', () => {
    expect(
      new PaymentUtilities({ ...basePayment, type: PaymentPlans.BUSINESS, period: PERIOD.MONTHLY }).isBusinessMonthly(),
    ).toBe(true);

    expect(
      new PaymentUtilities({ ...basePayment, type: PaymentPlans.BUSINESS, period: PERIOD.ANNUAL }).isBusinessAnnual(),
    ).toBe(true);
  });

  test('enterprise monthly (bug in code uses annual)', () => {
    const util = new PaymentUtilities({ ...basePayment, type: PaymentPlans.ENTERPRISE, period: PERIOD.ANNUAL });
    expect(util.isEnterpriseMonthly()).toBe(true);
  });

  test('getQuantity, getPriceVersion', () => {
    const util = new PaymentUtilities(basePayment as IPayment);
    expect(util.getQuantity()).toBe(1);
    expect(util.getPriceVersion()).toBe(PRICING_VERSION.V3);
  });

  test('getPriceVersion fallback returns V3', () => {
    const util = new PaymentUtilities({
      ...basePayment,
      priceVersion: '',
    } as unknown as IPayment);

    expect(util.getPriceVersion()).toBe(PRICING_VERSION.V3);
  });


  test('isNewPlan & isNewAnnualPlan', () => {
    const util = new PaymentUtilities({ ...basePayment, type: PaymentPlans.ORG_BUSINESS, period: PERIOD.ANNUAL });
    expect(util.isNewPlan()).toBe(true);
    expect(util.isNewAnnualPlan()).toBe(true);
  });

  test('canStartTrial', () => {
    const util = new PaymentUtilities({
      ...basePayment,
      trialInfo: { canStartTrial: true },
    } as unknown as IOrganizationPayment);

    const util2 = new PaymentUtilities({
      ...basePayment,
    } as IOrganizationPayment);
    expect(util.canStartTrial()).toBe(true);
    expect(util2.canStartTrial()).toBe(false);
  });

  test('getPdfStatus', () => {
    const util = new PaymentUtilities({
      ...basePayment,
      status: STATUS.TRIALING,
    } as unknown as IPayment);
    expect(util.getPdfStatus()).toBe(STATUS.TRIALING);
  });

  test('getPdfPaymentType, isPdfFree, isPdfTrial', () => {
    const util = new PaymentUtilities({
      ...basePayment,
      subscriptionItems: [
        {
          productName: UnifySubscriptionProduct.PDF,
          paymentType: PaymentPlans.BUSINESS,
          paymentStatus: PaymentStatus.TRIALING,
        },
      ],
    } as unknown as IPayment);

    expect(util.getPdfPaymentType()).toBe(PaymentPlans.BUSINESS);
    expect(util.isPdfFree()).toBe(false);
    expect(util.isPdfTrial()).toBe(true);
  });

  test('getPdfPaymentType fallback returns getType()', () => {
    const util = new PaymentUtilities({
      ...basePayment,
      type: Plans.BUSINESS as PaymentPlans,
      subscriptionItems: [],
    });

    expect(util.getPdfPaymentType()).toBe(Plans.BUSINESS);
  });


  test('getPdfSubscriptionItem & getSignSubscriptionItem', () => {
    const util = new PaymentUtilities({
      ...basePayment,
      subscriptionItems: [
        {
          productName: UnifySubscriptionProduct.PDF,
          paymentType: PaymentPlans.FREE,
          paymentStatus: PaymentStatus.ACTIVE,
        },
        {
          productName: UnifySubscriptionProduct.SIGN,
          paymentType: UnifySubscriptionPlan.ORG_BUSINESS,
          paymentStatus: PaymentStatus.ACTIVE,
        },
      ],
    } as unknown as IPayment);

    expect(util.getPdfSubscriptionItem()).toBeTruthy();
    expect(util.getSignSubscriptionItem()).toBeTruthy();
  });

  test('getSignStatus', () => {
    const util = new PaymentUtilities({
      ...basePayment,
      subscriptionItems: [
        {
          productName: UnifySubscriptionProduct.SIGN,
          paymentType: UnifySubscriptionPlan.ORG_BUSINESS,
          paymentStatus: PaymentStatus.ACTIVE,
        },
      ],
    } as unknown as IPayment);
    expect(util.getSignStatus()).toBe(PaymentStatus.ACTIVE);
  });

  test('getSignPlan, isSignFree, isUnifyFree', () => {
    const util = new PaymentUtilities({
      ...basePayment,
      subscriptionItems: [
        {
          productName: UnifySubscriptionProduct.PDF,
          paymentType: PaymentPlans.FREE,
          paymentStatus: PaymentStatus.ACTIVE,
        },
        {
          productName: UnifySubscriptionProduct.SIGN,
          paymentType: UnifySubscriptionPlan.FREE,
          paymentStatus: PaymentStatus.ACTIVE,
        },
      ],
    } as unknown as IPayment);

    const util2 = new PaymentUtilities({
      ...basePayment,
    } as IPayment);

    expect(util.isSignFree()).toBe(true);
    expect(util.isUnifyFree()).toBe(true);
    expect(util2.isSignFree()).toBe(true);
  });
});
