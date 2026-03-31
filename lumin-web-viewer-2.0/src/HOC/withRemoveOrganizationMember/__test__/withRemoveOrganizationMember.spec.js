import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import withRemoveOrganizationMember from '../withRemoveOrganizationMember';
import * as organizationGraphService from 'services/graphServices/organization';
import { ModalTypes } from 'constants/lumin-common';

// Mock all external dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock('hooks', () => ({
  useTranslation: jest.fn(),
  useNavigateUser: jest.fn(),
  useEnableWebReskin: jest.fn(),
}));

jest.mock('services/graphServices/organization', () => ({
  removeOrgMemberSubscription: jest.fn(),
}));

jest.mock('actions', () => ({
  removeOrganizationInListById: jest.fn(),
  openModal: jest.fn(),
}));

// Import mocked modules
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation, useNavigateUser, useEnableWebReskin } from 'hooks';
import actions from 'actions';

// Test component
const TestComponent = ({ testProp }) => (
  <div data-testid="test-component">
    <span data-testid="test-prop">{testProp}</span>
  </div>
);

describe('withRemoveOrganizationMember HOC', () => {
  let mockDispatch;
  let mockNavigate;
  let mockGoToOrgListOrPersonalDocs;
  let mockUnsubscribe;
  let subscriptionCallback;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock dispatch
    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);

    // Setup mock navigate
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    // Setup mock location
    useLocation.mockReturnValue({ pathname: '/organization/org-123' });

    // Setup mock selector for currentOrganization
    useSelector.mockReturnValue({
      data: {
        _id: 'org-123',
        name: 'Test Organization',
      },
    });

    // Setup mock translation
    useTranslation.mockReturnValue({
      t: (key) => key,
    });

    // Setup mock useNavigateUser
    mockGoToOrgListOrPersonalDocs = jest.fn();
    useNavigateUser.mockReturnValue({
      goToOrgListOrPersonalDocs: mockGoToOrgListOrPersonalDocs,
    });

    // Setup mock useEnableWebReskin
    useEnableWebReskin.mockReturnValue({
      isEnableReskin: false,
    });

    // Setup mock subscription
    mockUnsubscribe = jest.fn();
    organizationGraphService.removeOrgMemberSubscription.mockImplementation(({ callback }) => {
      subscriptionCallback = callback;
      return { unsubscribe: mockUnsubscribe };
    });
  });

  describe('Rendering', () => {
    it('should render wrapped component', () => {
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent testProp="test-value" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should pass props to wrapped component', () => {
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent testProp="custom-value" />);

      expect(screen.getByTestId('test-prop')).toHaveTextContent('custom-value');
    });
  });

  describe('Subscription Setup', () => {
    it('should subscribe to removeOrgMemberSubscription on mount', () => {
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent />);

      expect(organizationGraphService.removeOrgMemberSubscription).toHaveBeenCalledWith({
        orgId: 'org-123',
        callback: expect.any(Function),
      });
    });

    it('should unsubscribe on unmount', () => {
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      const { unmount } = render(<EnhancedComponent />);
      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should resubscribe when organizationId changes', () => {
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      const { rerender } = render(<EnhancedComponent />);

      // Change organization
      useSelector.mockReturnValue({
        data: {
          _id: 'org-456',
          name: 'Another Organization',
        },
      });

      rerender(<EnhancedComponent />);

      // Should have called unsubscribe for old and subscribe for new
      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(organizationGraphService.removeOrgMemberSubscription).toHaveBeenCalledTimes(2);
    });
  });

  describe('Subscription Callback - Modal Display', () => {
    it('should open modal when member is removed', () => {
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent />);

      // Trigger the subscription callback
      act(() => {
        subscriptionCallback({ organization: { name: 'Test Org' } });
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.openModal(expect.objectContaining({
          title: 'orgPage.permissionIsExpired',
          type: ModalTypes.WARNING,
          confirmButtonTitle: 'common.ok',
          disableBackdropClick: true,
          disableEscapeKeyDown: true,
          useReskinModal: true,
        }))
      );
    });

    it('should set isFullWidthButton to true when reskin is disabled', () => {
      useEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent />);

      act(() => {
        subscriptionCallback({ organization: { name: 'Test Org' } });
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.openModal(expect.objectContaining({
          isFullWidthButton: true,
        }))
      );
    });

    it('should set isFullWidthButton to false when reskin is enabled', () => {
      useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent />);

      act(() => {
        subscriptionCallback({ organization: { name: 'Test Org' } });
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.openModal(expect.objectContaining({
          isFullWidthButton: false,
        }))
      );
    });
  });

  describe('Subscription Callback - Confirm Action', () => {
    it('should dispatch removeOrganizationInListById when confirmed', () => {
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent />);

      act(() => {
        subscriptionCallback({ organization: { name: 'Test Org' } });
      });

      // Get the onConfirm callback from the modal data
      const openModalCall = mockDispatch.mock.calls.find(
        (call) => call[0] === actions.openModal(expect.anything())
      );
      const modalData = actions.openModal.mock.calls[0][0];

      // Execute the confirm callback
      act(() => {
        modalData.onConfirm();
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.removeOrganizationInListById('org-123')
      );
    });

    it('should navigate to org list or personal docs when confirmed', () => {
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent />);

      act(() => {
        subscriptionCallback({ organization: { name: 'Test Org' } });
      });

      // Get the modal data and execute confirm
      const modalData = actions.openModal.mock.calls[0][0];

      act(() => {
        modalData.onConfirm();
      });

      expect(mockGoToOrgListOrPersonalDocs).toHaveBeenCalledWith({ forceReload: true });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined organization data', () => {
      useSelector.mockReturnValue({ data: undefined });
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent />);

      expect(organizationGraphService.removeOrgMemberSubscription).toHaveBeenCalledWith({
        orgId: undefined,
        callback: expect.any(Function),
      });
    });

    it('should handle null currentOrganization', () => {
      useSelector.mockReturnValue(null);
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent />);

      expect(organizationGraphService.removeOrgMemberSubscription).toHaveBeenCalledWith({
        orgId: undefined,
        callback: expect.any(Function),
      });
    });

    it('should handle organization with missing name in callback', () => {
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent />);

      act(() => {
        subscriptionCallback({ organization: {} });
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.openModal(expect.objectContaining({
          title: 'orgPage.permissionIsExpired',
        }))
      );
    });

    it('should include confirmButtonProps with withExpandedSpace', () => {
      const EnhancedComponent = withRemoveOrganizationMember(TestComponent);

      render(<EnhancedComponent />);

      act(() => {
        subscriptionCallback({ organization: { name: 'Test Org' } });
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.openModal(expect.objectContaining({
          confirmButtonProps: {
            withExpandedSpace: true,
          },
        }))
      );
    });
  });

  describe('Multiple Components', () => {
    it('should handle multiple wrapped components independently', () => {
      const EnhancedComponent1 = withRemoveOrganizationMember(TestComponent);
      const EnhancedComponent2 = withRemoveOrganizationMember(TestComponent);

      render(
        <>
          <EnhancedComponent1 testProp="component-1" />
          <EnhancedComponent2 testProp="component-2" />
        </>
      );

      const components = screen.getAllByTestId('test-component');
      expect(components).toHaveLength(2);

      // Each component should set up its own subscription
      expect(organizationGraphService.removeOrgMemberSubscription).toHaveBeenCalledTimes(2);
    });
  });
});