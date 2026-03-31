import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import withAuthGuard from '../withAuthGuard';

// Mock Redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('react-router', () => ({
  useLocation: jest.fn(),
  matchPath: jest.fn(),
}));

jest.mock('selectors', () => ({
  isAuthenticating: 'isAuthenticating',
  getIsCompletedGettingUserData: 'getIsCompletedGettingUserData',
  getCurrentUser: 'getCurrentUser',
}));

jest.mock('luminComponents/Loading', () => ({ fullscreen }) => (
  <div data-testid="loading" data-fullscreen={fullscreen}>Loading...</div>
));

jest.mock('services/oryServices', () => ({
  kratosService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
  },
}));

jest.mock('utils', () => ({
  commonUtils: {
    getHOCDisplayName: jest.fn((name, Component) => `${name}(${Component.displayName || Component.name || 'Component'})`),
  },
  LocalStorageUtils: {
    clear: jest.fn(),
  },
}));

jest.mock('constants/Routers', () => ({
  Routers: {
    PAYMENT: '/payment',
    PAYMENT_FREE_TRIAL: '/payment/free-trial',
  },
}));

jest.mock('constants/urls', () => ({
  BASEURL: 'https://app.luminpdf.com',
}));

jest.mock('constants/UrlSearchParam', () => ({
  UrlSearchParam: {
    REDIRECT: 'redirect',
  },
}));

// Import mocked modules
import { useSelector } from 'react-redux';
import { useLocation, matchPath } from 'react-router';
import { kratosService } from 'services/oryServices';
import { LocalStorageUtils } from 'utils';

// Test component
const TestComponent = ({ location, testProp }) => (
  <div data-testid="test-component">
    <span data-testid="location-pathname">{location?.pathname || 'no-location'}</span>
    <span data-testid="test-prop">{testProp}</span>
  </div>
);
TestComponent.displayName = 'TestComponent';

// ============ SHARED INSTANCES ============
const EnhancedComponent = withAuthGuard(TestComponent);

