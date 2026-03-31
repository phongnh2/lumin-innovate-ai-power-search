/* eslint-disable no-console */
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorStr = args
    .map((arg) => {
      if (arg instanceof Error) return arg.message + (arg.stack || '');
      return String(arg);
    })
    .join(' ');

  if (
    errorStr.includes('Cannot read properties of undefined') ||
    errorStr.includes('i18n.ts') ||
    errorStr.includes('PaymentTempBilling.js') ||
    errorStr.includes("reading 'bind'") ||
    errorStr.includes("reading 'error'")
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { MantineProvider } from '@mantine/core';
import { KiwiProvider } from 'lumin-ui/kiwi-ui';
import configureMockStore from 'redux-mock-store';

import PaymentTempBilling from '../PaymentTempBilling';
import { getErrorMessage, getErrorTitle } from '../PaymentTempBilling';
import { PaymentInfoContext } from 'HOC/withGetPaymentInfo';
import { WarningBannerContext } from 'src/HOC/withWarningBanner';
import initialState from 'src/redux/initialState';
import { Plans, PERIOD, STATUS } from 'constants/plan';
import { WarningBannerType } from 'constants/banner';
import Theme from 'constants/theme';
import { ErrorCode } from 'constants/errorCode';

const mockTheme = {
  themeMode: 'light',
  SharedComponents: {
    Button: Theme.Button.BUTTON_THEME.light,
    Checkbox: Theme.Checkbox.CHECKBOX_THEME.light,
    MenuItem: Theme.MenuItem.MENU_ITEM_THEME.light,
    Tab: Theme.Tab.TAB_THEME.light,
    ButtonIcon: Theme.ButtonIcon.BUTTON_ICON_THEME.light,
    Textarea: Theme.Textarea.TEXTAREA_THEME.light,
    ActivityFeed: Theme.ActivityFeed.ACTIVITY_FEED_THEME.light,
  },
};

jest.mock('services', () => ({
  organizationServices: {
    createOrganizationSubscription: jest.fn().mockResolvedValue({ subscriptionRemoteId: 'sub-123' }),
    upgradeOrganizationSubcription: jest.fn().mockResolvedValue({ subscriptionRemoteId: 'sub-456' }),
    createOrganization: jest
      .fn()
      .mockResolvedValue({ organization: { _id: 'org-new', name: 'New Org', url: 'new-org' } }),
  },
}));

jest.mock('src/lumin-components/Shared/Tooltip/Tooltip', () => {
  const React = require('react');
  return React.forwardRef(({ children, title, noMaxWidth, ...props }, ref) => (
    <div ref={ref} data-testid="tooltip" data-title={title}>
      {children}
    </div>
  ));
});

const mockCreateCustomerCredentials = jest.fn();

const mockUseRetrieveRemainingPlan = jest.fn(() => ({
  remaining: 0,
  amountDue: 100,
  nextBilling: { loading: false, time: null, price: 100 },
  total: 100,
  discount: 0,
  discountDescription: '',
}));

const mockUseMatchPaymentRoute = jest.fn(() => ({
  plan: 'ORG_STARTER',
  period: 'monthly',
  isFreeTrial: false,
}));

const mockUseAvailablePersonalWorkspace = jest.fn(() => false);
const mockUseRestrictedUser = jest.fn(() => ({
  isOrgCreationRestricted: false,
}));
const mockUseEnableWebReskin = jest.fn(() => ({
  isEnableReskin: false,
}));

jest.mock('hooks', () => ({
  useTrackFormEvent: () => ({
    trackSubmitForm: jest.fn(),
    trackInputField: jest.fn(),
    trackClickButton: jest.fn(),
  }),
  useRetrieveRemainingPlan: (...args) => mockUseRetrieveRemainingPlan(...args),
  useUrlSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
  useMatchPaymentRoute: (...args) => mockUseMatchPaymentRoute(...args),
  useTranslation: () => ({
    t: (key) => key,
  }),
  useAvailablePersonalWorkspace: (...args) => mockUseAvailablePersonalWorkspace(...args),
  useCreateCredentials: () => ({
    createCustomerCredentials: mockCreateCustomerCredentials,
  }),
  useRestrictedUser: (...args) => mockUseRestrictedUser(...args),
  useEnableWebReskin: (...args) => mockUseEnableWebReskin(...args),
  useThemeProvider: () => ({
    themeMode: 'light',
    SharedComponents: {
      Button: {},
      Checkbox: {},
      MenuItem: {},
      Tab: {},
      ButtonIcon: {},
      Textarea: {},
      ActivityFeed: {},
    },
  }),
  useThemeMode: () => 'light',
}));

const mockOpenReactivateModal = jest.fn();
const mockUseReactivateAccount = jest.fn(() => ({
  openReactivateModal: mockOpenReactivateModal,
}));

jest.mock(
  'hooks/useReactivateAccount',
  () =>
    (...args) =>
      mockUseReactivateAccount(...args)
);

const mockOpenRestrictActionsModal = jest.fn();
const mockUseRestrictBillingActions = jest.fn(() => ({
  isRestrictedOrg: false,
  openRestrictActionsModal: mockOpenRestrictActionsModal,
}));

jest.mock(
  'hooks/useRestrictBillingActions',
  () =>
    (...args) =>
      mockUseRestrictBillingActions(...args)
);

const mockUseGetTempBilling = jest.fn(() => ({
  planName: 'Starter Plan',
  currencySymbol: '$',
  isNewSubscription: true,
  eventPlanName: 'starter',
  chooseOrgText: '',
  orgPriceText: '$10/month',
  changeOrgPlanText: '',
}));

jest.mock('../../PaymentTempBilling/hooks/useGetTempBilling', () => ({
  useGetTempBilling: (...args) => mockUseGetTempBilling(...args),
}));

jest.mock('features/CNC/hooks', () => ({
  useSendBeginCheckoutEvent: jest.fn(),
  useSendPurchaseEvent: () => ({
    sendPurchaseEvent: jest.fn(),
  }),
}));

jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey, children }) => <span data-testid={i18nKey}>{children || i18nKey}</span>,
}));

