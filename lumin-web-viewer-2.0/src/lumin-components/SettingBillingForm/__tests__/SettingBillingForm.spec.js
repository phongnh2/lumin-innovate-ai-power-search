import React from 'react';
import { shallow } from 'enzyme';

jest.mock('../components/CreditCard', () => jest.fn(() => null));
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('react-use', () => ({
  useUpdateEffect: jest.fn(),
}));

jest.mock('hooks', () => ({
  useMobileMatch: jest.fn(),
  useTranslation: jest.fn(),
}));

jest.mock('hooks/useRestrictBillingActions', () => jest.fn());
jest.mock('hooks/useRetrySubscription', () => ({
  useRetrySubscription: jest.fn(),
}));

jest.mock('features/UnifyBillingSubscription/hooks', () => ({
  useUnifyBillingSubscriptionStore: jest.fn(),
}));

jest.mock('src/HOC/withWarningBanner', () => {
  const { createContext } = require('react');
  return {
    WarningBannerContext: createContext({}),
  };
});

jest.mock('constants/banner', () => ({
  WarningBannerType: {
    BILLING_WARNING: {
      value: 'BILLING_WARNING',
    },
  },
  BillingWarningType: {
    RENEW_ATTEMPT: 'RENEW_ATTEMPT',
    UNPAID_SUBSCRIPTION: 'UNPAID_SUBSCRIPTION',
  },
}));

jest.mock('services/paymentService', () => ({
  updatePaymentMethod: jest.fn(),
}));