const mockLocation = {
  pathname: '/documents',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

describe('withAuthGuard HOC', () => {
  // ============ HELPERS ============
  const setupSelectors = (options = {}) => {
    const { isAuthenticating = false, isCompletedGettingUserData = true } = options;
    const currentUser = 'currentUser' in options ? options.currentUser : { _id: 'user-123', email: 'test@example.com' };
    
    useSelector.mockImplementation((selector) => {
      if (selector === 'isAuthenticating') return isAuthenticating;
      if (selector === 'getIsCompletedGettingUserData') return isCompletedGettingUserData;
      if (selector === 'getCurrentUser') return currentUser;
      return undefined;
    });
  };

  const setupLocation = (pathname, search = '') => {
    useLocation.mockReturnValue({ ...mockLocation, pathname, search });
  };

  const setupPaymentPageMatch = (matchPayment = false, matchTrial = false) => {
    matchPath.mockImplementation(({ path }) => {
      if (path === '/payment' && matchPayment) return { path: '/payment' };
      if (path === '/payment/free-trial' && matchTrial) return { path: '/payment/free-trial' };
      return null;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useLocation.mockReturnValue(mockLocation);
    matchPath.mockReturnValue(null);
    delete window.location;
    window.location = { search: '' };
  });

  describe('Rendering', () => {
    it('should render wrapped component with props and location when authenticated', () => {
      setupSelectors();
      render(<EnhancedComponent testProp="custom-value" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByTestId('test-prop')).toHaveTextContent('custom-value');
      expect(screen.getByTestId('location-pathname')).toHaveTextContent('/documents');
    });

    it('should set displayName on HOC', () => {
      expect(EnhancedComponent.displayName).toBe('withAuthGuard(TestComponent)');
    });
  });

  describe('Loading State', () => {
    it.each([
      ['isAuthenticating=true', { isAuthenticating: true }],
      ['isCompletedGettingUserData=false', { isCompletedGettingUserData: false }],
      ['both conditions', { isAuthenticating: false, isCompletedGettingUserData: false }],
    ])('should show fullscreen loading when %s', (_, selectorOptions) => {
      setupSelectors(selectorOptions);
      render(<EnhancedComponent />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('loading')).toHaveAttribute('data-fullscreen', 'true');
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    it('should NOT show loading when authentication is complete', () => {
      setupSelectors({ isAuthenticating: false, isCompletedGettingUserData: true });
      render(<EnhancedComponent />);

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated User Redirects', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
    ])('should redirect to sign in and clear localStorage when currentUser is %s', (_, currentUser) => {
      setupSelectors({ currentUser });
      render(<EnhancedComponent />);

      expect(kratosService.signIn).toHaveBeenCalledWith(true);
      expect(LocalStorageUtils.clear).toHaveBeenCalled();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    it('should redirect to sign up when redirect=sign-up in URL', () => {
      setupSelectors({ currentUser: null });
      window.location.search = '?redirect=sign-up';
      render(<EnhancedComponent />);

      expect(kratosService.signUp).toHaveBeenCalledWith(true);
      expect(kratosService.signIn).not.toHaveBeenCalled();
    });

    it.each([
      ['', true],
      ['?foo=bar&baz=qux', true],
    ])('should redirect to sign in when search is "%s"', (search, expectedSimpleRedirect) => {
      setupSelectors({ currentUser: null });
      window.location.search = search;
      render(<EnhancedComponent />);

      expect(kratosService.signIn).toHaveBeenCalledWith(expectedSimpleRedirect);
    });
  });

  describe('Payment Page Redirect', () => {
    it.each([
      ['payment page', '/payment/individual/monthly', '?plan=pro', true, false],
      ['trial page', '/payment/free-trial/pro/monthly', '', false, true],
      ['payment with complex params', '/payment/pro/monthly', '?coupon=SAVE10&ref=email', true, false],
    ])('should redirect to sign in with URL when on %s', (_, pathname, search, matchPayment, matchTrial) => {
      setupSelectors({ currentUser: null });
      setupLocation(pathname, search);
      setupPaymentPageMatch(matchPayment, matchTrial);
      render(<EnhancedComponent />);

      expect(kratosService.signIn).toHaveBeenCalledWith({
        url: `https://app.luminpdf.com${pathname}${search}`,
      });
    });

    it('should prioritize sign-up redirect over payment page redirect', () => {
      setupSelectors({ currentUser: null });
      window.location.search = '?redirect=sign-up';
      setupLocation('/payment/individual/monthly', '?redirect=sign-up');
      setupPaymentPageMatch(true, false);
      render(<EnhancedComponent />);

      expect(kratosService.signUp).toHaveBeenCalledWith(true);
      expect(kratosService.signIn).not.toHaveBeenCalled();
    });
  });

  describe('matchPath Usage', () => {
    it('should call matchPath for both payment and trial page checks', () => {
      setupSelectors();
      setupLocation('/documents', '');
      render(<EnhancedComponent />);

      expect(matchPath).toHaveBeenCalledWith({ path: '/payment', end: false }, '/documents');
      expect(matchPath).toHaveBeenCalledWith({ path: '/payment/free-trial', end: false }, '/documents');
    });
  });

  describe('Authentication Flow Order', () => {
    it('should show loading and NOT redirect when still authenticating even if user is null', () => {
      setupSelectors({ isAuthenticating: true, currentUser: null });
      render(<EnhancedComponent />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(kratosService.signIn).not.toHaveBeenCalled();
      expect(LocalStorageUtils.clear).not.toHaveBeenCalled();
    });

    it('should redirect only after loading is complete', () => {
      setupSelectors({ isAuthenticating: false, isCompletedGettingUserData: true, currentUser: null });
      render(<EnhancedComponent />);

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(kratosService.signIn).toHaveBeenCalled();
    });
  });

  describe('Props Forwarding', () => {
    it('should pass all original props to wrapped component', () => {
      setupSelectors();
      const MultiPropComponent = ({ prop1, prop2, prop3, location }) => (
        <div data-testid="multi-prop">
          <span data-testid="prop1">{prop1}</span>
          <span data-testid="prop2">{prop2}</span>
          <span data-testid="prop3">{prop3}</span>
          <span data-testid="loc">{location?.pathname}</span>
        </div>
      );
      const Enhanced = withAuthGuard(MultiPropComponent);
      render(<Enhanced prop1="value1" prop2="value2" prop3="value3" />);

      expect(screen.getByTestId('prop1')).toHaveTextContent('value1');
      expect(screen.getByTestId('prop2')).toHaveTextContent('value2');
      expect(screen.getByTestId('prop3')).toHaveTextContent('value3');
      expect(screen.getByTestId('loc')).toHaveTextContent('/documents');
    });
  });
});