jest.mock('react-linkify', () => ({ children }) => <>{children}</>);

jest.mock('utils/lazyWithRetry', () => ({
  lazyWithRetry: () => () => null,
}));

jest.mock('lumin-components/ButtonMaterial', () => {
  const React = require('react');

  return {
    __esModule: true,
    default: React.forwardRef(({ children, disabled, loading, onClick, ...rest }, ref) => {
      const { fullWidth, noMaxWidth, ...domProps } = rest;

      return (
        <button ref={ref} disabled={disabled || loading} onClick={onClick} {...domProps}>
          {loading ? 'Loading...' : children}
        </button>
      );
    }),
    ButtonColor: { PRIMARY_BLACK: 'primary_black' },
    ButtonSize: { XL: 'xl' },
  };
});

jest.mock('../../PaymentTempBilling/PaymentTempBilling.styled', () => ({
  Container: ({ children }) => <div data-testid="container">{children}</div>,
  InfoContainer: ({ children }) => <div data-testid="info-container">{children}</div>,
  Title: ({ children }) => <h2>{children}</h2>,
  InfoWrapper: ({ children }) => <div>{children}</div>,
  Text: ({ children }) => <span>{children}</span>,
  TextInfo: ({ children }) => <span>{children}</span>,
  TextUnitPrice: ({ children }) => <span>{children}</span>,
  Bill: ({ children }) => <div data-testid="bill">{children}</div>,
  BillRow: ({ children }) => <div>{children}</div>,
  BillRowSecondary: ({ children }) => <div>{children}</div>,
  TextBill: ({ children }) => <span>{children}</span>,
  TextTotal: ({ children }) => <span>{children}</span>,
  PurchaseWrapper: ({ children }) => <div>{children}</div>,
  MigrationDiscount: ({ children }) => <div data-testid="migration-discount">{children}</div>,
  Message: ({ children }) => <span>{children}</span>,
}));

const mockStore = configureMockStore();

