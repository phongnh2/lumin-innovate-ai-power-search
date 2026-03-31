import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useGetTempBilling } from '../useGetTempBilling';
import * as hooks from 'hooks';
import * as pricingHooks from 'hooks/pricingRefactors';
import { paymentUtil } from 'utils';
import { Plans, PERIOD } from 'constants/plan';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('hooks', () => ({
  useTranslation: jest.fn(),
  useGetPlanName: jest.fn(),
  useMatchPaymentRoute: jest.fn(),
}));

jest.mock('hooks/pricingRefactors', () => ({
  useGetPricingBaseOnPlan: jest.fn(),
}));

jest.mock('utils', () => ({
  paymentUtil: {
    getNextDocStack: jest.fn(),
    convertCurrencySymbol: jest.fn(),
    getOrganizationPrice: jest.fn(),
  },
  numberUtils: {
    formatTwoDigits: jest.fn((val) => val),
    formatDecimal: jest.fn((val) => val),
  },
}));

jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey, values }) => <span data-testid="trans">{i18nKey}</span>,
}));

const { useSelector } = require('react-redux');

const TestComponent = ({ billingInfo, currentOrganization, canUpgrade, onResult }) => {
  const result = useGetTempBilling({ billingInfo, currentOrganization, canUpgrade });
  onResult(result);
  return null;
};

