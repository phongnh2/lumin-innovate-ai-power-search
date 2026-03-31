import React from 'react';
import { shallow } from 'enzyme';
import { Button, IconButton, InlineMessage } from 'lumin-ui/kiwi-ui';

import CreditCard from '../components/CreditCard';
import { CardForm } from '../components/CardForm';
import PaymentMethodInfoForm from 'luminComponents/PaymentMethodInfo/PaymentMethodInfoForm';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('hooks', () => ({
  useRemovePaymentCard: jest.fn(),
  useTranslation: jest.fn(),
  useMobileMatch: jest.fn(),
}));

jest.mock('../context/SettingBillingFormContext', () => ({
  useSettingBillingFormContext: jest.fn(),
}));

jest.mock('utils', () => ({
  commonUtils: {
    formatTitleCaseByLocale: jest.fn((str) => str),
  },
}));

jest.mock('../components/CardForm', () => ({
  CardForm: jest.fn((): any => null) as jest.Mock,
}));

jest.mock('luminComponents/PaymentMethodInfo/PaymentMethodInfoForm', () => jest.fn((): null => null));

describe('<CreditCard />', () => {
  let mockUseLocation: jest.Mock;
  let mockUseSearchParams: jest.Mock;
  let mockUseRemovePaymentCard: jest.Mock;
  let mockUseTranslation: jest.Mock;
  let mockUseMobileMatch: jest.Mock;
  let mockUseSettingBillingFormContext: jest.Mock;
  let mockSetSearchParams: jest.Mock;
  let mockSetCurrentPaymentMethod: jest.Mock;
  let mockSetIsChangingCard: jest.Mock;
  let mockSetPaymentMethodError: jest.Mock;
  let mockRemovePaymentCard: jest.Mock;
  let mockOnSave: jest.Mock;

  const defaultProps = {
    selectedBilling: {
      _id: 'org-123',
      type: 'ORGANIZATION',
      plan: 'PREMIUM',
      name: 'Test Organization',
      payment: {
        plan: 'PREMIUM',
      },
    },
    currentPaymentMethod: null,
    setCurrentPaymentMethod: null,
    hasAttemptWarning: false,
    onSave: null,
    customerInfo: {
      email: 'test@example.com',
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    mockSetSearchParams = jest.fn();
    mockSetCurrentPaymentMethod = jest.fn();
    mockSetIsChangingCard = jest.fn();
    mockSetPaymentMethodError = jest.fn();
    mockRemovePaymentCard = jest.fn();
    mockOnSave = jest.fn();

    mockUseLocation = require('react-router-dom').useLocation;
    mockUseLocation.mockReturnValue({
      hash: '',
      pathname: '/settings',
    });

    mockUseSearchParams = require('react-router-dom').useSearchParams;
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), mockSetSearchParams]);

    mockUseTranslation = require('hooks').useTranslation;
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key) => key),
    });

    mockUseMobileMatch = require('hooks').useMobileMatch;
    mockUseMobileMatch.mockReturnValue(false);

    mockUseRemovePaymentCard = require('hooks').useRemovePaymentCard;
    mockUseRemovePaymentCard.mockReturnValue({
      removePaymentCard: mockRemovePaymentCard,
    });

    mockUseSettingBillingFormContext = require('../context/SettingBillingFormContext').useSettingBillingFormContext;
    mockUseSettingBillingFormContext.mockReturnValue({
      isChangingCard: false,
      setIsChangingCard: mockSetIsChangingCard,
      savingBillingInfo: false,
      setSavingBillingInfo: jest.fn(),
      paymentMethodError: '',
      setPaymentMethodError: mockSetPaymentMethodError,
    });

    defaultProps.setCurrentPaymentMethod = mockSetCurrentPaymentMethod;
    defaultProps.onSave = mockOnSave;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const wrapper = shallow(<CreditCard {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should render add new card button when no payment method exists and not changing card', () => {
      const wrapper = shallow(<CreditCard {...defaultProps} />);
      const button = wrapper.find(Button);
      expect(button.exists()).toBe(true);
      expect(button.prop('onClick')).toBeDefined();
    });

    it('should render CardForm when changing card', () => {
      mockUseSettingBillingFormContext.mockReturnValue({
        isChangingCard: true,
        setIsChangingCard: mockSetIsChangingCard,
        savingBillingInfo: false,
        setSavingBillingInfo: jest.fn(),
        paymentMethodError: '',
        setPaymentMethodError: mockSetPaymentMethodError,
      });

      const wrapper = shallow(<CreditCard {...defaultProps} />);
      expect(wrapper.find(CardForm).exists()).toBe(true);
    });

    it('should render payment method info when payment method exists and not changing card', () => {
      const propsWithPaymentMethod = {
        ...defaultProps,
        currentPaymentMethod: {
          id: 'pm_123',
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      };

      const wrapper = shallow(<CreditCard {...propsWithPaymentMethod} />);
      expect(wrapper.find(PaymentMethodInfoForm).exists()).toBe(true);
    });

    it('should render edit and delete buttons when payment method exists', () => {
      const propsWithPaymentMethod = {
        ...defaultProps,
        currentPaymentMethod: {
          id: 'pm_123',
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      };

      const wrapper = shallow(<CreditCard {...propsWithPaymentMethod} />);
      const iconButtons = wrapper.find(IconButton);
      expect(iconButtons).toHaveLength(2);
      expect(iconButtons.at(0).prop('icon')).toBe('pencil-lg');
      expect(iconButtons.at(1).prop('icon')).toBe('trash-lg');
    });

    it('should render error message when changing card and error exists', () => {
      mockUseSettingBillingFormContext.mockReturnValue({
        isChangingCard: true,
        setIsChangingCard: mockSetIsChangingCard,
        savingBillingInfo: false,
        setSavingBillingInfo: jest.fn(),
        paymentMethodError: 'Payment failed',
        setPaymentMethodError: mockSetPaymentMethodError,
      });

      const wrapper = shallow(<CreditCard {...defaultProps} />);
      const errorMessage = wrapper.find(InlineMessage);
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.prop('type')).toBe('error');
      expect(errorMessage.prop('message')).toBe('Payment failed');
    });

    it('should not render payment method title when changing card', () => {
      mockUseSettingBillingFormContext.mockReturnValue({
        isChangingCard: true,
        setIsChangingCard: mockSetIsChangingCard,
        savingBillingInfo: false,
        setSavingBillingInfo: jest.fn(),
        paymentMethodError: '',
        setPaymentMethodError: mockSetPaymentMethodError,
      });

      const wrapper = shallow(<CreditCard {...defaultProps} />);
      const title = wrapper.findWhere((node) => node.prop('type') === 'title' && node.prop('size') === 'sm');
      expect(title.exists()).toBe(false);
    });
  });

  describe('User Interactions', () => {
    it('should call setIsChangingCard when add new card button is clicked', () => {
      const wrapper = shallow(<CreditCard {...defaultProps} />);
      const button = wrapper.find(Button);
      button.simulate('click');
      expect(mockSetIsChangingCard).toHaveBeenCalledWith(true);
    });

    it('should call setIsChangingCard when edit button is clicked', () => {
      const propsWithPaymentMethod = {
        ...defaultProps,
        currentPaymentMethod: {
          id: 'pm_123',
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      };

      const wrapper = shallow(<CreditCard {...propsWithPaymentMethod} />);
      const editButton = wrapper.find(IconButton).at(0);
      editButton.simulate('click');
      expect(mockSetIsChangingCard).toHaveBeenCalledWith(true);
    });

    it('should call removePaymentCard when delete button is clicked', () => {
      const propsWithPaymentMethod = {
        ...defaultProps,
        currentPaymentMethod: {
          id: 'pm_123',
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      };

      const wrapper = shallow(<CreditCard {...propsWithPaymentMethod} />);
      const deleteButton = wrapper.find(IconButton).at(1);
      deleteButton.simulate('click');
      expect(mockRemovePaymentCard).toHaveBeenCalled();
    });
  });

  describe('Props Passing', () => {
    it('should pass correct props to CardForm', () => {
      mockUseSettingBillingFormContext.mockReturnValue({
        isChangingCard: true,
        setIsChangingCard: mockSetIsChangingCard,
        savingBillingInfo: false,
        setSavingBillingInfo: jest.fn(),
        paymentMethodError: '',
        setPaymentMethodError: mockSetPaymentMethodError,
      });

      const wrapper = shallow(<CreditCard {...defaultProps} />);
      const cardForm = wrapper.find(CardForm);

      expect(cardForm.prop('selectedBilling')).toEqual(defaultProps.selectedBilling);
      expect(cardForm.prop('customerEmail')).toBe('test@example.com');
      expect(cardForm.prop('hasAttemptWarning')).toBe(false);
      expect(cardForm.prop('onSave')).toBe(mockOnSave);
      expect(cardForm.prop('organizationId')).toBe('org-123');
    });

    it('should pass organizationId as null for personal billing', () => {
      mockUseSettingBillingFormContext.mockReturnValue({
        isChangingCard: true,
        setIsChangingCard: mockSetIsChangingCard,
        savingBillingInfo: false,
        setSavingBillingInfo: jest.fn(),
        paymentMethodError: '',
        setPaymentMethodError: mockSetPaymentMethodError,
      });

      const personalProps = {
        ...defaultProps,
        selectedBilling: {
          ...defaultProps.selectedBilling,
          type: 'PERSONAL',
        },
      };

      const wrapper = shallow(<CreditCard {...personalProps} />);
      const cardForm = wrapper.find(CardForm);

      expect(cardForm.prop('organizationId')).toBe(null);
    });

    it('should pass correct props to PaymentMethodInfoForm', () => {
      const paymentMethod = {
        id: 'pm_123',
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025,
      };

      const propsWithPaymentMethod = {
        ...defaultProps,
        currentPaymentMethod: paymentMethod,
      };

      const wrapper = shallow(<CreditCard {...propsWithPaymentMethod} />);
      const paymentInfo = wrapper.find(PaymentMethodInfoForm);

      expect(paymentInfo.prop('paymentMethod')).toEqual(paymentMethod);
      expect(paymentInfo.prop('isEnableReskin')).toBe(true);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should set full width for add card button on mobile', () => {
      mockUseMobileMatch.mockReturnValue(true);

      const wrapper = shallow(<CreditCard {...defaultProps} />);
      const button = wrapper.find(Button);

      expect(button.prop('maw')).toBe('100%');
    });

    it('should set fixed max width for add card button on desktop', () => {
      mockUseMobileMatch.mockReturnValue(false);

      const wrapper = shallow(<CreditCard {...defaultProps} />);
      const button = wrapper.find(Button);

      expect(button.prop('maw')).toBe(320);
    });
  });

  describe('Query Parameter Setup', () => {
    it('should render correctly when edit query param is present but hash is different', () => {
      const searchParams = new URLSearchParams();
      searchParams.set('edit', 'true');

      mockUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

      mockUseLocation.mockReturnValue({
        hash: '#other-section',
        pathname: '/settings',
      });

      const propsWithPaymentMethod = {
        ...defaultProps,
        currentPaymentMethod: {
          id: 'pm_123',
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      };

      const wrapper = shallow(<CreditCard {...propsWithPaymentMethod} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should render correctly when payment method does not exist with edit param', () => {
      const searchParams = new URLSearchParams();
      searchParams.set('edit', 'true');

      mockUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

      mockUseLocation.mockReturnValue({
        hash: '#billing-info',
        pathname: '/settings',
      });

      const wrapper = shallow(<CreditCard {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Hook Initialization', () => {
    it('should call useRemovePaymentCard with correct parameters', () => {
      const propsWithPaymentMethod = {
        ...defaultProps,
        currentPaymentMethod: {
          id: 'pm_123',
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      };

      shallow(<CreditCard {...propsWithPaymentMethod} />);

      expect(mockUseRemovePaymentCard).toHaveBeenCalledWith({
        selectedItem: defaultProps.selectedBilling,
        setPaymentMethodError: mockSetPaymentMethodError,
        setCurrentPaymentMethod: mockSetCurrentPaymentMethod,
      });
    });
  });
});
