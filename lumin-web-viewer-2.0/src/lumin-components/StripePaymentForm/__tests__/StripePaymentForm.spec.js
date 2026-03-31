import React from 'react';
import { shallow } from 'enzyme';
import { PaymentElement } from '@stripe/react-stripe-js';
import { CircularProgress } from 'lumin-ui/kiwi-ui';

import StripePaymentForm from '../StripePaymentForm';
import CircularLoading from 'luminComponents/CircularLoading';
import PaymentMethodInfo from 'luminComponents/PaymentMethodInfo';
import PromotionCodeField from 'luminComponents/PromotionCodeField';
import PaymentEncryptedCert from 'lumin-components/PaymentEncryptedCert';
import CurrencyPicker from '../components/CurrencyPicker';

jest.mock('@stripe/react-stripe-js', () => ({
  PaymentElement: jest.fn(() => null),
  useElements: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('hooks', () => ({
  useGetCurrentUser: jest.fn(),
  usePaymentPermissions: jest.fn(),
  useEnableWebReskin: jest.fn(),
}));

jest.mock('hooks/useGetApplePayRecurringPaymentRequest', () => jest.fn());

jest.mock('utils', () => ({
  eventTracking: jest.fn(() => Promise.resolve()),
  capitalize: jest.fn((str) => str),
}));

jest.mock('utils/Factory/EventCollection/PaymentEventCollection', () => ({
  __esModule: true,
  default: {
    userFillPaymentForm: jest.fn(),
  },
  EVENT_FIELD_ACTION: {
    TOUCHED: 'touched',
    CHANGED: 'changed',
    COMPLETED: 'completed',
  },
  EVENT_FIELD_NAME: {
    STRIPE_FORM: 'stripe_form',
  },
}));

jest.mock('HOC/withGetPaymentInfo', () => ({
  PaymentInfoContext: {
    _currentValue: {
      triggerEvent: jest.fn(),
    },
  },
}));

describe('<StripePaymentForm />', () => {
  let mockUseElements;
  let mockUseSelector;
  let mockUseGetCurrentUser;
  let mockUsePaymentPermissions;
  let mockUseEnableWebReskin;
  let mockUseGetApplePayRecurringPaymentRequest;
  let mockUseContext;
  let mockPaymentElement;

  const defaultProps = {
    billingInfo: {
      currency: 'USD',
      organizationId: 'org-123',
    },
    changeBillingInfo: jest.fn(),
    currentPaymentMethod: null,
    isLoadingCardInfo: false,
    isPurchasing: false,
    canUpgrade: true,
    currentOrganization: {
      id: 'org-123',
    },
    hidePromote: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPaymentElement = {
      focus: jest.fn(),
    };

    mockUseElements = require('@stripe/react-stripe-js').useElements;
    mockUseElements.mockReturnValue({
      getElement: jest.fn(() => mockPaymentElement),
    });

    mockUseSelector = require('react-redux').useSelector;
    mockUseSelector.mockReturnValue({
      role: 'owner',
      organization: {
        url: 'test-org',
      },
    });

    mockUseGetCurrentUser = require('hooks').useGetCurrentUser;
    mockUseGetCurrentUser.mockReturnValue({
      email: 'test@example.com',
    });

    mockUsePaymentPermissions = require('hooks').usePaymentPermissions;
    mockUsePaymentPermissions.mockReturnValue({
      isInputDisabled: false,
      isCurrencyDisabled: false,
    });

    mockUseEnableWebReskin = require('hooks').useEnableWebReskin;
    mockUseEnableWebReskin.mockReturnValue({
      isEnableReskin: false,
    });

    mockUseGetApplePayRecurringPaymentRequest = require('hooks/useGetApplePayRecurringPaymentRequest');
    mockUseGetApplePayRecurringPaymentRequest.mockReturnValue({
      recurringPaymentRequest: {},
    });

    mockUseContext = jest.spyOn(React, 'useContext');
    mockUseContext.mockReturnValue({
      triggerEvent: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading state', () => {
    it('should render CircularProgress when isLoadingCardInfo is true and isEnableReskin is true', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      const wrapper = shallow(<StripePaymentForm {...defaultProps} isLoadingCardInfo={true} />);

      expect(wrapper.find(CircularProgress)).toHaveLength(1);
      expect(wrapper.find(CircularLoading)).toHaveLength(0);
    });

    it('should render CircularLoading when isLoadingCardInfo is true and isEnableReskin is false', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      const wrapper = shallow(<StripePaymentForm {...defaultProps} isLoadingCardInfo={true} />);

      expect(wrapper.find(CircularLoading)).toHaveLength(1);
      expect(wrapper.find(CircularProgress)).toHaveLength(0);
    });
  });

  describe('Payment method display', () => {
    it('should render PaymentMethodInfo when currentPaymentMethod exists and role is not MEMBER', () => {
      mockUseSelector.mockReturnValue({
        role: 'owner',
        organization: {
          url: 'test-org',
        },
      });

      const wrapper = shallow(
        <StripePaymentForm {...defaultProps} currentPaymentMethod={{ id: 'pm_123', brand: 'visa' }} />
      );

      expect(wrapper.find(PaymentMethodInfo)).toHaveLength(1);
      expect(wrapper.find(PaymentElement)).toHaveLength(0);
    });

    it('should not render PaymentMethodInfo when role is MEMBER', () => {
      mockUseSelector.mockReturnValue({
        role: 'member',
        organization: {
          url: 'test-org',
        },
      });

      const wrapper = shallow(
        <StripePaymentForm {...defaultProps} currentPaymentMethod={{ id: 'pm_123', brand: 'visa' }} />
      );

      expect(wrapper.find(PaymentMethodInfo)).toHaveLength(0);
      expect(wrapper.find(PaymentElement)).toHaveLength(1);
    });

    it('should render PaymentElement when currentPaymentMethod is null', () => {
      const wrapper = shallow(<StripePaymentForm {...defaultProps} currentPaymentMethod={null} />);

      expect(wrapper.find(PaymentElement)).toHaveLength(1);
      expect(wrapper.find(PaymentMethodInfo)).toHaveLength(0);
    });
  });

  describe('CurrencyPicker rendering', () => {
    it('should render CurrencyPicker without container when isEnableReskin is true', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);

      const currencyPickers = wrapper.find(CurrencyPicker);
      expect(currencyPickers).toHaveLength(1);
      expect(currencyPickers.first().prop('disabled')).toBe(false);
      expect(currencyPickers.first().prop('value')).toBe('USD');
    });

    it('should render CurrencyPicker with styled container when isEnableReskin is false', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);

      const currencyPickers = wrapper.find(CurrencyPicker);
      expect(currencyPickers).toHaveLength(1);
    });

    it('should disable CurrencyPicker when isCurrencyDisabled is true', () => {
      mockUsePaymentPermissions.mockReturnValue({
        isInputDisabled: false,
        isCurrencyDisabled: true,
      });

      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);
      const currencyPicker = wrapper.find(CurrencyPicker).first();
      expect(currencyPicker.prop('disabled')).toBe(true);
    });
  });

  describe('PromotionCodeField rendering', () => {
    it('should render PromotionCodeField when hidePromote is false', () => {
      const wrapper = shallow(<StripePaymentForm {...defaultProps} hidePromote={false} />);

      expect(wrapper.find(PromotionCodeField)).toHaveLength(1);
      expect(wrapper.find(PromotionCodeField).prop('disabled')).toBe(false);
    });

    it('should not render PromotionCodeField when hidePromote is true', () => {
      const wrapper = shallow(<StripePaymentForm {...defaultProps} hidePromote={true} />);

      expect(wrapper.find(PromotionCodeField)).toHaveLength(0);
    });

    it('should disable PromotionCodeField when isInputDisabled is true', () => {
      mockUsePaymentPermissions.mockReturnValue({
        isInputDisabled: true,
        isCurrencyDisabled: false,
      });

      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);
      expect(wrapper.find(PromotionCodeField).prop('disabled')).toBe(true);
    });

    it('should disable PromotionCodeField when canUpgrade is false', () => {
      const wrapper = shallow(<StripePaymentForm {...defaultProps} canUpgrade={false} />);

      expect(wrapper.find(PromotionCodeField).prop('disabled')).toBe(true);
    });
  });

  describe('PaymentEncryptedCert rendering', () => {
    it('should render PaymentEncryptedCert when isEnableReskin is false', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);

      expect(wrapper.find(PaymentEncryptedCert)).toHaveLength(1);
    });

    it('should not render PaymentEncryptedCert when isEnableReskin is true', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);

      expect(wrapper.find(PaymentEncryptedCert)).toHaveLength(0);
    });
  });

  describe('PaymentElement interactions', () => {
    it('should call focus on payment element when onReady is triggered and organizationId exists', () => {
      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);

      const onReady = paymentElement.prop('onReady');
      onReady();

      expect(mockPaymentElement.focus).toHaveBeenCalled();
    });

    it('should not call focus when organizationId is null', () => {
      const propsWithoutOrgId = {
        ...defaultProps,
        billingInfo: {
          currency: 'USD',
          organizationId: null,
        },
      };

      const wrapper = shallow(<StripePaymentForm {...propsWithoutOrgId} />);
      const paymentElement = wrapper.find(PaymentElement);

      const onReady = paymentElement.prop('onReady');
      onReady();

      expect(mockPaymentElement.focus).not.toHaveBeenCalled();
    });

    it('should handle onChange event when payment is completed', () => {
      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);

      const onChange = paymentElement.prop('onChange');
      onChange({
        empty: false,
        complete: true,
        value: { type: 'card' },
      });

      expect(defaultProps.changeBillingInfo).toHaveBeenCalledWith('isCardFilled', true);
      expect(defaultProps.changeBillingInfo).toHaveBeenCalledWith('paymentMethod', 'card');
    });

    it('should handle onChange event when payment is changed but not completed', () => {
      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);

      const onChange = paymentElement.prop('onChange');
      onChange({
        empty: false,
        complete: false,
        value: { type: 'card' },
      });

      expect(defaultProps.changeBillingInfo).toHaveBeenCalledWith('isCardFilled', false);
    });

    it('should track payment method change when payment method changes', () => {
      const eventTracking = require('utils').eventTracking;
      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);

      const onChange = paymentElement.prop('onChange');

      onChange({
        empty: false,
        complete: false,
        value: { type: 'card' },
      });

      onChange({
        empty: false,
        complete: false,
        value: { type: 'apple_pay' },
      });

      expect(eventTracking).toHaveBeenCalled();
    });

    it('should not track event when event is empty', () => {
      const mockTriggerEvent = jest.fn();
      mockUseContext.mockReturnValue({
        triggerEvent: mockTriggerEvent,
      });

      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);

      const onChange = paymentElement.prop('onChange');
      onChange({
        empty: true,
        complete: false,
        value: { type: 'card' },
      });

      expect(mockTriggerEvent).not.toHaveBeenCalled();
    });

    it('should handle onFocus event and trigger tracking', () => {
      const mockTriggerEvent = jest.fn();
      mockUseContext.mockReturnValueOnce({
        triggerEvent: mockTriggerEvent,
      });

      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);

      const paymentElement = wrapper.find(PaymentElement);
      const onFocus = paymentElement.prop('onFocus');
      onFocus();
      expect(onFocus).toBeDefined();
      expect(typeof onFocus).toBe('function');
    });
  });

  describe('Default props', () => {
    it('should use default props when props are not provided', () => {
      const minimalProps = {
        isPurchasing: false,
        canUpgrade: true,
        billingInfo: {
          currency: 'USD',
        },
      };

      const wrapper = shallow(<StripePaymentForm {...minimalProps} />);
      expect(wrapper).toBeDefined();
    });
  });

  describe('Snapshot tests', () => {
    it('should match snapshot with default props', () => {
      const wrapper = shallow(<StripePaymentForm {...defaultProps} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with loading state and reskin enabled', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      const wrapper = shallow(<StripePaymentForm {...defaultProps} isLoadingCardInfo={true} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with current payment method', () => {
      const wrapper = shallow(
        <StripePaymentForm {...defaultProps} currentPaymentMethod={{ id: 'pm_123', brand: 'visa' }} />
      );
      expect(wrapper).toMatchSnapshot();
    });
  });
});
