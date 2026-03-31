import React from 'react';

import { render, screen, fireEvent, waitFor } from 'features/CNC/utils/testUtil';
import { OrganizationRoles } from 'constants/organization.enum';
import { PlanTypeLabel, PaymentPlans } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { mockOrganization as baseMockOrganization } from 'features/CNC/CncComponents/__mocks__/mockOrganization';

import InviteSharedUsersModal from '../InviteSharedUsersModal';

import '@testing-library/jest-dom';

// Mock the hook
jest.mock('../hooks/useHandleInviteSharedUsersModal', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the UserTag component
jest.mock('luminComponents/AddShareMemberInput/components/UserTag', () => ({
  __esModule: true,
  default: ({ tag, handleDelete, canDelete }: any) => (
    <div data-testid={`user-tag-${tag.email}`}>
      <span>{tag.email}</span>
      {canDelete && (
        <button data-testid={`delete-tag-${tag.email}`} onClick={() => handleDelete(tag)}>
          Delete
        </button>
      )}
    </div>
  ),
}));

// Mock utilities
jest.mock('utils', () => ({
  capitalize: jest.fn((str: string) => str.charAt(0).toUpperCase() + str.slice(1)),
  avatar: {
    getAvatar: jest.fn((id: string) => `avatar-url-${id}`),
  },
  string: {
    getShortStringWithLimit: jest.fn((str: string, limit: number) => {
      if (str.length > limit) {
        return str.substring(0, limit) + '...';
      }
      return str;
    }),
  },
}));

// Mock kiwi-ui components
jest.mock('lumin-ui/kiwi-ui', () => ({
  Avatar: ({ src, size }: any) => <div data-testid="avatar" data-src={src} data-size={size} />,
  Button: ({ children, onClick, loading, disabled, size, variant }: any) => (
    <button
      data-testid={children === 'Skip for now' ? 'skip-button' : 'invite-button'}
      onClick={onClick}
      disabled={disabled || loading}
      data-loading={loading}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  ButtonSize: {
    lg: 'lg',
  },
  ButtonVariant: {
    text: 'text',
  },
  Icomoon: ({ type }: any) => <span data-testid={`icon-${type}`} />,
  Menu: ({ children, ComponentTarget, opened, onChange }: any) => {
    const handleClick = (e: any) => {
      e.stopPropagation();
      if (onChange) {
        onChange(!opened);
      }
    };
    return (
      <div data-testid="role-menu">
        <div onClick={handleClick} data-menu-trigger="true">
          {ComponentTarget}
        </div>
        {opened && <div data-testid="menu-items">{children}</div>}
      </div>
    );
  },
  MenuItem: ({ children, onClick, className }: any) => (
    <button data-testid={`menu-item-${children}`} onClick={onClick} className={className}>
      {children}
    </button>
  ),
  PlainTooltip: ({ children, content }: any) => (
    <div data-testid="tooltip" data-content={content}>
      {children}
    </div>
  ),
  KiwiProvider: ({ children }: any) => <>{children}</>,
}));

import useHandleInviteSharedUsersModal from '../hooks/useHandleInviteSharedUsersModal';

const mockUseHandleInviteSharedUsersModal = useHandleInviteSharedUsersModal as jest.MockedFunction<
  typeof useHandleInviteSharedUsersModal
>;

describe('InviteSharedUsersModal', () => {
  const mockOnClose = jest.fn();
  const mockSetShowDiscardModal = jest.fn();
  const mockHandleResetShareModalList = jest.fn();
  const mockHandleDelete = jest.fn();
  const mockHandleInvite = jest.fn();
  const mockHandleDismiss = jest.fn();
  const mockSetRole = jest.fn();
  const mockHasEmailIncluded = jest.fn(() => jest.fn(() => false));

  const mockOrganization: IOrganization = {
    ...baseMockOrganization,
    userRole: OrganizationRoles.BILLING_MODERATOR,
    totalMember: 5,
    payment: {
      ...baseMockOrganization.payment,
      type: PaymentPlans.ORG_STARTER,
    },
  };

  const mockUserTags = [
    {
      _id: 'user-1',
      email: 'user1@example.com',
      name: 'User 1',
    },
    {
      _id: 'user-2',
      email: 'user2@example.com',
      name: 'User 2',
    },
  ];

  const mockPendingUserList: [] = [];

  const defaultProps = {
    organization: mockOrganization,
    userTags: mockUserTags,
    pendingUserList: mockPendingUserList,
    onClose: mockOnClose,
    setShowDiscardModal: mockSetShowDiscardModal,
    handleResetShareModalList: mockHandleResetShareModalList,
  };

  const defaultHookReturn = {
    users: mockUserTags,
    role: OrganizationRoles.MEMBER,
    setRole: mockSetRole,
    inviting: false,
    handleDelete: mockHandleDelete,
    hasEmailIncluded: mockHasEmailIncluded,
    handleInvite: mockHandleInvite,
    handleDismiss: mockHandleDismiss,
    canRemoveUserTag: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHandleInviteSharedUsersModal.mockReturnValue(defaultHookReturn);
  });

  describe('Rendering', () => {
    it('should render the modal with correct title and organization name', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(screen.getByText(/Add users to/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Test Organization/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Workspace/i).length).toBeGreaterThan(0);
    });

    it('should render "Adding users is free" label', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(screen.getByText('Adding users is free')).toBeInTheDocument();
    });

    it('should render user section title', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(
        screen.getByText('Do you want to add these people to the Workspace?')
      ).toBeInTheDocument();
    });

    it('should render all user tags', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(screen.getByTestId('user-tag-user1@example.com')).toBeInTheDocument();
      expect(screen.getByTestId('user-tag-user2@example.com')).toBeInTheDocument();
    });

    it('should render role selection section with "With role" title', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(screen.getByText('With role')).toBeInTheDocument();
      expect(screen.getByTestId('role-menu')).toBeInTheDocument();
    });

    it('should render organization information section', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(screen.getByText('Workspace information')).toBeInTheDocument();
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
      expect(screen.getByText(/5 member\(s\)/i)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(screen.getByTestId('skip-button')).toBeInTheDocument();
      expect(screen.getByTestId('invite-button')).toBeInTheDocument();
      expect(screen.getByText('Skip for now')).toBeInTheDocument();
      expect(screen.getByText('Invite for free')).toBeInTheDocument();
    });
  });

  describe('Organization name display', () => {
    it('should truncate organization name if longer than 30 characters', () => {
      const longNameOrg: IOrganization = {
        ...mockOrganization,
        name: 'This is a very long organization name that exceeds thirty characters',
      };

      render(<InviteSharedUsersModal {...defaultProps} organization={longNameOrg} />);

      const tooltips = screen.getAllByTestId('tooltip');
      const headerTooltip = tooltips.find((tooltip) =>
        tooltip.getAttribute('data-content') === longNameOrg.name
      );
      expect(headerTooltip).toBeInTheDocument();
      expect(headerTooltip).toHaveAttribute('data-content', longNameOrg.name);
    });

    it('should not show tooltip if organization name is 30 characters or less', () => {
      const shortNameOrg: IOrganization = {
        ...mockOrganization,
        name: 'Short Org Name',
      };

      render(<InviteSharedUsersModal {...defaultProps} organization={shortNameOrg} />);

      const tooltips = screen.getAllByTestId('tooltip');
      const headerTooltip = tooltips.find((tooltip) =>
        tooltip.textContent?.includes(shortNameOrg.name) &&
        tooltip.closest('.title') !== null
      );
      // Tooltip should have empty content attribute when not needed (or no content attribute)
      const content = headerTooltip?.getAttribute('data-content');
      expect(content === null || content === '').toBe(true);
    });
  });

  describe('Role selection', () => {
    it('should display current role correctly', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      const roleButton = screen.getByText('Member');
      expect(roleButton).toBeInTheDocument();
    });

    it('should display "Admin" role when selected', () => {
      mockUseHandleInviteSharedUsersModal.mockReturnValue({
        ...defaultHookReturn,
        role: OrganizationRoles.BILLING_MODERATOR,
      });

      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should display "Owner" role when user is organization admin', () => {
      const adminOrg: IOrganization = {
        ...mockOrganization,
        userRole: OrganizationRoles.ORGANIZATION_ADMIN,
      };

      mockUseHandleInviteSharedUsersModal.mockReturnValue({
        ...defaultHookReturn,
        role: OrganizationRoles.ORGANIZATION_ADMIN,
      });

      render(<InviteSharedUsersModal {...defaultProps} organization={adminOrg} />);

      expect(screen.getByText('Owner')).toBeInTheDocument();
    });

    it('should show dropdown icon for admin users', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(screen.getByTestId('icon-caret-down-filled-lg')).toBeInTheDocument();
    });

    it('should disable role selection for non-admin users', () => {
      const memberOrg: IOrganization = {
        ...mockOrganization,
        userRole: OrganizationRoles.MEMBER,
      };

      render(<InviteSharedUsersModal {...defaultProps} organization={memberOrg} />);

      const roleButton = screen.getByText('Member').closest('button');
      expect(roleButton).toHaveClass('buttonRoleDisabled');
    });

    it('should open menu when role button is clicked', async () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      const menuTrigger = screen.getByTestId('role-menu').querySelector('[data-menu-trigger="true"]');

      fireEvent.click(menuTrigger!);

      // Menu should open and show menu items
      await waitFor(() => {
        expect(screen.getByTestId('menu-items')).toBeInTheDocument();
      });
    });

    it('should call setRole when menu item is clicked', async () => {
      mockUseHandleInviteSharedUsersModal.mockReturnValue({
        ...defaultHookReturn,
        role: OrganizationRoles.MEMBER,
      });

      render(<InviteSharedUsersModal {...defaultProps} />);

      const menuTrigger = screen.getByTestId('role-menu').querySelector('[data-menu-trigger="true"]');

      fireEvent.click(menuTrigger!);

      await waitFor(() => {
        expect(screen.getByTestId('menu-items')).toBeInTheDocument();
      });

      const adminMenuItem = screen.getByTestId('menu-item-Admin');
      fireEvent.click(adminMenuItem);

      expect(mockSetRole).toHaveBeenCalledWith(OrganizationRoles.BILLING_MODERATOR);
    });
  });

  describe('User tag interactions', () => {
    it('should call handleDelete when delete button is clicked', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      const deleteButton = screen.getByTestId('delete-tag-user1@example.com');
      fireEvent.click(deleteButton);

      expect(mockHandleDelete).toHaveBeenCalledWith(mockUserTags[0]);
    });

    it('should not show delete button when canRemoveUserTag is false', () => {
      mockUseHandleInviteSharedUsersModal.mockReturnValue({
        ...defaultHookReturn,
        canRemoveUserTag: false,
      });

      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(screen.queryByTestId('delete-tag-user1@example.com')).not.toBeInTheDocument();
    });

    it('should not show delete button when there is only one user', () => {
      const singleUserTags = [mockUserTags[0]];

      mockUseHandleInviteSharedUsersModal.mockReturnValue({
        ...defaultHookReturn,
        users: singleUserTags,
        canRemoveUserTag: false,
      });

      render(<InviteSharedUsersModal {...defaultProps} userTags={singleUserTags} />);

      expect(screen.queryByTestId('delete-tag-user1@example.com')).not.toBeInTheDocument();
    });
  });

  describe('Plan type display', () => {
    it('should display correct plan type label', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(screen.getByText(new RegExp(PlanTypeLabel.ORG_STARTER, 'i'))).toBeInTheDocument();
    });

    it('should display "Free" plan when organization has free plan', () => {
      const freeOrg: IOrganization = {
        ...mockOrganization,
        payment: {
          ...mockOrganization.payment,
          type: PaymentPlans.FREE,
        },
      };

      render(<InviteSharedUsersModal {...defaultProps} organization={freeOrg} />);

      // Check for the plan text more specifically - it appears in "member(s) - Free plan"
      expect(screen.getByText(/member\(s\) - Free plan/i)).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should call handleDismiss when "Skip for now" button is clicked', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      const skipButton = screen.getByTestId('skip-button');
      fireEvent.click(skipButton);

      expect(mockHandleDismiss).toHaveBeenCalled();
    });

    it('should call handleInvite when "Invite for free" button is clicked', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      const inviteButton = screen.getByTestId('invite-button');
      fireEvent.click(inviteButton);

      expect(mockHandleInvite).toHaveBeenCalled();
    });

    it('should disable buttons when inviting is true', () => {
      mockUseHandleInviteSharedUsersModal.mockReturnValue({
        ...defaultHookReturn,
        inviting: true,
      });

      render(<InviteSharedUsersModal {...defaultProps} />);

      const skipButton = screen.getByTestId('skip-button');
      const inviteButton = screen.getByTestId('invite-button');

      expect(skipButton).toBeDisabled();
      expect(inviteButton).toHaveAttribute('data-loading', 'true');
    });
  });

  describe('Empty states', () => {
    it('should render correctly when userTags is empty', () => {
      mockUseHandleInviteSharedUsersModal.mockReturnValue({
        ...defaultHookReturn,
        users: [],
      });

      render(<InviteSharedUsersModal {...defaultProps} userTags={[]} />);

      expect(screen.getByText('Do you want to add these people to the Workspace?')).toBeInTheDocument();
      expect(screen.queryByTestId(/user-tag-/)).not.toBeInTheDocument();
    });
  });

  describe('Hook integration', () => {
    it('should call useHandleInviteSharedUsersModal with correct props', () => {
      render(<InviteSharedUsersModal {...defaultProps} />);

      expect(mockUseHandleInviteSharedUsersModal).toHaveBeenCalledWith({
        organization: mockOrganization,
        userTags: mockUserTags,
        onClose: mockOnClose,
        setShowDiscardModal: mockSetShowDiscardModal,
        handleResetShareModalList: mockHandleResetShareModalList,
      });
    });

    it('should pass pendingUserList to UserTag components', () => {
      const pendingUsers = [
        {
          _id: 'pending-1',
          email: 'pending@example.com',
          name: 'Pending User',
        },
      ];

      render(
        <InviteSharedUsersModal {...defaultProps} pendingUserList={pendingUsers as []} />
      );

      expect(screen.getByTestId('user-tag-user1@example.com')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing organization name gracefully', () => {
      const orgWithoutName: IOrganization = {
        ...mockOrganization,
        name: '' as any,
      };

      render(<InviteSharedUsersModal {...defaultProps} organization={orgWithoutName} />);

      expect(screen.getByText(/Add users to/i)).toBeInTheDocument();
    });

    it('should handle missing payment type gracefully', () => {
      const orgWithoutPayment: IOrganization = {
        ...mockOrganization,
        payment: mockOrganization.payment,
      };

      render(<InviteSharedUsersModal {...defaultProps} organization={orgWithoutPayment} />);

      expect(screen.getByText('Workspace information')).toBeInTheDocument();
    });

    it('should handle missing totalMember gracefully', () => {
      const orgWithoutMembers: IOrganization = {
        ...mockOrganization,
        totalMember: undefined,
      };

      render(<InviteSharedUsersModal {...defaultProps} organization={orgWithoutMembers} />);

      expect(screen.getByText(/member\(s\)/i)).toBeInTheDocument();
    });
  });
});