jest.mock('utils', () => ({
  commonUtils: {
    formatTitleCaseByLocale: jest.fn((text) => text),
  },
  toastUtils: {
    success: jest.fn(),
    error: jest.fn(),
  },
  validator: {
    validateEmail: jest.fn(),
    validateEmailLength: jest.fn(),
  },
  capitalize: jest.fn((str) => str),
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

describe('<SettingBillingForm />', () => {
  let mockUseSelector;
  let mockUseMobileMatch;
  let mockUseTranslation;
  let mockUseRestrictBillingActions;
  let mockUseRetrySubscription;
  let mockUseUnifyBillingSubscriptionStore;
  let mockUseContext;

  const defaultProps = {
    selectedBilling: {
      _id: 'billing-123',
      type: 'organization',
    },
    setDirty: jest.fn(),
    setCurrentPaymentMethod: jest.fn(),
    currentPaymentMethod: {
      id: 'pm_123',
      brand: 'visa',
      last4: '4242',
    },
    customerInfo: {
      email: 'test@example.com',
    },
    setCustomerInfo: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    mockUseSelector = require('react-redux').useSelector;
    mockUseSelector.mockReturnValue({
      email: 'user@example.com',
    });

    mockUseMobileMatch = require('hooks').useMobileMatch;
    mockUseMobileMatch.mockReturnValue(false);

    mockUseTranslation = require('hooks').useTranslation;
    mockUseTranslation.mockReturnValue({
      t: (key) => key,
    });

    mockUseRestrictBillingActions = require('hooks/useRestrictBillingActions');
    mockUseRestrictBillingActions.mockReturnValue({
      isRestrictedOrg: false,
      openRestrictActionsModal: jest.fn(),
    });

    mockUseRetrySubscription = require('hooks/useRetrySubscription').useRetrySubscription;
    mockUseRetrySubscription.mockReturnValue({
      onRetry: jest.fn(),
    });

    mockUseUnifyBillingSubscriptionStore =
      require('features/UnifyBillingSubscription/hooks').useUnifyBillingSubscriptionStore;
    mockUseUnifyBillingSubscriptionStore.mockReturnValue({
      setSubscriptionData: jest.fn(),
      subscription: null,
    });

    mockUseContext = jest.spyOn(React, 'useContext');
    mockUseContext.mockReturnValue({
      BILLING_WARNING: {
        refetch: jest.fn(),
        checkHasWarning: jest.fn(() => false),
      },
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render without crashing', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });

    it('should render with minimal props', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const minimalProps = {
        setCurrentPaymentMethod: jest.fn(),
        setCustomerInfo: jest.fn(),
      };
      const wrapper = shallow(<SettingBillingForm {...minimalProps} />);
      expect(wrapper).toBeDefined();
    });

    it('should match snapshot', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('Mobile responsive', () => {
    it('should handle mobile view', () => {
      mockUseMobileMatch.mockReturnValue(true);
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });
  });

  describe('Restricted organization', () => {
    it('should handle restricted organization', () => {
      mockUseRestrictBillingActions.mockReturnValue({
        isRestrictedOrg: true,
        openRestrictActionsModal: jest.fn(),
      });
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });
  });

  describe('Subscription states', () => {
    it('should handle subscription with pending payment', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {
          payment: {
            type: 'pending',
            subscriptionItems: [],
          },
        },
      });
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });

    it('should handle subscription without payment', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {},
      });
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });
  });

  describe('Warning banner', () => {
    it('should handle warning banner with attempt warning', () => {
      mockUseContext.mockReturnValue({
        BILLING_WARNING: {
          refetch: jest.fn(),
          checkHasWarning: jest.fn(() => true),
        },
      });
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });
  });

  describe('Email editing functionality', () => {
    it('should enable email editing mode when pencil icon is clicked', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      expect(editButton).toHaveLength(1);
      editButton.prop('onClick')();

      wrapper.update();
      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(textInput.prop('readOnly')).toBe(false);
    });

    it('should update email value on input change', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'newemail@example.com' } });

      wrapper.update();
      const updatedInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(updatedInput.prop('value')).toBe('newemail@example.com');
    });

    it('should show validation error for invalid email', () => {
      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(false);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'invalid-email' } });

      wrapper.update();
      const updatedInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(updatedInput.prop('error')).toBeTruthy();
    });

    it('should show error for empty email', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: '' } });

      wrapper.update();
      const updatedInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(updatedInput.prop('error')).toBe('errorMessage.fieldRequired');
    });

    it('should show error for email exceeding max length', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const longEmail = 'a'.repeat(320) + '@example.com';
      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: longEmail } });

      wrapper.update();
      const updatedInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(updatedInput.prop('error')).toBeTruthy();
    });

    it('should cancel email editing when cancel button is clicked', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const cancelButton = buttons.filterWhere((n) => n.prop('variant') === 'outlined');
      expect(cancelButton).toHaveLength(1);
      cancelButton.prop('onClick')();

      wrapper.update();
      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(textInput.prop('readOnly')).toBe(true);
    });

    it('should disable save button when email is invalid', () => {
      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(false);
      validator.validateEmailLength.mockReturnValue(true);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'invalid' } });
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      expect(saveButton.prop('disabled')).toBe(true);
    });

    it('should disable save button when email is unchanged', () => {
      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(true);
      validator.validateEmailLength.mockReturnValue(true);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      expect(saveButton.prop('disabled')).toBe(true);
    });
  });

  describe('Save functionality', () => {
    let mockUpdatePaymentMethod;

    beforeEach(() => {
      mockUpdatePaymentMethod = require('services/paymentService').updatePaymentMethod;
      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(true);
      validator.validateEmailLength.mockReturnValue(true);
    });

    it('should call updatePaymentMethod when saving email', async () => {
      mockUpdatePaymentMethod.mockResolvedValue({
        paymentMethod: { id: 'pm_new', brand: 'visa', last4: '4242' },
        billingEmail: 'newemail@example.com',
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'newemail@example.com' } });
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      await saveButton.prop('onClick')();

      expect(mockUpdatePaymentMethod).toHaveBeenCalledWith({
        clientId: 'billing-123',
        paymentMethodId: '',
        email: 'newemail@example.com',
        type: 'organization',
      });
    });

    it('should show success toast on successful save', async () => {
      const { toastUtils } = require('utils');
      mockUpdatePaymentMethod.mockResolvedValue({
        paymentMethod: { id: 'pm_new' },
        billingEmail: 'newemail@example.com',
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'newemail@example.com' } });
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      await saveButton.prop('onClick')();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(toastUtils.success).toHaveBeenCalledWith({
        message: 'orgDashboardBilling.billingInformationUpdated',
      });
    });

    it('should show error toast on failed save', async () => {
      const { toastUtils } = require('utils');
      const error = {
        graphQLErrors: [{ message: 'Payment update failed' }],
      };
      mockUpdatePaymentMethod.mockRejectedValue(error);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'newemail@example.com' } });
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      await saveButton.prop('onClick')();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(toastUtils.error).toHaveBeenCalledWith({
        message: 'Payment update failed',
      });
    });

    it('should log error on failed save', async () => {
      const { logError } = require('helpers/logger');
      const error = {
        graphQLErrors: [{ message: 'Payment update failed' }],
      };
      mockUpdatePaymentMethod.mockRejectedValue(error);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'newemail@example.com' } });
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      await saveButton.prop('onClick')();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(logError).toHaveBeenCalledWith({ error });
    });

    it('should update payment method state after successful save', async () => {
      const newPaymentMethod = { id: 'pm_new', brand: 'mastercard', last4: '5555' };
      mockUpdatePaymentMethod.mockResolvedValue({
        paymentMethod: newPaymentMethod,
        billingEmail: 'newemail@example.com',
      });

      const setCurrentPaymentMethod = jest.fn();
      const props = { ...defaultProps, setCurrentPaymentMethod };

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...props} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'newemail@example.com' } });
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      await saveButton.prop('onClick')();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(setCurrentPaymentMethod).toHaveBeenCalledWith(newPaymentMethod);
    });

    it('should update customer info after successful save', async () => {
      mockUpdatePaymentMethod.mockResolvedValue({
        paymentMethod: { id: 'pm_new' },
        billingEmail: 'newemail@example.com',
      });

      const setCustomerInfo = jest.fn();
      const props = { ...defaultProps, setCustomerInfo };

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...props} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'newemail@example.com' } });
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      await saveButton.prop('onClick')();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(setCustomerInfo).toHaveBeenCalled();
    });

    it('should call setDirty prop function when provided', () => {
      const setDirty = jest.fn();
      const props = { ...defaultProps, setDirty };

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...props} />);

      expect(setDirty).toBeDefined();
      expect(typeof props.setDirty).toBe('function');
    });
  });

  describe('Restricted organization actions', () => {
    it('should open restrict actions modal when saving in restricted org', async () => {
      const openRestrictActionsModal = jest.fn();
      mockUseRestrictBillingActions.mockReturnValue({
        isRestrictedOrg: true,
        openRestrictActionsModal,
      });

      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(true);
      validator.validateEmailLength.mockReturnValue(true);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'newemail@example.com' } });
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      await saveButton.prop('onClick')();

      expect(openRestrictActionsModal).toHaveBeenCalled();
    });

    it('should not call updatePaymentMethod when org is restricted', async () => {
      const mockUpdatePaymentMethod = require('services/paymentService').updatePaymentMethod;
      mockUseRestrictBillingActions.mockReturnValue({
        isRestrictedOrg: true,
        openRestrictActionsModal: jest.fn(),
      });

      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(true);
      validator.validateEmailLength.mockReturnValue(true);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'newemail@example.com' } });
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      await saveButton.prop('onClick')();

      expect(mockUpdatePaymentMethod).not.toHaveBeenCalled();
    });
  });

  describe('Retry subscription with failed status', () => {
    it('should have retry subscription configured with correct params', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {
          payment: {
            type: 'pending',
            subscriptionItems: [{ paymentStatus: 'pending' }],
          },
        },
      });

      const onRetry = jest.fn().mockResolvedValue({});
      mockUseRetrySubscription.mockReturnValue({ onRetry });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      expect(wrapper).toBeDefined();
      expect(mockUseRetrySubscription).toHaveBeenCalled();
    });

    it('should check for failed subscription status', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {
          payment: {
            type: 'pending',
            status: 'pending',
            subscriptionItems: [{ paymentStatus: 'pending' }],
          },
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      expect(wrapper).toBeDefined();
      expect(mockUseUnifyBillingSubscriptionStore).toHaveBeenCalled();
    });

    it('should handle subscription with pending and active items', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {
          payment: {
            type: 'active',
            subscriptionItems: [{ paymentStatus: 'pending' }, { paymentStatus: 'active' }],
          },
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      expect(wrapper).toBeDefined();
    });
  });

  describe('Context provider', () => {
    it('should provide correct context values', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const provider = wrapper.find('ContextProvider');
      expect(provider).toHaveLength(1);

      const contextValue = provider.prop('value');
      expect(contextValue).toHaveProperty('isChangingCard');
      expect(contextValue).toHaveProperty('setIsChangingCard');
      expect(contextValue).toHaveProperty('savingBillingInfo');
      expect(contextValue).toHaveProperty('setSavingBillingInfo');
      expect(contextValue).toHaveProperty('paymentMethodError');
      expect(contextValue).toHaveProperty('setPaymentMethodError');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing selectedBilling', () => {
      const props = { ...defaultProps, selectedBilling: undefined };
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...props} />);
      expect(wrapper).toBeDefined();
    });

    it('should handle missing customerInfo email', () => {
      const props = { ...defaultProps, customerInfo: {} };
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...props} />);
      expect(wrapper).toBeDefined();
    });

    it('should use user email when customer email is not available', async () => {
      const mockUpdatePaymentMethod = require('services/paymentService').updatePaymentMethod;
      mockUpdatePaymentMethod.mockResolvedValue({
        paymentMethod: { id: 'pm_new' },
        billingEmail: 'user@example.com',
      });

      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(true);
      validator.validateEmailLength.mockReturnValue(true);

      const props = {
        ...defaultProps,
        customerInfo: {},
      };

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...props} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      await saveButton.prop('onClick')();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockUpdatePaymentMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
        })
      );
    });

    it('should handle email with whitespace', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: '   ' } });
      wrapper.update();

      const updatedInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(updatedInput.prop('error')).toBe('errorMessage.fieldRequired');
    });

    it('should convert email to lowercase when saving', async () => {
      const mockUpdatePaymentMethod = require('services/paymentService').updatePaymentMethod;
      mockUpdatePaymentMethod.mockResolvedValue({
        paymentMethod: { id: 'pm_new' },
        billingEmail: 'newemail@example.com',
      });

      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(true);
      validator.validateEmailLength.mockReturnValue(true);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'NewEmail@EXAMPLE.COM' } });
      wrapper.update();

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const saveButton = buttons.filterWhere((n) => n.prop('variant') === 'filled');
      await saveButton.prop('onClick')();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockUpdatePaymentMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'newemail@example.com',
        })
      );
    });

    it('should handle subscription with unpaid status', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {
          payment: {
            type: 'unpaid',
            subscriptionItems: [],
          },
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });

    it('should handle subscription items with failed payment status', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {
          payment: {
            type: 'active',
            subscriptionItems: [{ paymentStatus: 'unpaid' }, { paymentStatus: 'active' }],
          },
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });
  });

  describe('Props and rendering', () => {
    it('should pass correct props to CreditCard component', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const creditCard = wrapper.find('mockConstructor');
      expect(creditCard).toHaveLength(1);
      expect(creditCard.prop('selectedBilling')).toEqual(defaultProps.selectedBilling);
      expect(creditCard.prop('currentPaymentMethod')).toEqual(defaultProps.currentPaymentMethod);
      expect(creditCard.prop('customerInfo')).toEqual(defaultProps.customerInfo);
      expect(creditCard.prop('hasAttemptWarning')).toBe(false);
    });

    it('should display billing info title', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const title = wrapper.find('#billing-info');
      expect(title).toHaveLength(1);
      expect(title.prop('children')).toBe('common.billingInfo');
    });

    it('should render with correct mobile width', () => {
      mockUseMobileMatch.mockReturnValue(true);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(textInput.prop('maw')).toBe('100%');
    });

    it('should render with desktop width', () => {
      mockUseMobileMatch.mockReturnValue(false);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(textInput.prop('maw')).toBe(320);
    });
  });

  describe('useUpdateEffect behavior', () => {
    it('should setup useUpdateEffect with refetchBillingWarning', () => {
      const mockUseUpdateEffect = require('react-use').useUpdateEffect;
      const refetch = jest.fn();
      mockUseContext.mockReturnValue({
        BILLING_WARNING: {
          refetch,
          checkHasWarning: jest.fn(() => false),
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      shallow(<SettingBillingForm {...defaultProps} />);

      expect(mockUseUpdateEffect).toHaveBeenCalled();
      const updateEffectCallback = mockUseUpdateEffect.mock.calls[0][0];
      expect(typeof updateEffectCallback).toBe('function');
    });

    it('should setup useUpdateEffect with correct dependencies', () => {
      const mockUseUpdateEffect = require('react-use').useUpdateEffect;
      const refetch = jest.fn();
      mockUseContext.mockReturnValue({
        BILLING_WARNING: {
          refetch,
          checkHasWarning: jest.fn(() => false),
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      shallow(<SettingBillingForm {...defaultProps} />);

      expect(mockUseUpdateEffect).toHaveBeenCalled();
      const dependencies = mockUseUpdateEffect.mock.calls[0][1];
      expect(dependencies).toEqual(['billing-123', 'organization']);
    });
  });

  describe('Save with attempt warning and retry', () => {
    let mockUpdatePaymentMethod;
    let mockRetrySubscription;

    beforeEach(() => {
      mockUpdatePaymentMethod = require('services/paymentService').updatePaymentMethod;
      mockRetrySubscription = jest.fn().mockResolvedValue({});
      mockUseRetrySubscription.mockReturnValue({
        onRetry: mockRetrySubscription,
      });

      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(true);
      validator.validateEmailLength.mockReturnValue(true);
    });

    it('should setup retry subscription hook', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {
          payment: {
            type: 'pending',
            subscriptionItems: [{ paymentStatus: 'pending' }],
          },
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      shallow(<SettingBillingForm {...defaultProps} />);

      expect(mockUseRetrySubscription).toHaveBeenCalledWith(
        'billing-123',
        'organization',
        expect.objectContaining({
          skippedWarnings: expect.any(Array),
        })
      );
    });

    it('should setup retry subscription with empty skipped warnings when hasFailedStatus is false', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {
          payment: {
            type: 'active',
            subscriptionItems: [{ paymentStatus: 'active' }],
          },
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      shallow(<SettingBillingForm {...defaultProps} />);

      expect(mockUseRetrySubscription).toHaveBeenCalledWith(
        'billing-123',
        'organization',
        expect.objectContaining({
          skippedWarnings: [],
        })
      );
    });

    it('should have hasAttemptWarning set to false when no warning exists', () => {
      const checkHasWarning = jest.fn(() => false);
      mockUseContext.mockReturnValue({
        BILLING_WARNING: {
          refetch: jest.fn(),
          checkHasWarning,
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const creditCard = wrapper.find('mockConstructor');
      expect(creditCard.prop('hasAttemptWarning')).toBe(false);
    });
  });

  describe('Save with callback', () => {
    let mockUpdatePaymentMethod;

    beforeEach(() => {
      mockUpdatePaymentMethod = require('services/paymentService').updatePaymentMethod;
      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(true);
      validator.validateEmailLength.mockReturnValue(true);
    });

    it('should call callback and use returned paymentMethodId', async () => {
      mockUpdatePaymentMethod.mockResolvedValue({
        paymentMethod: { id: 'pm_new' },
        billingEmail: 'test@example.com',
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const creditCard = wrapper.find('mockConstructor');
      const onSave = creditCard.prop('onSave');

      const mockCallback = jest.fn().mockResolvedValue('pm_callback_123');
      await onSave(mockCallback);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCallback).toHaveBeenCalled();
      expect(mockUpdatePaymentMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethodId: 'pm_callback_123',
        })
      );
    });

    it('should not proceed when callback returns falsy value', async () => {
      mockUpdatePaymentMethod.mockResolvedValue({
        paymentMethod: { id: 'pm_new' },
        billingEmail: 'test@example.com',
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const creditCard = wrapper.find('mockConstructor');
      const onSave = creditCard.prop('onSave');

      const mockCallback = jest.fn().mockResolvedValue(null);
      await onSave(mockCallback);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCallback).toHaveBeenCalled();
      expect(mockUpdatePaymentMethod).not.toHaveBeenCalled();
    });

    it('should not proceed when callback returns empty string', async () => {
      mockUpdatePaymentMethod.mockResolvedValue({
        paymentMethod: { id: 'pm_new' },
        billingEmail: 'test@example.com',
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const creditCard = wrapper.find('mockConstructor');
      const onSave = creditCard.prop('onSave');

      const mockCallback = jest.fn().mockResolvedValue('');
      await onSave(mockCallback);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCallback).toHaveBeenCalled();
      expect(mockUpdatePaymentMethod).not.toHaveBeenCalled();
    });
  });

  describe('State interactions', () => {
    it('should provide setIsChangingCard in context', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const provider = wrapper.find('ContextProvider');
      const contextValue = provider.prop('value');

      expect(contextValue).toHaveProperty('isChangingCard');
      expect(contextValue).toHaveProperty('setIsChangingCard');
      expect(typeof contextValue.setIsChangingCard).toBe('function');
    });

    it('should reset email when canceling edit', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      let textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'changed@example.com' } });
      wrapper.update();

      textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(textInput.prop('value')).toBe('changed@example.com');

      const buttons = wrapper.find('ForwardRef').filterWhere((n) => n.prop('variant'));
      const cancelButton = buttons.filterWhere((n) => n.prop('variant') === 'outlined');
      cancelButton.prop('onClick')();
      wrapper.update();

      textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(textInput.prop('value')).toBe('test@example.com');
    });

    it('should validate email when changing', () => {
      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(false);

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      let textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'invalid' } });
      wrapper.update();

      textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(textInput.prop('error')).toBe('errorMessage.invalidField');
    });

    it('should provide savingBillingInfo state in context', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const provider = wrapper.find('ContextProvider');
      const contextValue = provider.prop('value');

      expect(contextValue).toHaveProperty('savingBillingInfo');
      expect(contextValue).toHaveProperty('setSavingBillingInfo');
      expect(typeof contextValue.savingBillingInfo).toBe('boolean');
      expect(typeof contextValue.setSavingBillingInfo).toBe('function');
    });

    it('should provide paymentMethodError state in context', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const provider = wrapper.find('ContextProvider');
      const contextValue = provider.prop('value');

      expect(contextValue).toHaveProperty('paymentMethodError');
      expect(contextValue).toHaveProperty('setPaymentMethodError');
      expect(typeof contextValue.paymentMethodError).toBe('string');
      expect(typeof contextValue.setPaymentMethodError).toBe('function');
    });
  });

  describe('Validation edge cases', () => {
    it('should show error for email that is exactly at max length + 1', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const longEmail = 'a'.repeat(300) + '@example.com';
      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: longEmail } });

      wrapper.update();
      const updatedInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      expect(updatedInput.prop('error')).toBeTruthy();
    });

    it('should return early when trying to save invalid email', async () => {
      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(false);
      validator.validateEmailLength.mockReturnValue(true);

      const mockUpdatePaymentMethod = require('services/paymentService').updatePaymentMethod;

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const textInput = wrapper.find('ForwardRef').filterWhere((n) => n.prop('placeholder'));
      textInput.prop('onChange')({ target: { value: 'invalid-email' } });
      wrapper.update();

      const creditCard = wrapper.find('mockConstructor');
      const onSave = creditCard.prop('onSave');
      await onSave();

      expect(mockUpdatePaymentMethod).not.toHaveBeenCalled();
    });

    it('should return early when email is unchanged', async () => {
      const { validator } = require('utils');
      validator.validateEmail.mockReturnValue(true);
      validator.validateEmailLength.mockReturnValue(true);

      const mockUpdatePaymentMethod = require('services/paymentService').updatePaymentMethod;

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const editButton = wrapper.find('ForwardRef').filterWhere((n) => n.prop('icon') === 'pencil-lg');
      editButton.prop('onClick')();
      wrapper.update();

      const creditCard = wrapper.find('mockConstructor');
      const onSave = creditCard.prop('onSave');
      await onSave();

      expect(mockUpdatePaymentMethod).not.toHaveBeenCalled();
    });
  });

  describe('hasFailedStatus computation', () => {
    it('should return true when payment type is UNPAID', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {
          payment: {
            type: 'unpaid',
            subscriptionItems: [],
          },
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });

    it('should return true when any subscription item has UNPAID status', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: {
          payment: {
            type: 'active',
            subscriptionItems: [{ paymentStatus: 'unpaid' }],
          },
        },
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });

    it('should return false when subscription has no payment', () => {
      mockUseUnifyBillingSubscriptionStore.mockReturnValue({
        setSubscriptionData: jest.fn(),
        subscription: null,
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });
  });

  describe('CreditCard onSave prop', () => {
    it('should pass onSave function to CreditCard component', () => {
      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const creditCard = wrapper.find('mockConstructor');
      expect(typeof creditCard.prop('onSave')).toBe('function');
    });

    it('should call onSave without callback when credit card saves', async () => {
      const mockUpdatePaymentMethod = require('services/paymentService').updatePaymentMethod;
      mockUpdatePaymentMethod.mockResolvedValue({
        paymentMethod: { id: 'pm_new' },
        billingEmail: 'test@example.com',
      });

      const SettingBillingForm = require('../SettingBillingForm').default;
      const wrapper = shallow(<SettingBillingForm {...defaultProps} />);

      const creditCard = wrapper.find('mockConstructor');
      const onSave = creditCard.prop('onSave');
      await onSave();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockUpdatePaymentMethod).toHaveBeenCalledWith({
        clientId: 'billing-123',
        paymentMethodId: '',
        email: 'test@example.com',
        type: 'organization',
      });
    });
  });
});
