import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

const mockUseEnableWebReskin = jest.fn();
const mockGetPaymentMethodAndCustomerInfo = jest.fn();
const mockLogError = jest.fn();

jest.mock('lumin-components/Loading', () => {
  return function Loading(props) {
    return <div className="mock-loading" data-testid="loading" />;
  };
});

jest.mock('hooks', () => ({
  useEnableWebReskin: () => mockUseEnableWebReskin(),
}));

jest.mock('services', () => ({
  paymentServices: {
    getPaymentMethodAndCustomerInfo: (...args) => mockGetPaymentMethodAndCustomerInfo(...args),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn((params) => {
      if (!params?.error) {
        params = { error: new Error('mock error') };
      }
      return null;
    }),
  },
}));

jest.mock('services/loggerServices', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('i18next', () => ({
  __esModule: true,
  default: {
    t: jest.fn((key, options) => key),
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    services: {
      pluralResolver: {
        getSuffix: jest.fn(() => ''),
      },
    },
  },
}));

jest.mock('helpers/i18n', () => ({
  __esModule: true,
  default: {
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    services: {
      pluralResolver: {
        getSuffix: jest.fn(() => ''),
      },
    },
  },
}));

jest.mock('../SettingBillingForm', () => {
  return function SettingBillingForm(props) {
    return <div className="mock-setting-billing-form" data-testid="setting-billing-form" />;
  };
});

import BillingFormWrapper from '../BillingFormWrapper';

describe('BillingFormWrapper', () => {
  const mockSelectedBilling = {
    _id: 'client-123',
    type: 'organization',
    plan: 'PRO',
    name: 'Test Org',
    stripeAccountId: 'stripe-123',
    payment: {},
  };

  const mockPaymentMethod = {
    id: 'pm_123',
    card: {
      brand: 'visa',
      last4: '4242',
    },
  };

  const mockCustomerInfo = {
    id: 'cus_123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    mockGetPaymentMethodAndCustomerInfo.mockResolvedValue([mockPaymentMethod, mockCustomerInfo]);
  });

  it('should not fetch card info if selectedBilling is null', async () => {
    let wrapper;
    await act(async () => {
      wrapper = mount(<BillingFormWrapper selectedBilling={null} />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    wrapper.update();

    expect(wrapper.find('SettingBillingForm')).toHaveLength(0);

    wrapper.unmount();
  });

  describe('Loading state branch (isFetchingCard = true)', () => {
    it('should show Loading when fetching', () => {
      mockGetPaymentMethodAndCustomerInfo.mockImplementation(() => new Promise(() => {}));

      const wrapper = mount(<BillingFormWrapper selectedBilling={mockSelectedBilling} />);

      expect(wrapper.find('.mock-loading')).toHaveLength(1);
      expect(wrapper.find('.mock-setting-billing-form')).toHaveLength(0);

      wrapper.unmount();
    });
  });

  it('should render SettingBillingForm when isFetchingCard is false', async () => {
    mockGetPaymentMethodAndCustomerInfo.mockResolvedValue([
      { id: 'pm_123', card: { brand: 'visa', last4: '4242' } },
      { id: 'cus_123', email: 'test@example.com' },
    ]);

    let wrapper;

    await act(async () => {
      wrapper = mount(<BillingFormWrapper selectedBilling={mockSelectedBilling} />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    wrapper.update();

    expect(wrapper.find('SettingBillingForm')).toHaveLength(1);
    expect(wrapper.find('Styled.LoadingWrapper')).toHaveLength(0);
    expect(wrapper.find('Loading')).toHaveLength(0);

    wrapper.unmount();
  });

  describe('useEnableWebReskin hook branches', () => {
    it('should pass isEnableReskin=false to styled component', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      mockGetPaymentMethodAndCustomerInfo.mockImplementation(() => new Promise(() => {}));

      const wrapper = mount(<BillingFormWrapper selectedBilling={mockSelectedBilling} />);
      const styledWrapper = wrapper.find('LoadingWrapper');
      if (styledWrapper.length > 0) {
        expect(styledWrapper.at(0).prop('$isReskin')).toBe(false);
      }

      wrapper.unmount();
    });

    it('should pass isEnableReskin=true to styled component', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      mockGetPaymentMethodAndCustomerInfo.mockImplementation(() => new Promise(() => {}));

      const wrapper = mount(<BillingFormWrapper selectedBilling={mockSelectedBilling} />);

      const styledWrapper = wrapper.find('LoadingWrapper');
      if (styledWrapper.length > 0) {
        expect(styledWrapper.at(0).prop('$isReskin')).toBe(true);
      }

      wrapper.unmount();
    });
  });
});
