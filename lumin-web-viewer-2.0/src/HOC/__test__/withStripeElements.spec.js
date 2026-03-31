import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import withStripeElements from '../withStripeElements';

// Mock Stripe dependencies
const mockElements = jest.fn(({ children }) => <div data-testid="stripe-elements">{children}</div>);
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: (props) => mockElements(props),
}));

const mockLoadStripe = jest.fn();
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: (...args) => mockLoadStripe(...args),
}));

// Mock Redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: jest.fn(),
  useEnableWebReskin: jest.fn(),
  usePaymentFreeTrialPageReskin: jest.fn(),
}));

// Mock useValidateRecaptcha
jest.mock('screens/Payment/hooks/useValidateRecaptcha', () => jest.fn());

// Mock components
jest.mock('lumin-components/AppCircularLoading', () => ({ noTopGap }) => (
  <div data-testid="loading-spinner" data-no-top-gap={noTopGap}>Loading...</div>
));

jest.mock('lumin-components/ErrorBoundary', () => ({ children }) => (
  <div data-testid="error-boundary">{children}</div>
));

// Mock utils
jest.mock('utils/getLanguage', () => ({
  getLanguage: jest.fn(),
}));

// Mock constants
jest.mock('constants/theme/PaymentElement/appearance', () => ({
  Appearance: { theme: 'default' },
  AppearanceNewUI: { theme: 'newUI' },
  AppearanceReskin: { theme: 'reskin' },
}));

jest.mock('constants/theme/PaymentElement/fontInter500', () => ({
  Inter: 'mock-inter-font-base64',
}));

jest.mock('constants/theme/PaymentElement/fonts', () => ({
  AxiformaRegular: 'mock-axiforma-font-base64',
}));

// Import mocked modules
import { useSelector } from 'react-redux';
import { useTranslation, useEnableWebReskin, usePaymentFreeTrialPageReskin } from 'hooks';
import useValidateRecaptcha from 'screens/Payment/hooks/useValidateRecaptcha';
import { getLanguage } from 'utils/getLanguage';

// Test component
const TestComponent = ({ hasClientSecret, getNewSecret, stripeAccountId, testProp }) => (
  <div data-testid="test-component">
    <span data-testid="has-client-secret">{String(hasClientSecret)}</span>
    <span data-testid="stripe-account-id">{stripeAccountId || 'none'}</span>
    <span data-testid="test-prop">{testProp}</span>
    <button data-testid="get-new-secret-btn" onClick={getNewSecret}>Get New Secret</button>
  </div>
);