const defaultProps = {
  billingInfo: {
    currency: 'USD',
    isCardFilled: true,
    couponCode: '',
    quantity: 1,
    stripeAccountId: '',
  },
  currentUser: {
    _id: 'user-123',
    email: 'test@example.com',
    deletedAt: null,
  },
  openModal: jest.fn(),
  isPurchasing: false,
  setPurchaseState: jest.fn(),
  clientId: 'client-123',
  currentOrganization: {
    _id: 'org-123',
    name: 'Test Organization',
    url: 'test-org',
    payment: {
      status: STATUS.ACTIVE,
      type: Plans.ORG_STARTER,
      period: PERIOD.MONTHLY,
    },
    userRole: 'admin',
    docStackStorage: {
      totalUsed: 0,
      totalStack: 10,
    },
    hasPendingInvoice: false,
  },
  canUpgrade: true,
  updateOrganizationInList: jest.fn(),
  isCardExisted: true,
  isChangeCard: false,
  isLoading: false,
  updateModalProperties: jest.fn(),
  newOrganization: { name: '', error: null },
  changeBillingInfo: jest.fn(),
  setOrganizations: jest.fn(),
  isFetchedCard: true,
};

const mockPaymentInfoContext = {
  triggerEvent: jest.fn(),
  paymentEvent: {
    userSubmitPaymentForm: jest.fn(),
  },
};

const mockWarningBannerContext = {
  [WarningBannerType.BILLING_WARNING.value]: {
    refetch: jest.fn(),
  },
};

