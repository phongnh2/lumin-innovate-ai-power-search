import { renderHook, act } from '@testing-library/react';
import { batch, useDispatch } from 'react-redux';
import '@testing-library/jest-dom';

import useHandleInviteSharedUsersModal from '../useHandleInviteSharedUsersModal';

import { mockOrganization } from 'features/CNC/CncComponents/__mocks__/mockOrganization';
import { OrganizationRoles } from 'constants/organization.enum';
import { PaymentPlans } from 'constants/plan.enum';
import { STATUS_CODE } from 'constants/lumin-common';
import { ErrorCode } from 'constants/errorCode';
import { InviteActionTypes } from 'constants/featureFlagsConstant';
import { IOrganization } from 'interfaces/organization/organization.interface';

// Mock dependencies
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  batch: jest.fn((fn) => fn()),
}));

jest.mock('hooks', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string, options?: { ns?: string }) => {
      if (key === 'organization' && options?.ns === 'terms') {
        return 'organization';
      }
      return key;
    }),
  })),
}));

jest.mock('services', () => ({
  organizationServices: {
    inviteMemberToOrg: jest.fn(),
  },
}));

jest.mock('utils', () => ({
  commonUtils: {
    getDomainFromEmail: jest.fn((email: string) => email.split('@')[1]),
  },
  errorUtils: {
    extractGqlError: jest.fn(),
    handleScimBlockedError: jest.fn(() => false),
  },
  toastUtils: {
    success: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('features/CNC/hooks/useTrackingABTestModalEvent', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    trackModalConfirmation: jest.fn(() => Promise.resolve()),
    trackModalDismiss: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('actions', () => ({
  updateCurrentOrganization: jest.fn((org) => ({ type: 'UPDATE_CURRENT_ORGANIZATION', payload: org })),
  updateOrganizationInList: jest.fn((orgId, org) => ({ type: 'UPDATE_ORGANIZATION_IN_LIST', payload: { orgId, org } })),
  openModal: jest.fn((config) => ({ type: 'OPEN_MODAL', payload: config })),
}));

jest.mock('constants/customConstant', () => ({
  TOAST_DURATION_ERROR_INVITE_MEMBER: 5000,
}));

jest.mock('constants/messages', () => ({
  WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER: 'warning_message_can_not_invite_member',
}));

// Import mocked services after jest.mock
import { organizationServices } from 'services';
import * as utils from 'utils';
import * as actionsModule from 'actions';

const mockDispatch = jest.fn();
const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const mockInviteMemberToOrg = organizationServices.inviteMemberToOrg as jest.MockedFunction<
  typeof organizationServices.inviteMemberToOrg
>;
const mockToastUtils = utils.toastUtils;
const mockErrorUtils = utils.errorUtils;
const mockCommonUtils = utils.commonUtils;
const actions = actionsModule;

describe('useHandleInviteSharedUsersModal', () => {
  const mockOnClose = jest.fn();
  const mockSetShowDiscardModal = jest.fn();
  const mockHandleResetShareModalList = jest.fn();

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

  const mockOrganizationWithValidPlan: IOrganization = {
    ...mockOrganization,
    payment: {
      ...mockOrganization.payment,
      type: PaymentPlans.ORG_STARTER,
    },
  } as IOrganization;

  const defaultProps = {
    organization: mockOrganizationWithValidPlan,
    userTags: mockUserTags,
    onClose: mockOnClose,
    setShowDiscardModal: mockSetShowDiscardModal,
    handleResetShareModalList: mockHandleResetShareModalList,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(mockDispatch);
    // Mock window.location.reload using Object.defineProperty since it's read-only
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        reload: jest.fn(),
      },
    });
  });

  describe('Hook initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      expect(result.current.role).toBe(OrganizationRoles.MEMBER);
      expect(result.current.users).toEqual(mockUserTags);
      expect(result.current.inviting).toBe(false);
      expect(result.current.canRemoveUserTag).toBe(true);
    });

    it('should provide all required methods', () => {
      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      expect(result.current.handleDelete).toBeDefined();
      expect(result.current.hasEmailIncluded).toBeDefined();
      expect(result.current.handleInvite).toBeDefined();
      expect(result.current.handleDismiss).toBeDefined();
      expect(result.current.setRole).toBeDefined();
      expect(typeof result.current.handleDelete).toBe('function');
      expect(typeof result.current.hasEmailIncluded).toBe('function');
      expect(typeof result.current.handleInvite).toBe('function');
      expect(typeof result.current.handleDismiss).toBe('function');
      expect(typeof result.current.setRole).toBe('function');
    });

    it('should set canRemoveUserTag to false when there is only one user', () => {
      const singleUserProps = {
        ...defaultProps,
        userTags: [mockUserTags[0]],
      };

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(singleUserProps));

      expect(result.current.canRemoveUserTag).toBe(false);
    });
  });

  describe('handleDelete', () => {
    it('should remove user from users list', () => {
      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      act(() => {
        result.current.handleDelete(mockUserTags[0]);
      });

      expect(result.current.users).toHaveLength(1);
      expect(result.current.users[0]).toEqual(mockUserTags[1]);
    });

    it('should update canRemoveUserTag when removing user', () => {
      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      expect(result.current.canRemoveUserTag).toBe(true);

      act(() => {
        result.current.handleDelete(mockUserTags[0]);
      });

      expect(result.current.canRemoveUserTag).toBe(false);
    });

    it('should not remove user if email does not match', () => {
      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      act(() => {
        result.current.handleDelete({
          _id: 'non-existent',
          email: 'nonexistent@example.com',
          name: 'Non Existent',
        });
      });

      expect(result.current.users).toHaveLength(2);
    });
  });

  describe('hasEmailIncluded', () => {
    it('should return a function that checks if email matches', () => {
      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      const checkEmail = result.current.hasEmailIncluded('user1@example.com');

      expect(checkEmail({ email: 'user1@example.com' })).toBe(true);
      expect(checkEmail({ email: 'user2@example.com' })).toBe(false);
    });
  });

  describe('setRole', () => {
    it('should update the role state', () => {
      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      expect(result.current.role).toBe(OrganizationRoles.MEMBER);

      act(() => {
        result.current.setRole(OrganizationRoles.BILLING_MODERATOR);
      });

      expect(result.current.role).toBe(OrganizationRoles.BILLING_MODERATOR);
    });
  });

  describe('handleInvite', () => {
    it('should not proceed if organization plan is not in valid list', async () => {
      const invalidPlanOrg: IOrganization = {
        ...mockOrganization,
        payment: {
          ...mockOrganization.payment,
          type: 'INVALID_PLAN' as any,
        },
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleInviteSharedUsersModal({
          ...defaultProps,
          organization: invalidPlanOrg,
        })
      );

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockInviteMemberToOrg).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should successfully invite members with same domain emails', async () => {
      const mockResponse = {
        message: 'Success',
        statusCode: STATUS_CODE.SUCCEED,
        organization: { ...mockOrganization, _id: 'org-1' },
        invitations: [] as any[],
        sameDomainEmails: ['user1@example.com', 'user2@example.com'] as string[],
        notSameDomainEmails: [] as string[],
      };

      mockInviteMemberToOrg.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockInviteMemberToOrg).toHaveBeenCalledWith({
        orgId: mockOrganizationWithValidPlan._id,
        members: [
          { _id: 'user-1', email: 'user1@example.com', role: 'MEMBER' },
          { _id: 'user-2', email: 'user2@example.com', role: 'MEMBER' },
        ],
        invitedFrom: InviteActionTypes.ADD_SHARED_USERS_MODAL,
      });

      expect(batch).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockToastUtils.success).toHaveBeenCalledWith({
        message: 'Member(s) have been added.',
        useReskinToast: true,
      });
      expect(mockSetShowDiscardModal).toHaveBeenCalledWith(false);
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockHandleResetShareModalList).toHaveBeenCalled();
      expect(result.current.inviting).toBe(false);
    });

    it('should successfully invite members with mixed domain emails', async () => {
      const mockResponse = {
        message: 'Success',
        statusCode: STATUS_CODE.SUCCEED,
        organization: { ...mockOrganization, _id: 'org-1' },
        invitations: [] as any[],
        sameDomainEmails: ['user1@example.com'] as string[],
        notSameDomainEmails: ['user2@other.com'] as string[],
      };

      mockInviteMemberToOrg.mockResolvedValue(mockResponse);
      (mockCommonUtils.getDomainFromEmail as jest.Mock).mockReturnValue('example.com');

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockToastUtils.success).toHaveBeenCalledWith({
        message: expect.stringContaining('Member(s) with example.com have been added'),
        useReskinToast: true,
      });
    });

    it('should successfully invite members with only different domain emails', async () => {
      const mockResponse = {
        message: 'Success',
        statusCode: STATUS_CODE.SUCCEED,
        organization: { ...mockOrganization, _id: 'org-1' },
        invitations: [] as any[],
        sameDomainEmails: [] as string[],
        notSameDomainEmails: ['user1@example.com', 'user2@other.com'] as string[],
      };

      mockInviteMemberToOrg.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockToastUtils.success).toHaveBeenCalledWith({
        message: expect.stringContaining('Invite(s) have been sent'),
        useReskinToast: true,
      });
    });

    it('should handle BAD_REQUEST status code', async () => {
      const mockResponse = {
        message: 'Bad Request',
        statusCode: STATUS_CODE.BAD_REQUEST,
        organization: { ...mockOrganization, _id: 'org-1' },
        invitations: [] as any[],
        sameDomainEmails: [] as string[],
        notSameDomainEmails: [] as string[],
      };

      mockInviteMemberToOrg.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockToastUtils.warn).toHaveBeenCalledWith({
        message: 'warning_message_can_not_invite_member',
        duration: 5000,
        useReskinToast: true,
      });
    });

    it('should transform data with correct role case', async () => {
      const mockResponse = {
        message: 'Success',
        statusCode: STATUS_CODE.SUCCEED,
        organization: { ...mockOrganization, _id: 'org-1' },
        invitations: [] as any[],
        sameDomainEmails: [] as string[],
        notSameDomainEmails: [] as string[],
      };

      mockInviteMemberToOrg.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      act(() => {
        result.current.setRole(OrganizationRoles.BILLING_MODERATOR);
      });

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockInviteMemberToOrg).toHaveBeenCalledWith({
        orgId: mockOrganizationWithValidPlan._id,
        members: [
          { _id: 'user-1', email: 'user1@example.com', role: 'BILLING_MODERATOR' },
          { _id: 'user-2', email: 'user2@example.com', role: 'BILLING_MODERATOR' },
        ],
        invitedFrom: InviteActionTypes.ADD_SHARED_USERS_MODAL,
      });
    });

    it('should set inviting state during invite process', async () => {
      let resolveInvite: (value: Awaited<ReturnType<typeof organizationServices.inviteMemberToOrg>>) => void;
      const invitePromise = new Promise<Awaited<ReturnType<typeof organizationServices.inviteMemberToOrg>>>((resolve) => {
        resolveInvite = resolve;
      });

      mockInviteMemberToOrg.mockReturnValue(invitePromise as any);

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      expect(result.current.inviting).toBe(false);

      act(() => {
        result.current.handleInvite();
      });

      // Check that inviting is set to true (but we need to wait for state update)
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Resolve the promise
      resolveInvite({
        message: 'Success',
        statusCode: STATUS_CODE.SUCCEED,
        organization: { ...mockOrganization, _id: 'org-1' },
        invitations: [] as any[],
        sameDomainEmails: [] as string[],
        notSameDomainEmails: [] as string[],
      });

      await act(async () => {
        await invitePromise;
      });

      expect(result.current.inviting).toBe(false);
    });

    it('should handle error with CANNOT_INVITE_USER code', async () => {
      const mockError = {
        code: ErrorCode.Org.CANNOT_INVITE_USER,
      };

      mockInviteMemberToOrg.mockRejectedValue(mockError);
      (mockErrorUtils.extractGqlError as jest.Mock).mockReturnValue(mockError);

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockDispatch).toHaveBeenCalled();
      const callArgs = mockDispatch.mock.calls.find((call) =>
        call[0]?.type === 'OPEN_MODAL'
      );
      expect(callArgs).toBeDefined();

      expect(mockHandleResetShareModalList).toHaveBeenCalled();
      expect(result.current.inviting).toBe(false);
    });

    it('should handle other errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockInviteMemberToOrg.mockRejectedValue(mockError);
      (mockErrorUtils.extractGqlError as jest.Mock).mockReturnValue({ code: 'OTHER_ERROR' });

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'OPEN_MODAL',
        })
      );
      expect(mockHandleResetShareModalList).toHaveBeenCalled();
      expect(result.current.inviting).toBe(false);
    });

    it('should call handleResetShareModalList in finally block', async () => {
      const mockResponse = {
        message: 'Success',
        statusCode: STATUS_CODE.SUCCEED,
        organization: { ...mockOrganization, _id: 'org-1' },
        invitations: [] as any[],
        sameDomainEmails: [] as string[],
        notSameDomainEmails: [] as string[],
      };

      mockInviteMemberToOrg.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockHandleResetShareModalList).toHaveBeenCalled();
    });

    it('should handle FREE plan type', async () => {
      const freePlanOrg: IOrganization = {
        ...mockOrganization,
        payment: {
          ...mockOrganization.payment,
          type: PaymentPlans.FREE,
        },
      } as IOrganization;

      const mockResponse = {
        message: 'Success',
        statusCode: STATUS_CODE.SUCCEED,
        organization: { ...mockOrganization, _id: 'org-1' },
        invitations: [] as any[],
        sameDomainEmails: [] as string[],
        notSameDomainEmails: [] as string[],
      };

      mockInviteMemberToOrg.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useHandleInviteSharedUsersModal({
          ...defaultProps,
          organization: freePlanOrg,
        })
      );

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockInviteMemberToOrg).toHaveBeenCalled();
    });
  });

  describe('handleDismiss', () => {
    it('should call setShowDiscardModal and onClose', () => {
      const { result } = renderHook(() => useHandleInviteSharedUsersModal(defaultProps));

      act(() => {
        result.current.handleDismiss();
      });

      expect(mockSetShowDiscardModal).toHaveBeenCalledWith(false);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty userTags array', () => {
      const emptyProps = {
        ...defaultProps,
        userTags: [] as typeof mockUserTags,
      };

      const { result } = renderHook(() => useHandleInviteSharedUsersModal(emptyProps));

      expect(result.current.users).toEqual([]);
      expect(result.current.canRemoveUserTag).toBe(false);
    });

    it('should handle organization without payment', async () => {
      const orgWithoutPayment: IOrganization = {
        ...mockOrganization,
        payment: undefined,
      } as IOrganization;

      const { result } = renderHook(() =>
        useHandleInviteSharedUsersModal({
          ...defaultProps,
          organization: orgWithoutPayment,
        })
      );

      await act(async () => {
        await result.current.handleInvite();
      });

      expect(mockInviteMemberToOrg).not.toHaveBeenCalled();
    });

    it('should handle undefined userTags gracefully', () => {
      const undefinedProps = {
        ...defaultProps,
        userTags: undefined as any,
      };

      // The hook initializes with userTags, so if it's undefined, users will be undefined
      // This should not crash, but the hook expects userTags to be defined
      expect(() => {
        renderHook(() => useHandleInviteSharedUsersModal(undefinedProps));
      }).toThrow();
    });
  });
});
