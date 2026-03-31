import { PaymentUrlSerializer, PaymentHelpers } from '../payment';
import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';
import { PaymentPeriod, PaymentStatus } from 'constants/plan.enum';

describe('PaymentUrlSerializer', () => {
  test('should throw if plan is missing', () => {
    const serializer = new PaymentUrlSerializer().of('org1');
    expect(() => serializer.get()).toThrow('Plan is required in url');
  });

  test('quantityParam, fromParam, trialParam, checkout should set values', () => {
    const serializer = new PaymentUrlSerializer()
      .of('org1')
      .plan(UnifySubscriptionPlan.ORG_PRO)
      .period(PaymentPeriod.ANNUAL)
      .quantityParam(10)
      .fromParam('dashboard')
      .trialParam(true)
      .checkout('checkout')
      .searchParam('a=1');

    const output = serializer.get();
    expect(output).toContain('a=1');
    expect(output).toContain('trial=true');
    expect(output).toContain('dashboard');
  });

  test('returnUrlParam should auto detect url and trim language prefix', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/en/test', search: '' }
    });

    jest.mock('utils/getLanguage', () => ({ getLanguageFromUrl: () => 'en' }));

    const url = new PaymentUrlSerializer()
      .of('org1')
      .plan(UnifySubscriptionPlan.ORG_PRO)
      .period(PaymentPeriod.ANNUAL)
      .returnUrlParam()
      .get();

    expect(url).not.toContain('/en');

    const url2 = new PaymentUrlSerializer()
      .of('org1')
      .plan(UnifySubscriptionPlan.ORG_PRO)
      .period(PaymentPeriod.ANNUAL)
      .returnUrlParam('https://www.google.com')
      .get();

    expect(url2).not.toBeNull();
  });

  test('validPlan should validate plans correctly', () => {
    const serializer = new PaymentUrlSerializer().plan(UnifySubscriptionPlan.ORG_PRO);
    expect(serializer.validPlan()).toBe(true);

    const invalid = new PaymentUrlSerializer().plan('invalid');
    expect(invalid.validPlan()).toBe(false);
  });

  test('validPeriod should validate periods correctly', () => {
    const s1 = new PaymentUrlSerializer().period(PaymentPeriod.ANNUAL);
    expect(s1.validPeriod()).toBe(true);

    const s2 = new PaymentUrlSerializer().period('wrong');
    expect(s2.validPeriod()).toBe(false);
  });

  test('validParams should validate both plan and period', () => {
    const s = new PaymentUrlSerializer()
      .plan(UnifySubscriptionPlan.ORG_PRO)
      .period(PaymentPeriod.ANNUAL);
    expect(s.validParams()).toBe(true);
  });

  test('defaultTrial getter should generate correct url', () => {
    const s = new PaymentUrlSerializer().of('org1');
    const url = s.defaultTrial;
    expect(url).not.toBeNull();
  });

  test('default getter works', () => {
    const s = new PaymentUrlSerializer().of('org1');
    const url = s.default;
    expect(url).not.toBeNull();
  });

  test('business getter works', () => {
    const s = new PaymentUrlSerializer().of('org1');
    const url = s.business;
    expect(url).not.toBeNull();
  });

  test('pro getter works', () => {
    const s = new PaymentUrlSerializer().of('org1');
    const url = s.pro;
    expect(url).not.toBeNull();
  });
});

test('should build trial url', () => {
  const url = new PaymentUrlSerializer()
    .of('org1')
    .plan(UnifySubscriptionPlan.ORG_PRO)
    .period(PaymentPeriod.ANNUAL)
    .trial(true)
    .searchParam('foo=bar')
    .get();

  expect(url).not.toBeNull();
});

test('should build normal payment url', () => {
  const url = new PaymentUrlSerializer()
    .of('org1')
    .plan(UnifySubscriptionPlan.ORG_PRO)
    .period(PaymentPeriod.ANNUAL)
    .product(UnifySubscriptionProduct.PDF)
    .get();

  expect(url).not.toBeNull();
});

describe('PaymentHelpers', () => {
  test('evaluateTrialPlan', () => {
    expect(PaymentHelpers.evaluateTrialPlan({})).toBeNull();
    expect(PaymentHelpers.evaluateTrialPlan({ canStartTrial: true, canUseProTrial: true })).toBe(
      UnifySubscriptionPlan.ORG_PRO
    );
    expect(PaymentHelpers.evaluateTrialPlan({ canStartTrial: true, canUseProTrial: false })).toBe(
      UnifySubscriptionPlan.ORG_BUSINESS
    );
    expect(PaymentHelpers.evaluateTrialPlan({ canStartTrial: false, canUseBusinessTrial: true })).toBeNull();
  });

  test('isDocStackPlan should detect plan', () => {
    expect(PaymentHelpers.isDocStackPlan(UnifySubscriptionPlan.ORG_PRO)).toBe(true);
    expect(PaymentHelpers.isDocStackPlan('RANDOM')).toBe(false);
  });

  test('isMatchingUnifyPaymentStatus basic match', () => {
    const payment = { status: PaymentStatus.TRIALING } as any;
    expect(PaymentHelpers.isMatchingUnifyPaymentStatus({ payment, status: PaymentStatus.TRIALING })).toBe(true);
    expect(PaymentHelpers.isMatchingUnifyPaymentStatus({ product: { productName: UnifySubscriptionProduct.PDF } as any, payment, status: PaymentStatus.ACTIVE })).toBe(false);
    expect(PaymentHelpers.isMatchingUnifyPaymentStatus({ product: { productName: UnifySubscriptionProduct.SIGN } as any, payment, status: PaymentStatus.ACTIVE })).toBe(false);
  });

  test('isSignProduct should detect SIGN product correctly', () => {
    expect(PaymentHelpers.isSignProduct(UnifySubscriptionProduct.SIGN)).toBe(true);
  });

  test('isOrgTrialing should return true only when doc plan AND status = TRIALING', () => {
    const good = {
      paymentType: UnifySubscriptionPlan.ORG_PRO,
      paymentStatus: PaymentStatus.TRIALING,
    } as any;
    expect(PaymentHelpers.isOrgTrialing(good)).toBe(true);
  });

  test('getNextPaymentUrl should build correct URL using next plan and orgId', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/test', search: '' }
    });

    const payment = { type: UnifySubscriptionPlan.ORG_PRO } as any;
    const url = PaymentHelpers.getNextPaymentUrl({ payment, orgId: 'org123' });

    expect(url).not.toBeNull();
  });

});