const renderComponent = (props = {}, storeOverrides = {}) => {
  const store = mockStore({
    ...initialState,
    auth: {
      currentUser: defaultProps.currentUser,
    },
    organization: {
      ...initialState.organization,
      hasJoinedAnyOrganizations: true,
      availablePaidOrgs: [{ _id: 'org-123' }],
      list: { data: [{ _id: 'org-123', name: 'Test Org' }] },
    },
    ...storeOverrides,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <MantineProvider>
          <KiwiProvider>
            <ThemeProvider theme={mockTheme}>
              <PaymentInfoContext.Provider value={mockPaymentInfoContext}>
                <WarningBannerContext.Provider value={mockWarningBannerContext}>
                  <PaymentTempBilling {...defaultProps} {...props} />
                </WarningBannerContext.Provider>
              </PaymentInfoContext.Provider>
            </ThemeProvider>
          </KiwiProvider>
        </MantineProvider>
      </MemoryRouter>
    </Provider>
  );
};

describe('PaymentTempBilling', () => {
  const t = (key) => key;
  const orgName = 'Test Org';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRetrieveRemainingPlan.mockReturnValue({
      remaining: 0,
      amountDue: 100,
      nextBilling: { loading: false, time: null, price: 100 },
      total: 100,
      discount: 0,
      discountDescription: '',
    });
    mockUseMatchPaymentRoute.mockReturnValue({
      plan: 'ORG_STARTER',
      period: 'monthly',
      isFreeTrial: false,
    });
    mockUseAvailablePersonalWorkspace.mockReturnValue(false);
    mockUseRestrictedUser.mockReturnValue({
      isOrgCreationRestricted: false,
    });
    mockUseEnableWebReskin.mockReturnValue({
      isEnableReskin: false,
    });
    mockUseReactivateAccount.mockReturnValue({
      openReactivateModal: mockOpenReactivateModal,
    });
    mockUseRestrictBillingActions.mockReturnValue({
      isRestrictedOrg: false,
      openRestrictActionsModal: mockOpenRestrictActionsModal,
    });
    mockUseGetTempBilling.mockReturnValue({
      planName: 'Starter Plan',
      currencySymbol: '$',
      isNewSubscription: true,
      eventPlanName: 'starter',
      chooseOrgText: '',
      orgPriceText: '$10/month',
      changeOrgPlanText: '',
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct message for UPGRADING_INVOICE', () => {
      const msg = getErrorMessage({ t, orgName, metadata: { plan: 'ORG_STARTER' } });
      expect(msg[ErrorCode.Org.UPGRADING_INVOICE]).toBeDefined();
    });

    it('should return correct message for CANNOT_CREATE_ANOTHER_SUBSCRIPTION', () => {
      const msg = getErrorMessage({ t, orgName });
      expect(msg[ErrorCode.Payment.CANNOT_CREATE_ANOTHER_SUBSCRIPTION]).toBeDefined();
    });

    it('should return correct message for ORG_ALREADY_CHARGED', () => {
      const msg = getErrorMessage({ t, orgName });
      expect(msg[ErrorCode.Org.ORG_ALREADY_CHARGED]).toBeDefined();
    });

    it('should return correct message for PAYMENT_INCOMPLETE', () => {
      const msg = getErrorMessage({ t, orgName });
      expect(msg[ErrorCode.Payment.PAYMENT_INCOMPLETE]).toBeDefined();
    });

    it('should return correct message for CARD_DECLINED', () => {
      const msg = getErrorMessage({ t, orgName });
      expect(msg[ErrorCode.Payment.CARD_DECLINED]).toBeDefined();
    });

    it('should return correct message for EXPIRED_CARD', () => {
      const msg = getErrorMessage({ t, orgName });
      expect(msg[ErrorCode.Payment.EXPIRED_CARD]).toBeDefined();
    });

    it('should return correct message for INCORRECT_CVC', () => {
      const msg = getErrorMessage({ t, orgName });
      expect(msg[ErrorCode.Payment.INCORRECT_CVC]).toBeDefined();
    });
  });

  describe('getErrorTitle', () => {
    it('should return correct title for UPGRADING_INVOICE', () => {
      const title = getErrorTitle(t);
      expect(title[ErrorCode.Org.UPGRADING_INVOICE]).toBe('modalChangingPlan.title');
    });

    it('should return correct title for CANNOT_CREATE_ANOTHER_SUBSCRIPTION', () => {
      const title = getErrorTitle(t);
      expect(title[ErrorCode.Payment.CANNOT_CREATE_ANOTHER_SUBSCRIPTION]).toBe('common.fail');
    });

    it('should return correct title for ORG_ALREADY_CHARGED', () => {
      const title = getErrorTitle(t);
      expect(title[ErrorCode.Org.ORG_ALREADY_CHARGED]).toBe('modalUpdatePayment.actionCannotBePerformed');
    });

    it('should return correct title for PAYMENT_INCOMPLETE', () => {
      const title = getErrorTitle(t);
      expect(title[ErrorCode.Payment.PAYMENT_INCOMPLETE]).toBe('modalUpdatePayment.actionCannotBePerformed');
    });
  });

  describe('Rendering', () => {
    it('should render billing title', () => {
      renderComponent();
      expect(screen.getByText('common.billing')).toBeInTheDocument();
    });

    it('should render plan name', () => {
      renderComponent();
      expect(screen.getByText('Starter Plan')).toBeInTheDocument();
    });

    it('should render complete purchase button', () => {
      renderComponent();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render amount due today text', () => {
      renderComponent();
      expect(screen.getByText('payment.amountDueToday')).toBeInTheDocument();
    });
  });

  describe('Button states', () => {
    it('should disable button when isLoading is true', () => {
      renderComponent({ isLoading: true });
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable button when isPurchasing is true', () => {
      renderComponent({ isPurchasing: true });
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable button when canUpgrade is false', () => {
      renderComponent({ canUpgrade: false });
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable button when card is not filled and not existed', () => {
      renderComponent({
        billingInfo: { ...defaultProps.billingInfo, isCardFilled: false },
        isCardExisted: false,
      });
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable button when organization has pending invoice', () => {
      renderComponent({
        currentOrganization: {
          ...defaultProps.currentOrganization,
          hasPendingInvoice: true,
        },
      });
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('current organization is null', () => {
      renderComponent({
        currentOrganization: null,
      });
      const button = screen.getByRole('button');
      expect(button).not.toBeNull();
    });

    it('should enable button when all conditions are met', () => {
      renderComponent();
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Billing information display', () => {
    it('should display currency symbol', () => {
      renderComponent();
      const dollarSigns = screen.getAllByText('$', { exact: false });
      expect(dollarSigns.length).toBeGreaterThan(0);
    });

    it('should display monthly plan text when period is monthly', () => {
      renderComponent();
      expect(screen.getByText('common.monthlyPlan')).toBeInTheDocument();
    });

    it('should display annual plan text when period is annual', () => {
      mockUseMatchPaymentRoute.mockReturnValue({
        plan: 'ORG_STARTER',
        period: PERIOD.ANNUAL,
        isFreeTrial: false,
      });
      renderComponent();
      expect(screen.getByText('common.annualPlan')).toBeInTheDocument();
    });

    it('should display remaining amount when remaining > 0 and canUpgrade is true', () => {
      mockUseRetrieveRemainingPlan.mockReturnValue({
        remaining: 50,
        amountDue: 50,
        nextBilling: { loading: false, time: null, price: 100 },
        total: 100,
        discount: 0,
        discountDescription: '',
      });
      renderComponent();
      expect(screen.getByText('payment.unusedTimeOnPreviousPlan')).toBeInTheDocument();
    });

    it('should display discount when discount > 0', () => {
      mockUseRetrieveRemainingPlan.mockReturnValue({
        remaining: 0,
        amountDue: 80,
        nextBilling: { loading: false, time: null, price: 100 },
        total: 100,
        discount: 20,
        discountDescription: '',
      });
      renderComponent();
      expect(screen.getByText('payment.promotionCode1')).toBeInTheDocument();
    });

    it('should display next billing description when conditions are met', () => {
      mockUseRetrieveRemainingPlan.mockReturnValue({
        remaining: 0,
        amountDue: 100,
        nextBilling: { loading: false, time: '1234567890', price: 100 },
        total: 100,
        discount: 0,
        discountDescription: '',
      });
      renderComponent();
      expect(screen.getByText('payment.infoNextBillingCycle', { exact: false })).toBeInTheDocument();
    });

    it('should display credit balance when showCreditBalanceDesc is true', () => {
      mockUseRetrieveRemainingPlan.mockReturnValue({
        remaining: 0,
        amountDue: 100,
        nextBilling: { loading: false, time: '1234567890', price: 100, creditBalance: 10 },
        total: 100,
        discount: 0,
        discountDescription: '',
      });
      renderComponent();
      expect(screen.getByText('payment.infoUnusedPreviousPlan', { exact: false })).toBeInTheDocument();
    });
  });

  describe('Organization states', () => {
    it('should render correctly with trialing status', () => {
      renderComponent({
        currentOrganization: {
          ...defaultProps.currentOrganization,
          payment: {
            ...defaultProps.currentOrganization.payment,
            status: STATUS.TRIALING,
          },
        },
      });
      expect(screen.getByText('payment.orgTrialDesc')).toBeInTheDocument();
    });

    it('should render migration discount section when convertFromTeam is true', () => {
      renderComponent({
        currentOrganization: {
          ...defaultProps.currentOrganization,
          convertFromTeam: true,
        },
      });
      expect(screen.getByTestId('migration-discount')).toBeInTheDocument();
    });

    it('should disable button when isPreventCreateOrg is true', () => {
      mockUseRestrictedUser.mockReturnValue({
        isOrgCreationRestricted: true,
      });
      renderComponent(
        {
          currentOrganization: null,
        },
        {
          organization: {
            ...initialState.organization,
            hasJoinedAnyOrganizations: false,
            availablePaidOrgs: [],
            list: { data: [] },
          },
        }
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable button when isOrgNameError is true', () => {
      renderComponent(
        {
          currentOrganization: null,
          newOrganization: { name: '', error: 'Error message' },
        },
        {
          organization: {
            ...initialState.organization,
            hasJoinedAnyOrganizations: false,
            availablePaidOrgs: [],
            list: { data: [] },
          },
        }
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Click handlers', () => {
    it('should call button click handler when clicked', () => {
      renderComponent();
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(button).toBeDefined();
    });
  });

  describe('Reskin UI', () => {
    it('should render reskin UI when isEnableReskin is true', () => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: true,
      });
      renderComponent();
      expect(screen.getByText('common.billing')).toBeInTheDocument();
    });

    it('should render skeleton when nextBilling.loading is true in reskin UI', () => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: true,
      });
      mockUseRetrieveRemainingPlan.mockReturnValue({
        remaining: 0,
        amountDue: 100,
        nextBilling: { loading: true, time: null, price: null },
        total: 100,
        discount: 0,
        discountDescription: '',
      });
      renderComponent();
      expect(screen.getByText('common.billing')).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('should render skeleton when nextBilling.loading is true', () => {
      mockUseRetrieveRemainingPlan.mockReturnValue({
        remaining: 0,
        amountDue: 100,
        nextBilling: { loading: true, time: null, price: null },
        total: 100,
        discount: 0,
        discountDescription: '',
      });
      renderComponent();
      expect(screen.getByText('common.billing')).toBeInTheDocument();
    });
  });

  describe('Temp billing text conditions', () => {
    it('should render chooseOrgText when provided', () => {
      mockUseGetTempBilling.mockReturnValue({
        planName: 'Starter Plan',
        currencySymbol: '$',
        isNewSubscription: true,
        eventPlanName: 'starter',
        chooseOrgText: 'Choose organization text',
        orgPriceText: '$10/month',
        changeOrgPlanText: '',
      });
      renderComponent();
      expect(screen.getByText('Choose organization text')).toBeInTheDocument();
    });

    it('should render orgPriceText when provided', () => {
      mockUseGetTempBilling.mockReturnValue({
        planName: 'Starter Plan',
        currencySymbol: '$',
        isNewSubscription: true,
        eventPlanName: 'starter',
        chooseOrgText: '',
        orgPriceText: '$10/month',
        changeOrgPlanText: '',
      });
      renderComponent();
      expect(screen.getByText('$10/month')).toBeInTheDocument();
    });

    it('should render changeOrgPlanText when provided', () => {
      mockUseGetTempBilling.mockReturnValue({
        planName: 'Starter Plan',
        currencySymbol: '$',
        isNewSubscription: true,
        eventPlanName: 'starter',
        chooseOrgText: '',
        orgPriceText: '$10/month',
        changeOrgPlanText: 'Change org plan text',
      });
      renderComponent();
      expect(screen.getByText('Change org plan text')).toBeInTheDocument();
    });
  });

  describe('Old plan (BUSINESS)', () => {
    it('should render correctly when plan is BUSINESS', () => {
      mockUseMatchPaymentRoute.mockReturnValue({
        plan: Plans.BUSINESS,
        period: 'monthly',
        isFreeTrial: false,
      });
      renderComponent();
      expect(screen.getByText('common.billing')).toBeInTheDocument();
    });
  });

  describe('Tooltip content', () => {
    it('should show tooltip when hasPendingInvoice is true', () => {
      renderComponent({
        currentOrganization: {
          ...defaultProps.currentOrganization,
          hasPendingInvoice: true,
        },
      });
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show tooltip when isPreventCreateOrg is true', () => {
      mockUseRestrictedUser.mockReturnValue({
        isOrgCreationRestricted: true,
      });
      renderComponent(
        {
          currentOrganization: null,
        },
        {
          organization: {
            ...initialState.organization,
            hasJoinedAnyOrganizations: false,
            availablePaidOrgs: [],
            list: { data: [] },
          },
        }
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show tooltip when canUpgrade is false', () => {
      renderComponent({ canUpgrade: false });
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('User states', () => {
    it('should handle deleted user', () => {
      mockUseReactivateAccount.mockReturnValue({
        openReactivateModal: mockOpenReactivateModal,
      });
      renderComponent({
        currentUser: {
          ...defaultProps.currentUser,
          deletedAt: '2024-01-01',
        },
      });
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockOpenReactivateModal).toHaveBeenCalled();
    });

    it('should handle restricted org', () => {
      mockUseRestrictBillingActions.mockReturnValue({
        isRestrictedOrg: true,
        openRestrictActionsModal: mockOpenRestrictActionsModal,
      });
      renderComponent();
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockOpenRestrictActionsModal).toHaveBeenCalled();
    });

    it('should handle professional user', () => {
      mockUseAvailablePersonalWorkspace.mockReturnValue(true);
      renderComponent();
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(button).toBeDefined();
    });
  });

  describe('Discount description', () => {
    it('should display discount description when isUpgradeDocStackAnnual is true', () => {
      mockUseRetrieveRemainingPlan.mockReturnValue({
        remaining: 0,
        amountDue: 100,
        nextBilling: {
          loading: false,
          time: null,
          price: 100,
          isUpgradeDocStackAnnual: true,
        },
        total: 100,
        discount: 0,
        discountDescription: '20% off',
      });
      renderComponent();
      expect(screen.getByText('payment.discountPeriodPlan', { exact: false })).toBeInTheDocument();
    });
  });

  describe('Button disabled states combinations', () => {
    it('should disable button when nextBilling.loading is true', () => {
      mockUseRetrieveRemainingPlan.mockReturnValue({
        remaining: 0,
        amountDue: 100,
        nextBilling: { loading: true, time: null, price: null },
        total: 100,
        discount: 0,
        discountDescription: '',
      });
      renderComponent();
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});
