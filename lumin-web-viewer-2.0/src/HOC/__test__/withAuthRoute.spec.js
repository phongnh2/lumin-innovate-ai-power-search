import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import withAuthRoute, { AuthRouteContext } from '../withAuthRoute';

// Mock hooks
jest.mock('navigation/AuthenRoute/hooks/useErrorSubscriber', () => jest.fn());
jest.mock('hooks', () => ({
  useRefetchDataAfterPaymentChanged: jest.fn(),
  useUpdateUserSubscription: jest.fn(),
  useRedirectToFreePlanFlow: jest.fn(),
}));

jest.mock('utils', () => ({
  commonUtils: {
    getHOCDisplayName: jest.fn((name, Component) => 
      `${name}(${Component.displayName || Component.name || 'Component'})`
    ),
  },
}));

// Import mocked modules
import useErrorSubscriber from 'navigation/AuthenRoute/hooks/useErrorSubscriber';
import { 
  useRefetchDataAfterPaymentChanged, 
  useUpdateUserSubscription, 
  useRedirectToFreePlanFlow 
} from 'hooks';

// Test component
const TestComponent = ({ testProp, anotherProp }) => (
  <div data-testid="test-component">
    <span data-testid="test-prop">{testProp}</span>
    <span data-testid="another-prop">{anotherProp}</span>
  </div>
);
TestComponent.displayName = 'TestComponent';

// ============ SHARED INSTANCES ============
const EnhancedComponent = withAuthRoute(TestComponent);

describe('withAuthRoute HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render wrapped component and pass all props', () => {
      render(<EnhancedComponent testProp="value1" anotherProp="value2" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByTestId('test-prop')).toHaveTextContent('value1');
      expect(screen.getByTestId('another-prop')).toHaveTextContent('value2');
    });

    it('should set displayName on HOC', () => {
      expect(EnhancedComponent.displayName).toBe('withAuthRoute(TestComponent)');
    });
  });

  describe('Hook Invocations', () => {
    it('should call all required hooks on render', () => {
      render(<EnhancedComponent />);

      expect(useRefetchDataAfterPaymentChanged).toHaveBeenCalled();
      expect(useUpdateUserSubscription).toHaveBeenCalled();
      expect(useErrorSubscriber).toHaveBeenCalled();
      expect(useRedirectToFreePlanFlow).toHaveBeenCalled();
    });

    it('should call all hooks on each rerender', () => {
      const { rerender } = render(<EnhancedComponent />);
      
      rerender(<EnhancedComponent />);

      [useRefetchDataAfterPaymentChanged, useUpdateUserSubscription, useErrorSubscriber, useRedirectToFreePlanFlow]
        .forEach(hook => expect(hook).toHaveBeenCalledTimes(2));
    });
  });

  describe('Multiple Components', () => {
    it('should work with different wrapped components and have unique displayNames', () => {
      const AnotherComponent = ({ name }) => <div data-testid="another-component">{name}</div>;
      AnotherComponent.displayName = 'AnotherComponent';

      const EnhancedAnother = withAuthRoute(AnotherComponent);

      render(
        <>
          <EnhancedComponent testProp="test1" />
          <EnhancedAnother name="test2" />
        </>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByTestId('another-component')).toHaveTextContent('test2');
      expect(EnhancedAnother.displayName).toBe('withAuthRoute(AnotherComponent)');
    });

    it('should handle component without displayName', () => {
      const AnonymousComponent = ({ value }) => <div data-testid="anon">{value}</div>;
      const Enhanced = withAuthRoute(AnonymousComponent);

      render(<Enhanced value="anonymous" />);

      expect(screen.getByTestId('anon')).toHaveTextContent('anonymous');
      expect(Enhanced.displayName).toBe('withAuthRoute(AnonymousComponent)');
    });
  });

  describe('Props Forwarding', () => {
    it('should forward all types of props including functions', () => {
      const ComplexComponent = ({ stringProp, numberProp, booleanProp, objectProp, arrayProp, functionProp }) => (
        <div data-testid="complex-component">
          <span data-testid="string">{stringProp}</span>
          <span data-testid="number">{numberProp}</span>
          <span data-testid="boolean">{String(booleanProp)}</span>
          <span data-testid="object">{JSON.stringify(objectProp)}</span>
          <span data-testid="array">{JSON.stringify(arrayProp)}</span>
          <button data-testid="function" onClick={functionProp}>Click</button>
        </div>
      );

      const Enhanced = withAuthRoute(ComplexComponent);
      const mockFn = jest.fn();

      render(
        <Enhanced
          stringProp="hello"
          numberProp={42}
          booleanProp={true}
          objectProp={{ key: 'value' }}
          arrayProp={[1, 2, 3]}
          functionProp={mockFn}
        />
      );

      expect(screen.getByTestId('string')).toHaveTextContent('hello');
      expect(screen.getByTestId('number')).toHaveTextContent('42');
      expect(screen.getByTestId('boolean')).toHaveTextContent('true');
      expect(screen.getByTestId('object')).toHaveTextContent('{"key":"value"}');
      expect(screen.getByTestId('array')).toHaveTextContent('[1,2,3]');

      screen.getByTestId('function').click();
      expect(mockFn).toHaveBeenCalled();
    });

    it.each([
      ['undefined props', { testProp: undefined }],
      ['no props', {}],
    ])('should handle %s', (_, props) => {
      render(<EnhancedComponent {...props} />);
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });
});

describe('AuthRouteContext', () => {
  // Reusable consumer for testing context values
  const ContextConsumer = ({ field }) => {
    const context = React.useContext(AuthRouteContext);
    return <span data-testid="context-value">{String(context[field])}</span>;
  };

  it('should export AuthRouteContext', () => {
    expect(AuthRouteContext).toBeDefined();
  });

  it.each([
    ['isCheckingMigrationModal', 'true'],
    ['isMigrationModalClosed', 'false'],
    ['shouldShowMigrationModal', 'false'],
  ])('should have %s as %s by default', (field, expectedValue) => {
    render(<ContextConsumer field={field} />);
    expect(screen.getByTestId('context-value')).toHaveTextContent(expectedValue);
  });

  it('should allow providing custom context values', () => {
    const AllFieldsConsumer = () => {
      const context = React.useContext(AuthRouteContext);
      return (
        <div>
          <span data-testid="is-checking">{String(context.isCheckingMigrationModal)}</span>
          <span data-testid="is-closed">{String(context.isMigrationModalClosed)}</span>
          <span data-testid="should-show">{String(context.shouldShowMigrationModal)}</span>
        </div>
      );
    };

    render(
      <AuthRouteContext.Provider value={{
        isCheckingMigrationModal: false,
        isMigrationModalClosed: true,
        shouldShowMigrationModal: true,
      }}>
        <AllFieldsConsumer />
      </AuthRouteContext.Provider>
    );

    expect(screen.getByTestId('is-checking')).toHaveTextContent('false');
    expect(screen.getByTestId('is-closed')).toHaveTextContent('true');
    expect(screen.getByTestId('should-show')).toHaveTextContent('true');
  });
});
