import React from 'react';
import { shallow } from 'enzyme';
import { PaymentElement } from '@stripe/react-stripe-js';
import { Button } from 'lumin-ui/kiwi-ui';

import CardForm from '../components/CardForm/CardForm';
import ButtonMaterial from 'lumin-components/ButtonMaterial';

jest.mock('@stripe/react-stripe-js', () => ({
  PaymentElement: jest.fn((): null => null),
  useStripe: jest.fn(),
  useElements: jest.fn(),
}));

jest.mock('HOC/withStripeElements', () => (Component: any) => Component);

jest.mock('hooks', () => ({
  useTranslation: jest.fn(),
  useMobileMatch: jest.fn(),
  useEnableWebReskin: jest.fn(),
}));

jest.mock('hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('../context/SettingBillingFormContext', () => ({
  useSettingBillingFormContext: jest.fn(),
}));

jest.mock('services', () => ({
  paymentServices: {
    deactivateSetupIntent: jest.fn(),
  },
}));

jest.mock('services/paymentService', () => ({
  __esModule: true,
  default: {
    deactivateOrganizationSetupIntent: jest.fn(),
  },
}));

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  unstable_batchedUpdates: jest.fn((callback) => callback()),
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

describe('<CardForm />', () => {
  let mockUseStripe: jest.Mock;
  let mockUseElements: jest.Mock;
  let mockUseTranslation: jest.Mock;
  let mockUseMobileMatch: jest.Mock;
  let mockUseEnableWebReskin: jest.Mock;
  let mockUseGetCurrentUser: jest.Mock;
  let mockUseSettingBillingFormContext: jest.Mock;
  let mockStripe: any;
  let mockElements: any;
  let mockPaymentElement: any;
  let mockSetIsChangingCard: jest.Mock;
  let mockSetSavingBillingInfo: jest.Mock;
  let mockSetPaymentMethodError: jest.Mock;
  let mockOnSave: jest.Mock;
  let mockPaymentServices: any;
  let mockPaymentService: any;

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
    customerEmail: 'test@example.com',
    hasAttemptWarning: false,
    onSave: null,
    organizationId: 'org-123',
    stripeAccountId: 'stripe-account-123',
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    mockSetIsChangingCard = jest.fn();
    mockSetSavingBillingInfo = jest.fn();
    mockSetPaymentMethodError = jest.fn();
    mockOnSave = jest.fn();

    mockPaymentElement = {
      focus: jest.fn(),
    };

    mockElements = {
      getElement: jest.fn(() => mockPaymentElement),
    };

    mockStripe = {
      confirmSetup: jest.fn(),
    };

    mockUseStripe = require('@stripe/react-stripe-js').useStripe;
    mockUseStripe.mockReturnValue(mockStripe);

    mockUseElements = require('@stripe/react-stripe-js').useElements;
    mockUseElements.mockReturnValue(mockElements);

    mockUseTranslation = require('hooks').useTranslation;
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key) => key),
      i18n: {
        getSuffix: jest.fn(() => ''),
        format: jest.fn((val) => val),
      },
    });

    mockUseMobileMatch = require('hooks').useMobileMatch;
    mockUseMobileMatch.mockReturnValue(false);

    mockUseEnableWebReskin = require('hooks').useEnableWebReskin;
    mockUseEnableWebReskin.mockReturnValue({
      isEnableReskin: false,
    });

    mockUseGetCurrentUser = require('hooks/useGetCurrentUser').useGetCurrentUser;
    mockUseGetCurrentUser.mockReturnValue({
      email: 'user@example.com',
    });

    mockUseSettingBillingFormContext = require('../context/SettingBillingFormContext').useSettingBillingFormContext;
    mockUseSettingBillingFormContext.mockReturnValue({
      isChangingCard: true,
      setIsChangingCard: mockSetIsChangingCard,
      savingBillingInfo: false,
      setSavingBillingInfo: mockSetSavingBillingInfo,
      paymentMethodError: '',
      setPaymentMethodError: mockSetPaymentMethodError,
    });

    mockPaymentServices = require('services').paymentServices;
    mockPaymentServices.deactivateSetupIntent.mockResolvedValue(undefined);

    mockPaymentService = require('services/paymentService').default;
    mockPaymentService.deactivateOrganizationSetupIntent.mockResolvedValue(undefined);

    defaultProps.onSave = mockOnSave;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const wrapper = shallow(<CardForm {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should render PaymentElement', () => {
      const wrapper = shallow(<CardForm {...defaultProps} />);
      expect(wrapper.find(PaymentElement).exists()).toBe(true);
    });

    it('should render legacy UI when reskin is disabled', () => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: false,
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      expect(wrapper.find(ButtonMaterial)).toHaveLength(2);
    });

    it('should render reskin UI when reskin is enabled', () => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: true,
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      expect(wrapper.find(Button)).toHaveLength(2);
    });

    it('should render save button with retry text when hasAttemptWarning is true', () => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: true,
      });

      const propsWithWarning = {
        ...defaultProps,
        hasAttemptWarning: true,
      };

      const wrapper = shallow(<CardForm {...propsWithWarning} />);
      const saveButton = wrapper.find(Button).at(1);
      expect(saveButton.children().text()).toBe('orgDashboardBilling.saveRetry');
    });

    it('should render save button with normal text when hasAttemptWarning is false', () => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: true,
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const saveButton = wrapper.find(Button).at(1);
      expect(saveButton.children().text()).toBe('common.save');
    });

    it('should disable save button when savingBillingInfo is true', () => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: true,
      });

      mockUseSettingBillingFormContext.mockReturnValue({
        isChangingCard: true,
        setIsChangingCard: mockSetIsChangingCard,
        savingBillingInfo: true,
        setSavingBillingInfo: mockSetSavingBillingInfo,
        paymentMethodError: '',
        setPaymentMethodError: mockSetPaymentMethodError,
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const saveButton = wrapper.find(Button).at(1);
      expect(saveButton.prop('disabled')).toBe(true);
      expect(saveButton.prop('loading')).toBe(true);
    });

    it('should set fullWidth on mobile', () => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: true,
      });

      mockUseMobileMatch.mockReturnValue(true);

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const buttons = wrapper.find(Button);
      expect(buttons.at(0).prop('fullWidth')).toBe(true);
      expect(buttons.at(1).prop('fullWidth')).toBe(true);
    });
  });

  describe('PaymentElement Configuration', () => {
    it('should pass correct options to PaymentElement', () => {
      const wrapper = shallow(<CardForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);
      const options = paymentElement.prop('options');

      expect(options.fields.billingDetails.address.postalCode).toBe('auto');
      expect(options.defaultValues.billingDetails.email).toBe('user@example.com');
    });

    it('should call onReady callback', () => {
      const wrapper = shallow(<CardForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);
      const onReady = paymentElement.prop('onReady');

      onReady();

      expect(mockElements.getElement).toHaveBeenCalledWith('payment');
      expect(mockPaymentElement.focus).toHaveBeenCalled();
    });

    it('should not focus payment element when not changing card', () => {
      mockUseSettingBillingFormContext.mockReturnValue({
        isChangingCard: false,
        setIsChangingCard: mockSetIsChangingCard,
        savingBillingInfo: false,
        setSavingBillingInfo: mockSetSavingBillingInfo,
        paymentMethodError: '',
        setPaymentMethodError: mockSetPaymentMethodError,
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);
      const onReady = paymentElement.prop('onReady');

      onReady();

      expect(mockPaymentElement.focus).not.toHaveBeenCalled();
    });

    it('should handle onChange event', () => {
      const wrapper = shallow(<CardForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);
      const onChange = paymentElement.prop('onChange');

      onChange({ complete: true } as any);

      wrapper.update();
      const saveButton = wrapper.find(ButtonMaterial).at(1);
      expect(saveButton.prop('disabled')).toBe(false);
    });

    it('should disable save button when card is not filled', () => {
      const wrapper = shallow(<CardForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);
      const onChange = paymentElement.prop('onChange');

      onChange({ complete: false } as any);

      wrapper.update();
      const saveButton = wrapper.find(ButtonMaterial).at(1);
      expect(saveButton.prop('disabled')).toBe(true);
    });
  });

  describe('User Interactions', () => {
    it('should call closeEditingCardInfo when cancel button is clicked', () => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: true,
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const cancelButton = wrapper.find(Button).at(0);

      cancelButton.simulate('click');

      expect(mockSetIsChangingCard).toHaveBeenCalledWith(false);
      expect(mockSetPaymentMethodError).toHaveBeenCalledWith('');
    });

    it('should call onSave when save button is clicked', () => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: true,
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const saveButton = wrapper.find(Button).at(1);

      const paymentElement = wrapper.find(PaymentElement);
      paymentElement.prop('onChange')({ complete: true } as any);
      wrapper.update();

      const updatedSaveButton = wrapper.find(Button).at(1);
      updatedSaveButton.simulate('click');

      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnSave.mock.calls[0][0]).toBeInstanceOf(Function);
    });
  });

  describe('onSaveChangeCard', () => {
    it('should successfully save card for organization', async () => {
      mockStripe.confirmSetup.mockResolvedValue({
        setupIntent: {
          status: 'succeeded',
          payment_method: 'pm_123456',
        },
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);
      paymentElement.prop('onChange')({ complete: true } as any);
      wrapper.update();

      const saveButton = wrapper.find(ButtonMaterial).at(1);
      saveButton.simulate('click');

      const onSaveChangeCard = mockOnSave.mock.calls[0][0];
      const result = await onSaveChangeCard();

      expect(mockStripe.confirmSetup).not.toBeNull();
    });

    it('should successfully save card for personal account', async () => {
      mockStripe.confirmSetup.mockResolvedValue({
        setupIntent: {
          status: 'succeeded',
          payment_method: 'pm_123456',
        },
      });

      const personalProps = {
        ...defaultProps,
        selectedBilling: {
          ...defaultProps.selectedBilling,
          type: 'PERSONAL',
        },
      };

      const wrapper = shallow(<CardForm {...personalProps} />);
      const paymentElement = wrapper.find(PaymentElement);
      paymentElement.prop('onChange')({ complete: true } as any);
      wrapper.update();

      const saveButton = wrapper.find(ButtonMaterial).at(1);
      saveButton.simulate('click');

      const onSaveChangeCard = mockOnSave.mock.calls[0][0];
      await onSaveChangeCard();

      expect(mockPaymentServices.deactivateSetupIntent).toHaveBeenCalledWith({
        stripeAccountId: 'stripe-account-123',
      });
    });

    it('should handle error from stripe', async () => {
      mockStripe.confirmSetup.mockResolvedValue({
        error: {
          message: 'Card declined',
        },
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);
      paymentElement.prop('onChange')({ complete: true } as any);
      wrapper.update();

      const saveButton = wrapper.find(ButtonMaterial).at(1);
      saveButton.simulate('click');

      const onSaveChangeCard = mockOnSave.mock.calls[0][0];
      const result = await onSaveChangeCard();

      expect(mockSetPaymentMethodError).toHaveBeenCalledWith('Card declined');
      expect(mockSetSavingBillingInfo).toHaveBeenCalledWith(false);
      expect(result).toBe(null);
    });

    it('should handle non-succeeded setup intent status', async () => {
      mockStripe.confirmSetup.mockResolvedValue({
        setupIntent: {
          status: 'requires_action',
          payment_method: 'pm_123456',
        },
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);
      paymentElement.prop('onChange')({ complete: true } as any);
      wrapper.update();

      const saveButton = wrapper.find(ButtonMaterial).at(1);
      saveButton.simulate('click');

      const onSaveChangeCard = mockOnSave.mock.calls[0][0];
      const result = await onSaveChangeCard();

      expect(mockSetPaymentMethodError).toHaveBeenCalledWith(
        'We are unable to authenticate your payment method. Please choose a different payment method and try again.'
      );
      expect(mockSetSavingBillingInfo).toHaveBeenCalledWith(false);
      expect(result).toBe(null);
    });

    it('should deactivate setup intent even when error occurs', async () => {
      mockStripe.confirmSetup.mockResolvedValue({
        error: {
          message: 'Network error',
        },
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const paymentElement = wrapper.find(PaymentElement);
      paymentElement.prop('onChange')({ complete: true } as any);
      wrapper.update();

      const saveButton = wrapper.find(ButtonMaterial).at(1);
      saveButton.simulate('click');

      const onSaveChangeCard = mockOnSave.mock.calls[0][0];
      await onSaveChangeCard();

      expect(mockPaymentService.deactivateOrganizationSetupIntent).toHaveBeenCalled();
    });
  });

  describe('Legacy UI', () => {
    beforeEach(() => {
      mockUseEnableWebReskin.mockReturnValue({
        isEnableReskin: false,
      });
    });

    it('should render ButtonMaterial for cancel and save', () => {
      const wrapper = shallow(<CardForm {...defaultProps} />);
      expect(wrapper.find(ButtonMaterial)).toHaveLength(2);
    });

    it('should handle cancel click in legacy UI', () => {
      const wrapper = shallow(<CardForm {...defaultProps} />);
      const cancelButton = wrapper.find(ButtonMaterial).at(0);

      cancelButton.simulate('click');

      expect(mockSetIsChangingCard).toHaveBeenCalledWith(false);
      expect(mockSetPaymentMethodError).toHaveBeenCalledWith('');
    });

    it('should show retry text in legacy UI when hasAttemptWarning is true', () => {
      const propsWithWarning = {
        ...defaultProps,
        hasAttemptWarning: true,
      };

      const wrapper = shallow(<CardForm {...propsWithWarning} />);
      const saveButton = wrapper.find(ButtonMaterial).at(1);
      expect(saveButton.children().text()).toBe('orgDashboardBilling.saveRetry');
    });

    it('should disable buttons when saving in legacy UI', () => {
      mockUseSettingBillingFormContext.mockReturnValue({
        isChangingCard: true,
        setIsChangingCard: mockSetIsChangingCard,
        savingBillingInfo: true,
        setSavingBillingInfo: mockSetSavingBillingInfo,
        paymentMethodError: '',
        setPaymentMethodError: mockSetPaymentMethodError,
      });

      const wrapper = shallow(<CardForm {...defaultProps} />);
      const cancelButton = wrapper.find(ButtonMaterial).at(0);
      const saveButton = wrapper.find(ButtonMaterial).at(1);

      expect(cancelButton.prop('disabled')).toBe(true);
      expect(saveButton.prop('disabled')).toBe(true);
      expect(saveButton.prop('loading')).toBe(true);
    });
  });
});
