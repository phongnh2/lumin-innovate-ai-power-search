import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import withSharingQueue from '../withSharingQueue';

// Mock Apollo client
const mockUseSubscription = jest.fn();
jest.mock('@apollo/client', () => ({
  useSubscription: (...args) => mockUseSubscription(...args),
}));

jest.mock('lodash', () => ({
  isNull: (val) => val === null,
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('graphQL/DocumentGraph', () => ({
  SUB_DOCUMENT_SHARING_QUEUE: 'SUB_DOCUMENT_SHARING_QUEUE',
}));

jest.mock('hooks', () => ({
  useGetCurrentUser: jest.fn(),
  useTranslation: jest.fn(),
}));

jest.mock('utils', () => ({
  commonUtils: {
    getHOCDisplayName: jest.fn((name, Component) =>
      `${name}(${Component.displayName || Component.name || 'Component'})`
    ),
  },
  toastUtils: {
    success: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('features/ShareInSlack/reducer/ShareInSlack.reducer', () => ({
  setIsSharingQueueProcessing: jest.fn((val) => ({ type: 'SET_PROCESSING', payload: val })),
  shareInSlackSelectors: {
    getIsSharingQueueProcessing: jest.fn(),
  },
  setSharedDocumentInfo: jest.fn((val) => ({ type: 'SET_SHARED_DOC', payload: val })),
}));

// Import mocked modules
import { useDispatch, useSelector } from 'react-redux';
import { useGetCurrentUser, useTranslation } from 'hooks';
import { toastUtils } from 'utils';
import {
  setIsSharingQueueProcessing,
  shareInSlackSelectors,
  setSharedDocumentInfo,
} from 'features/ShareInSlack/reducer/ShareInSlack.reducer';

// Test component
const TestComponent = ({ testProp }) => (
  <div data-testid="test-component">
    <span data-testid="test-prop">{testProp}</span>
  </div>
);
TestComponent.displayName = 'TestComponent';

// ============ SHARED INSTANCES ============
const EnhancedComponent = withSharingQueue(TestComponent);

describe('withSharingQueue HOC', () => {
  let mockDispatch;

  // ============ HELPERS ============
  const createQueueData = (overrides = {}) => ({
    isChannelSharing: false,
    documentName: 'Test Doc',
    hasUnshareableEmails: false,
    isOverwritePermission: null,
    documentId: 'doc-123',
    ...overrides,
  });

  const setupSubscriptionWithData = (queueData) => {
    mockUseSubscription.mockImplementation((query, options) => {
      if (options.onData) {
        options.onData({
          data: { data: { documentSharingQueue: queueData } },
        });
      }
      return { data: null, loading: false, error: null };
    });
  };

  const setupProcessingState = (isProcessing = true, currentUser = { _id: 'user-123' }) => {
    useSelector.mockReturnValue(isProcessing);
    useGetCurrentUser.mockReturnValue(currentUser);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockReturnValue(false);
    useGetCurrentUser.mockReturnValue({ _id: 'user-123', email: 'test@example.com' });
    useTranslation.mockReturnValue({ t: (key) => key });
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null });
  });

  describe('Rendering', () => {
    it('should render wrapped component and pass props', () => {
      render(<EnhancedComponent testProp="custom-value" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByTestId('test-prop')).toHaveTextContent('custom-value');
    });

    it('should set displayName on HOC', () => {
      expect(EnhancedComponent.displayName).toBe('withSharingQueue(TestComponent)');
    });
  });

  describe('Subscription Setup', () => {
    it('should call useSubscription with correct query and options', () => {
      useGetCurrentUser.mockReturnValue({ _id: 'custom-user-id' });
      render(<EnhancedComponent />);

      expect(mockUseSubscription).toHaveBeenCalledWith(
        'SUB_DOCUMENT_SHARING_QUEUE',
        expect.objectContaining({
          fetchPolicy: 'no-cache',
          variables: { clientId: 'custom-user-id' },
        })
      );
    });

    it.each([
      ['processing=false', false, { _id: 'user-123' }, true],
      ['currentUser=null', true, null, true],
      ['processing=true & user exists', true, { _id: 'user-123' }, false],
    ])('should skip=%s when %s', (_, isProcessing, currentUser, expectedSkip) => {
      setupProcessingState(isProcessing, currentUser);
      render(<EnhancedComponent />);

      expect(mockUseSubscription).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ skip: expectedSkip })
      );
    });
  });

  describe('Subscription onData - Toast Messages', () => {
    beforeEach(() => {
      setupProcessingState(true);
    });

    it.each([
      // [description, queueData, expectedToast, expectedMessage]
      ['success - no unshareable', { hasUnshareableEmails: false, isOverwritePermission: null }, 'success', 'shareInSlack.documentHasBeenShared'],
      ['override channel', { isChannelSharing: true, isOverwritePermission: true }, 'success', 'shareInSlack.overrideMultipleUsers'],
      ['override single', { isChannelSharing: false, isOverwritePermission: true }, 'success', 'shareInSlack.overrideSingleUser'],
      ['unchanged channel', { isChannelSharing: true, isOverwritePermission: false }, 'success', 'shareInSlack.unChangeMultipleUsers'],
      ['unchanged single', { isChannelSharing: false, isOverwritePermission: false }, 'success', 'shareInSlack.unChangeSingleUser'],
      ['warning - unshareable', { hasUnshareableEmails: true }, 'warn', expect.anything()],
    ])('should show %s toast', (_, dataOverrides, toastType, expectedMessage) => {
      setupSubscriptionWithData(createQueueData(dataOverrides));
      render(<EnhancedComponent />);

      expect(toastUtils[toastType]).toHaveBeenCalledWith({ message: expectedMessage });
      if (toastType === 'warn') {
        expect(toastUtils.success).not.toHaveBeenCalled();
      }
    });
  });

  describe('Subscription onData - Dispatch Actions', () => {
    beforeEach(() => {
      setupProcessingState(true);
    });

    it('should dispatch setIsSharingQueueProcessing(false) and setSharedDocumentInfo', () => {
      setupSubscriptionWithData(createQueueData({ documentId: 'doc-456' }));
      render(<EnhancedComponent />);

      expect(mockDispatch).toHaveBeenCalledWith(setIsSharingQueueProcessing(false));
      expect(mockDispatch).toHaveBeenCalledWith(setSharedDocumentInfo({ documentId: 'doc-456' }));
    });
  });

  describe('Subscription onData - Edge Cases', () => {
    beforeEach(() => {
      setupProcessingState(true);
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
    ])('should return early when documentSharingQueue is %s', (_, queueValue) => {
      setupSubscriptionWithData(queueValue);
      render(<EnhancedComponent />);

      expect(toastUtils.success).not.toHaveBeenCalled();
      expect(toastUtils.warn).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('Hooks Usage', () => {
    it('should call all required hooks', () => {
      render(<EnhancedComponent />);

      expect(useGetCurrentUser).toHaveBeenCalled();
      expect(useTranslation).toHaveBeenCalled();
      expect(useSelector).toHaveBeenCalledWith(shareInSlackSelectors.getIsSharingQueueProcessing);
    });
  });

  describe('Multiple Components', () => {
    it('should work with different wrapped components', () => {
      const AnotherComponent = ({ name }) => (
        <div data-testid="another-component">{name}</div>
      );
      AnotherComponent.displayName = 'AnotherComponent';

      const EnhancedAnother = withSharingQueue(AnotherComponent);

      render(
        <>
          <EnhancedComponent testProp="test1" />
          <EnhancedAnother name="test2" />
        </>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByTestId('another-component')).toHaveTextContent('test2');
    });

    it('should have unique displayNames for different components', () => {
      const ComponentA = () => <div>A</div>;
      ComponentA.displayName = 'ComponentA';
      const ComponentB = () => <div>B</div>;
      ComponentB.displayName = 'ComponentB';

      const EnhancedA = withSharingQueue(ComponentA);
      const EnhancedB = withSharingQueue(ComponentB);

      expect(EnhancedA.displayName).toBe('withSharingQueue(ComponentA)');
      expect(EnhancedB.displayName).toBe('withSharingQueue(ComponentB)');
    });
  });
});
