import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import withUpdateOrganizationMemberRole from '../withUpdateOrganizationMemberRole';
import * as organizationGraphService from 'services/graphServices/organization';
import { ModalTypes } from 'constants/lumin-common';
import { ORG_TRANSFER_URL } from 'constants/organizationConstants';

// Mock all external dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));

jest.mock('hooks', () => ({
  useTranslation: jest.fn(),
  useEnableWebReskin: jest.fn(),
}));

jest.mock('services/graphServices/organization', () => ({
  updateOrgMemberRoleSubscription: jest.fn(),
}));

jest.mock('actions', () => ({
  openModal: jest.fn(),
}));

// Import mocked modules
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTranslation, useEnableWebReskin } from 'hooks';
import actions from 'actions';

// Test component
const TestComponent = ({ testProp }) => (
  <div data-testid="test-component">
    <span data-testid="test-prop">{testProp}</span>
  </div>
);

// ============ SHARED INSTANCES ============
const EnhancedComponent = withUpdateOrganizationMemberRole(TestComponent);

describe('withUpdateOrganizationMemberRole HOC', () => {
  let mockDispatch;
  let mockUnsubscribe;
  let subscriptionCallback;
  const originalReload = window.location.reload;

  // ============ HELPERS ============
  const setupSelectors = (orgData = {}, userData = {}) => {
    useSelector
      .mockReset()
      .mockReturnValueOnce({
        data: { _id: 'org-123', name: 'Test Organization', userRole: 'MEMBER', ...orgData },
      })
      .mockReturnValueOnce({ _id: 'user-123', email: 'test@example.com', ...userData });
  };

  const triggerSubscription = (overrides = {}) => {
    act(() => {
      subscriptionCallback({
        userId: 'user-123',
        orgId: 'org-123',
        actorName: 'Admin User',
        role: 'ORGANIZATION_ADMIN',
        ...overrides,
      });
    });
  };

  const expectModalOpened = (expectedProps = {}) => {
    expect(mockDispatch).toHaveBeenCalledWith(
      actions.openModal(expect.objectContaining({
        title: 'orgPage.permissionUpdated',
        type: ModalTypes.WARNING,
        confirmButtonTitle: 'common.reload',
        className: 'withUpdateOrganizationMemberRole__CustomModal',
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        useReskinModal: true,
        ...expectedProps,
      }))
    );
  };

  const expectModalNotOpened = () => {
    expect(mockDispatch).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    jest.clearAllMocks();

    delete window.location;
    window.location = { reload: jest.fn() };

    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    useParams.mockReturnValue({ tab: 'documents' });
    useTranslation.mockReturnValue({ t: (key) => key });
    useEnableWebReskin.mockReturnValue({ isEnableReskin: false });

    mockUnsubscribe = jest.fn();
    organizationGraphService.updateOrgMemberRoleSubscription.mockImplementation(({ callback }) => {
      subscriptionCallback = callback;
      return { unsubscribe: mockUnsubscribe };
    });

    setupSelectors();
  });

  afterEach(() => {
    window.location.reload = originalReload;
  });

  describe('Rendering', () => {
    it('should render wrapped component and pass props', () => {
      render(<EnhancedComponent testProp="custom-value" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByTestId('test-prop')).toHaveTextContent('custom-value');
    });
  });

  describe('Subscription Setup', () => {
    it('should subscribe on mount and unsubscribe on unmount', () => {
      const { unmount } = render(<EnhancedComponent />);

      expect(organizationGraphService.updateOrgMemberRoleSubscription).toHaveBeenCalledWith({
        orgId: 'org-123',
        callback: expect.any(Function),
      });

      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it.each([
      ['not transfer page', 'people', true],
      ['transfer page', ORG_TRANSFER_URL, false],
      ['empty tab', '', true],
      ['undefined tab', undefined, true],
    ])('should %s subscribe when tab is %s', (_, tab, shouldSubscribe) => {
      useParams.mockReturnValue({ tab });
      render(<EnhancedComponent />);

      if (shouldSubscribe) {
        expect(organizationGraphService.updateOrgMemberRoleSubscription).toHaveBeenCalled();
      } else {
        expect(organizationGraphService.updateOrgMemberRoleSubscription).not.toHaveBeenCalled();
      }
    });
  });

  describe('Subscription Callback - Modal Display', () => {
    it('should open modal when role is updated for current user in current org', () => {
      render(<EnhancedComponent />);
      triggerSubscription();
      expectModalOpened();
    });

    it.each([
      ['different user', { userId: 'different-user-456' }],
      ['different org', { orgId: 'different-org-456' }],
      ['same role', { role: 'MEMBER' }],
    ])('should NOT open modal when %s', (_, overrides) => {
      render(<EnhancedComponent />);
      triggerSubscription(overrides);
      expectModalNotOpened();
    });

    it.each([
      [false, true],
      [true, false],
    ])('should set isFullWidthButton to %s when reskin is %s', (expectedButton, isEnableReskin) => {
      useEnableWebReskin.mockReturnValue({ isEnableReskin });
      render(<EnhancedComponent />);
      triggerSubscription();
      expectModalOpened({ isFullWidthButton: expectedButton });
    });
  });

  describe('Subscription Callback - Confirm Action', () => {
    it('should reload page when confirmed', () => {
      render(<EnhancedComponent />);
      triggerSubscription();

      const modalData = actions.openModal.mock.calls[0][0];
      act(() => modalData.onConfirm());

      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe('Different Role Updates', () => {
    it.each([
      ['ORGANIZATION_ADMIN', 'MEMBER'],
      ['BILLING_MODERATOR', 'MEMBER'],
      ['MEMBER', 'ORGANIZATION_ADMIN'],
    ])('should handle update to %s from %s', (newRole, currentRole) => {
      setupSelectors({ userRole: currentRole });
      render(<EnhancedComponent />);
      triggerSubscription({ role: newRole });
      expectModalOpened();
    });

    it('should handle lowercase role in callback', () => {
      render(<EnhancedComponent />);
      triggerSubscription({ role: 'organization_admin' });
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it.each([
      ['undefined organization data', { data: undefined }],
      ['null currentOrganization', null],
    ])('should handle %s', (_, orgState) => {
      useSelector.mockReset().mockReturnValueOnce(orgState).mockReturnValueOnce({ _id: 'user-123' });
      render(<EnhancedComponent />);

      expect(organizationGraphService.updateOrgMemberRoleSubscription).toHaveBeenCalledWith({
        orgId: undefined,
        callback: expect.any(Function),
      });
    });
  });

  describe('Tab Change Behavior', () => {
    it('should resubscribe when tab changes from transfer to documents', () => {
      useParams.mockReturnValue({ tab: ORG_TRANSFER_URL });
      const { rerender } = render(<EnhancedComponent />);

      expect(organizationGraphService.updateOrgMemberRoleSubscription).not.toHaveBeenCalled();

      useParams.mockReturnValue({ tab: 'documents' });
      setupSelectors();
      rerender(<EnhancedComponent />);

      expect(organizationGraphService.updateOrgMemberRoleSubscription).toHaveBeenCalled();
    });

    it('should unsubscribe when navigating to transfer page', () => {
      useParams.mockReturnValue({ tab: 'documents' });
      const { rerender } = render(<EnhancedComponent />);

      expect(organizationGraphService.updateOrgMemberRoleSubscription).toHaveBeenCalledTimes(1);

      useParams.mockReturnValue({ tab: ORG_TRANSFER_URL });
      setupSelectors();
      rerender(<EnhancedComponent />);

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Multiple Components', () => {
    it('should handle multiple wrapped components independently', () => {
      const EnhancedComponent2 = withUpdateOrganizationMemberRole(TestComponent);

      useSelector.mockReset();
      useSelector
        .mockReturnValueOnce({ data: { _id: 'org-123', userRole: 'MEMBER' } })
        .mockReturnValueOnce({ _id: 'user-123' })
        .mockReturnValueOnce({ data: { _id: 'org-123', userRole: 'MEMBER' } })
        .mockReturnValueOnce({ _id: 'user-123' });

      render(
        <>
          <EnhancedComponent testProp="component-1" />
          <EnhancedComponent2 testProp="component-2" />
        </>
      );

      expect(screen.getAllByTestId('test-component')).toHaveLength(2);
      expect(organizationGraphService.updateOrgMemberRoleSubscription).toHaveBeenCalledTimes(2);
    });
  });
});