describe('useGetTempBilling', () => {
  const defaultBillingInfo = {
    quantity: 5,
    currency: 'USD',
  };

  const defaultOrganization = {
    payment: {
      type: Plans.FREE,
      period: PERIOD.MONTHLY,
      status: 'active',
      quantity: 1,
    },
    docStackStorage: {
      totalUsed: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    hooks.useTranslation.mockReturnValue({
      t: (key, values) => `${key}${values ? JSON.stringify(values) : ''}`,
    });
    hooks.useGetPlanName.mockReturnValue('Pro');
    paymentUtil.convertCurrencySymbol.mockReturnValue('$');
    paymentUtil.getOrganizationPrice.mockReturnValue(100);
    paymentUtil.getNextDocStack.mockReturnValue({
      nextDocStack: 500,
      totalBlock: 10,
    });
    useSelector.mockReturnValue([]);
  });

  describe('Old plan (BUSINESS)', () => {
    beforeEach(() => {
      hooks.useMatchPaymentRoute.mockReturnValue({
        period: PERIOD.MONTHLY,
        plan: Plans.BUSINESS,
        isMonthly: true,
      });
      pricingHooks.useGetPricingBaseOnPlan.mockReturnValue({ price: 20 });
    });

    it('should return correct values for monthly old plan', () => {
      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={defaultOrganization}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.planName).toContain('payment.oldMonthlyPlanName');
      expect(result.orgPriceText).toContain('payment.oldOrgPriceText');
      expect(result.isNewSubscription).toBe(true);
      expect(result.currencySymbol).toBe('$');
    });

    it('should return correct values for annual old plan', () => {
      hooks.useMatchPaymentRoute.mockReturnValue({
        period: PERIOD.ANNUAL,
        plan: Plans.BUSINESS,
        isMonthly: false,
      });

      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={defaultOrganization}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.planName).toContain('payment.oldAnnualPlanName');
    });

    it('should return changeOrgPlanText when not new subscription', () => {
      useSelector.mockReturnValue([{ id: 'org1' }]);
      const orgWithPaidPlan = {
        ...defaultOrganization,
        payment: {
          type: Plans.BUSINESS,
          period: PERIOD.MONTHLY,
          quantity: 3,
        },
      };

      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={orgWithPaidPlan}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.changeOrgPlanText).toBeDefined();
      expect(result.isNewSubscription).toBe(false);
    });
  });

  describe('New plan (non-BUSINESS)', () => {
    beforeEach(() => {
      hooks.useMatchPaymentRoute.mockReturnValue({
        period: PERIOD.MONTHLY,
        plan: Plans.PRO,
        isMonthly: true,
      });
      pricingHooks.useGetPricingBaseOnPlan.mockReturnValue({ price: 15 });
    });

    it('should return correct values for monthly new plan', () => {
      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={defaultOrganization}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.planName).toContain('payment.newMonthylyPlanName');
      expect(result.orgPriceText).toContain('payment.newOrgPriceText');
      expect(result.changeOrgPlanText).toBeFalsy();
    });

    it('should return correct values for annual new plan', () => {
      hooks.useMatchPaymentRoute.mockReturnValue({
        period: PERIOD.ANNUAL,
        plan: Plans.PRO,
        isMonthly: false,
      });

      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={defaultOrganization}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.planName).toContain('payment.newAnnualPlanName');
    });
  });

  describe('canUpgrade scenarios', () => {
    beforeEach(() => {
      hooks.useMatchPaymentRoute.mockReturnValue({
        period: PERIOD.MONTHLY,
        plan: Plans.PRO,
        isMonthly: true,
      });
      pricingHooks.useGetPricingBaseOnPlan.mockReturnValue({ price: 15 });
    });

    it('should return null for orgPriceText when canUpgrade is false', () => {
      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={defaultOrganization}
          canUpgrade={false}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.orgPriceText).toBeNull();
      expect(result.changeOrgPlanText).toBeFalsy();
    });

    it('should return orgPriceText when canUpgrade is true', () => {
      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={defaultOrganization}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.orgPriceText).toBeTruthy();
    });
  });

  describe('chooseOrgText scenarios', () => {
    beforeEach(() => {
      hooks.useMatchPaymentRoute.mockReturnValue({
        period: PERIOD.MONTHLY,
        plan: Plans.PRO,
        isMonthly: true,
      });
      pricingHooks.useGetPricingBaseOnPlan.mockReturnValue({ price: 15 });
    });

    it('should return chooseOrgText when availablePaidOrgs exists but no currentOrganization', () => {
      useSelector.mockReturnValue([{ id: 'org1' }]);

      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={null}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.chooseOrgText).toBeTruthy();
    });

    it('should return false when no availablePaidOrgs', () => {
      useSelector.mockReturnValue([]);

      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={null}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.chooseOrgText).toBeFalsy();
    });
  });

  describe('isNewSubscription scenarios', () => {
    beforeEach(() => {
      hooks.useMatchPaymentRoute.mockReturnValue({
        period: PERIOD.MONTHLY,
        plan: Plans.PRO,
        isMonthly: true,
      });
      pricingHooks.useGetPricingBaseOnPlan.mockReturnValue({ price: 15 });
    });

    it('should return true when no availablePaidOrgs', () => {
      useSelector.mockReturnValue([]);

      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={defaultOrganization}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.isNewSubscription).toBe(true);
    });

    it('should return true when currentOrganization has FREE plan', () => {
      useSelector.mockReturnValue([{ id: 'org1' }]);

      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={defaultOrganization}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.isNewSubscription).toBe(true);
    });

    it('should return false when currentOrganization has paid plan', () => {
      useSelector.mockReturnValue([{ id: 'org1' }]);
      const orgWithPaidPlan = {
        ...defaultOrganization,
        payment: {
          type: Plans.PRO,
          period: PERIOD.MONTHLY,
        },
      };

      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={orgWithPaidPlan}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.isNewSubscription).toBe(false);
    });
  });

  describe('eventPlanName', () => {
    it('should format eventPlanName correctly', () => {
      hooks.useMatchPaymentRoute.mockReturnValue({
        period: PERIOD.MONTHLY,
        plan: Plans.PRO,
        isMonthly: true,
      });
      pricingHooks.useGetPricingBaseOnPlan.mockReturnValue({ price: 15 });

      let result;
      render(
        <TestComponent
          billingInfo={defaultBillingInfo}
          currentOrganization={defaultOrganization}
          canUpgrade={true}
          onResult={(r) => (result = r)}
        />
      );

      expect(result.eventPlanName).toContain('Pro');
      expect(result.eventPlanName).toContain('Monthly');
    });
  });
});