describe('withStripeElements HOC', () => {
  const mockRefetchSecret = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup environment variable
    process.env.STRIPE_PLATFORM_PUBLIC_KEY = 'pk_test_123';

    // Setup mock loadStripe
    mockLoadStripe.mockReturnValue(Promise.resolve({ stripe: 'instance' }));

    // Setup mock selector
    useSelector.mockReturnValue(false); // isPurchasing = false

    // Setup mock translation
    useTranslation.mockReturnValue({
      t: (key) => key,
    });

    // Setup mock reskin hooks
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    usePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: false });

    // Setup mock language
    getLanguage.mockReturnValue('en');

    // Setup mock useValidateRecaptcha - default successful state
    useValidateRecaptcha.mockReturnValue({
      secretData: {
        clientSecret: 'cs_test_123',
        accountId: 'acct_123',
      },
      refetchSecret: mockRefetchSecret,
      loading: false,
    });
  });

  describe('Rendering', () => {
    it('should render wrapped component inside ErrorBoundary', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent testProp="test-value" />);

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should render wrapped component inside Stripe Elements', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent testProp="test-value" />);

      expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should pass props to wrapped component', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent testProp="custom-value" />);

      expect(screen.getByTestId('test-prop')).toHaveTextContent('custom-value');
    });

    it('should pass hasClientSecret to wrapped component', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(screen.getByTestId('has-client-secret')).toHaveTextContent('true');
    });

    it('should pass stripeAccountId to wrapped component', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(screen.getByTestId('stripe-account-id')).toHaveTextContent('acct_123');
    });

    it('should pass getNewSecret function to wrapped component', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      const button = screen.getByTestId('get-new-secret-btn');
      button.click();

      expect(mockRefetchSecret).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      useValidateRecaptcha.mockReturnValue({
        secretData: null,
        refetchSecret: mockRefetchSecret,
        loading: true,
      });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    it('should pass noTopGap prop to loading spinner when noTopGapLoading is true', () => {
      useValidateRecaptcha.mockReturnValue({
        secretData: null,
        refetchSecret: mockRefetchSecret,
        loading: true,
      });

      const EnhancedComponent = withStripeElements(TestComponent, { 
        action: 'test_action',
        noTopGapLoading: true,
      });

      render(<EnhancedComponent />);

      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-no-top-gap', 'true');
    });

    it('should NOT pass noTopGap when noTopGapLoading is false', () => {
      useValidateRecaptcha.mockReturnValue({
        secretData: null,
        refetchSecret: mockRefetchSecret,
        loading: true,
      });

      const EnhancedComponent = withStripeElements(TestComponent, { 
        action: 'test_action',
        noTopGapLoading: false,
      });

      render(<EnhancedComponent />);

      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-no-top-gap', 'false');
    });
  });

  describe('Error State', () => {
    it('should show error message when form loading failed', () => {
      useValidateRecaptcha.mockReturnValue({
        secretData: null,
        refetchSecret: mockRefetchSecret,
        loading: false,
      });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent isFetchedCard={true} currentPaymentMethod={null} />);

      expect(screen.getByText('payment.failedToLoadPaymentForm')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    it('should NOT show error when currentPaymentMethod exists', () => {
      useValidateRecaptcha.mockReturnValue({
        secretData: null,
        refetchSecret: mockRefetchSecret,
        loading: false,
      });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent isFetchedCard={true} currentPaymentMethod={{ id: 'pm_123' }} />);

      expect(screen.queryByText('payment.failedToLoadPaymentForm')).not.toBeInTheDocument();
    });

    it('should NOT show error when isFetchedCard is false', () => {
      useValidateRecaptcha.mockReturnValue({
        secretData: null,
        refetchSecret: mockRefetchSecret,
        loading: false,
      });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent isFetchedCard={false} currentPaymentMethod={null} />);

      expect(screen.queryByText('payment.failedToLoadPaymentForm')).not.toBeInTheDocument();
    });
  });

  describe('Stripe Configuration', () => {
    it('should call loadStripe with correct parameters', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockLoadStripe).toHaveBeenCalledWith('pk_test_123', { stripeAccount: 'acct_123' });
    });

    it('should pass Elements options with clientSecret', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockElements).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            clientSecret: 'cs_test_123',
          }),
        })
      );
    });

    it('should pass Elements options with locale', () => {
      getLanguage.mockReturnValue('fr');

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockElements).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            locale: 'fr',
          }),
        })
      );
    });
  });

  describe('Appearance Configuration', () => {
    it('should use default Appearance when reskin is disabled', () => {
      useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      usePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: false });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockElements).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            appearance: { theme: 'default' },
          }),
        })
      );
    });

    it('should use AppearanceReskin when isEnableReskin is true', () => {
      useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      usePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: false });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockElements).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            appearance: { theme: 'reskin' },
          }),
        })
      );
    });

    it('should use AppearanceNewUI when isEnableReskinUI is true and isEnableReskin is false', () => {
      useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      usePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: true });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockElements).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            appearance: { theme: 'newUI' },
          }),
        })
      );
    });

    it('should prioritize AppearanceReskin over AppearanceNewUI when both enabled', () => {
      useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      usePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: true });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockElements).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            appearance: { theme: 'reskin' },
          }),
        })
      );
    });
  });

  describe('Font Configuration', () => {
    it('should use Axiforma font when reskin is disabled', () => {
      useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      usePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: false });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockElements).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            fonts: [expect.objectContaining({
              family: 'Axiforma',
              weight: '400',
            })],
          }),
        })
      );
    });

    it('should use Inter font when isEnableReskin is true', () => {
      useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      usePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: false });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockElements).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            fonts: [expect.objectContaining({
              family: 'Inter',
              weight: '500',
            })],
          }),
        })
      );
    });

    it('should use Inter font when isEnableReskinUI is true', () => {
      useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      usePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: true });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockElements).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            fonts: [expect.objectContaining({
              family: 'Inter',
              weight: '500',
            })],
          }),
        })
      );
    });
  });

  describe('useValidateRecaptcha Hook', () => {
    it('should call useValidateRecaptcha with correct parameters', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { 
        action: 'test_action',
        skipRecaptcha: true,
      });

      render(<EnhancedComponent 
        organizationId="org-123"
        isFetchedCard={true}
        currentPaymentMethod={{ id: 'pm_123' }}
      />);

      expect(useValidateRecaptcha).toHaveBeenCalledWith({
        skipRecaptcha: true,
        action: 'test_action',
        organizationId: 'org-123',
        currentPaymentMethod: { id: 'pm_123' },
        isFetchedCard: true,
        isPurchasing: false,
      });
    });

    it('should pass isPurchasing from Redux selector', () => {
      useSelector.mockReturnValue(true); // isPurchasing = true

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(useValidateRecaptcha).toHaveBeenCalledWith(
        expect.objectContaining({
          isPurchasing: true,
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined props gracefully', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should handle undefined secretData', () => {
      useValidateRecaptcha.mockReturnValue({
        secretData: undefined,
        refetchSecret: mockRefetchSecret,
        loading: false,
      });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent isFetchedCard={false} />);

      // Should not crash
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should handle null accountId', () => {
      useValidateRecaptcha.mockReturnValue({
        secretData: {
          clientSecret: 'cs_test_123',
          accountId: null,
        },
        refetchSecret: mockRefetchSecret,
        loading: false,
      });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(mockLoadStripe).toHaveBeenCalledWith('pk_test_123', { stripeAccount: null });
    });

    it('should pass hasClientSecret as false when clientSecret is empty', () => {
      useValidateRecaptcha.mockReturnValue({
        secretData: {
          clientSecret: '',
          accountId: 'acct_123',
        },
        refetchSecret: mockRefetchSecret,
        loading: false,
      });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent isFetchedCard={false} />);

      expect(screen.getByTestId('has-client-secret')).toHaveTextContent('false');
    });
  });

  describe('HOC Options', () => {
    it('should work without skipRecaptcha option', () => {
      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(useValidateRecaptcha).toHaveBeenCalledWith(
        expect.objectContaining({
          skipRecaptcha: undefined,
        })
      );
    });

    it('should work without noTopGapLoading option', () => {
      useValidateRecaptcha.mockReturnValue({
        secretData: null,
        refetchSecret: mockRefetchSecret,
        loading: true,
      });

      const EnhancedComponent = withStripeElements(TestComponent, { action: 'test_action' });

      render(<EnhancedComponent />);

      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-no-top-gap', 'false');
    });
  });
});

