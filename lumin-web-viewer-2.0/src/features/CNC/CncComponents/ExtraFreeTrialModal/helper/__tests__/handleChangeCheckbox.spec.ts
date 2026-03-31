import { handleChangeCheckbox } from '../handleChangeCheckbox';

import { SearchUserStatus } from 'constants/lumin-common';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import { InviteToOrganizationInput } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

import '@testing-library/jest-dom';
import { mockUser1 } from 'features/CNC/CncComponents/__mocks__/mockUser';

// Mock the dependencies
jest.mock('utils', () => ({
  eventTracking: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('features/CNC/constants/events/input', () => ({
  CNCInputName: {
    SELECT_SUGGESTED_EMAIL: 'SELECT_SUGGESTED_EMAIL',
  },
  CNCInputPurpose: {
    SELECT_SUGGESTED_EMAIL: 'select_suggested_email',
  },
}));

jest.mock('constants/eventConstants', () => ({
  __esModule: true,
  default: {
    EventType: {
      CLICK: 'CLICK',
    },
  },
}));

describe('handleChangeCheckbox', () => {
  let mockSetSelectedUsers: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetSelectedUsers = jest.fn();
  });

  describe('when user is not in selectedUsers', () => {
    it('should add user to selectedUsers with MEMBER role', () => {
      const initialSelectedUsers: InviteToOrganizationInput[] = [];

      handleChangeCheckbox({
        user: mockUser1,
        setSelectedUsers: mockSetSelectedUsers,
      });

      expect(mockSetSelectedUsers).toHaveBeenCalledTimes(1);
      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];

      // Use the update function with initial state (immer produce pattern)
      const updatedState = updateFunction(initialSelectedUsers);

      expect(updatedState).toEqual([
        {
          ...mockUser1,
          role: ORGANIZATION_ROLES.MEMBER,
        },
      ]);
    });

    it('should add user to the beginning of the selectedUsers array', () => {
      const initialSelectedUsers: InviteToOrganizationInput[] = [
        {
          _id: 'existing-id',
          email: 'existing@example.com',
          role: ORGANIZATION_ROLES.MEMBER,
        },
      ];

      handleChangeCheckbox({
        user: mockUser1,
        setSelectedUsers: mockSetSelectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(initialSelectedUsers);

      expect(updatedState).toHaveLength(2);
      expect(updatedState[0]).toEqual({
        ...mockUser1,
        role: ORGANIZATION_ROLES.MEMBER,
      });
      expect(updatedState[1]).toEqual(initialSelectedUsers[0]);
    });

    it('should preserve existing selected users', () => {
      const existingUser: InviteToOrganizationInput = {
        _id: 'existing-id',
        email: 'existing@example.com',
        role: ORGANIZATION_ROLES.MEMBER,
      };

      const initialSelectedUsers: InviteToOrganizationInput[] = [existingUser];

      handleChangeCheckbox({
        user: mockUser1,
        setSelectedUsers: mockSetSelectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(initialSelectedUsers);

      expect(updatedState).toContainEqual(existingUser);
      expect(updatedState).toContainEqual({
        ...mockUser1,
        role: ORGANIZATION_ROLES.MEMBER,
      });
    });
  });

  describe('when user is already in selectedUsers', () => {
    it('should remove user from selectedUsers', () => {
      const initialSelectedUsers: InviteToOrganizationInput[] = [
        {
          _id: mockUser1._id,
          email: mockUser1.email,
          role: ORGANIZATION_ROLES.MEMBER,
        },
      ];

      handleChangeCheckbox({
        user: mockUser1,
        setSelectedUsers: mockSetSelectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(initialSelectedUsers);

      expect(updatedState).toEqual([]);
    });

    it('should remove only the specific user by email', () => {
      const otherUser: InviteToOrganizationInput = {
        _id: 'other-id',
        email: 'other@example.com',
        role: ORGANIZATION_ROLES.MEMBER,
      };

      const initialSelectedUsers: InviteToOrganizationInput[] = [
        {
          _id: mockUser1._id,
          email: mockUser1.email,
          role: ORGANIZATION_ROLES.MEMBER,
        },
        otherUser,
      ];

      handleChangeCheckbox({
        user: mockUser1,
        setSelectedUsers: mockSetSelectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(initialSelectedUsers);

      expect(updatedState).toHaveLength(1);
      expect(updatedState[0]).toEqual(otherUser);
      expect(updatedState).not.toContainEqual({
        ...mockUser1,
        role: ORGANIZATION_ROLES.MEMBER,
      });
    });

    it('should preserve other selected users', () => {
      const otherUser1: InviteToOrganizationInput = {
        _id: 'other1-id',
        email: 'other1@example.com',
        role: ORGANIZATION_ROLES.MEMBER,
      };

      const otherUser2: InviteToOrganizationInput = {
        _id: 'other2-id',
        email: 'other2@example.com',
        role: ORGANIZATION_ROLES.MEMBER,
      };

      const initialSelectedUsers: InviteToOrganizationInput[] = [
        {
          _id: mockUser1._id,
          email: mockUser1.email,
          role: ORGANIZATION_ROLES.MEMBER,
        },
        otherUser1,
        otherUser2,
      ];

      handleChangeCheckbox({
        user: mockUser1,
        setSelectedUsers: mockSetSelectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(initialSelectedUsers);

      expect(updatedState).toHaveLength(2);
      expect(updatedState).toContainEqual(otherUser1);
      expect(updatedState).toContainEqual(otherUser2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty selectedUsers array', () => {
      const initialSelectedUsers: InviteToOrganizationInput[] = [];

      handleChangeCheckbox({
        user: mockUser1,
        setSelectedUsers: mockSetSelectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(initialSelectedUsers);

      expect(updatedState).toHaveLength(1);
      expect(updatedState[0]).toEqual({
        ...mockUser1,
        role: ORGANIZATION_ROLES.MEMBER,
      });
    });

    it('should handle user with different properties', () => {
      const userWithAllProps: IUserResult = {
        _id: 'fulluser-id',
        email: 'fulluser@example.com',
        name: 'Full User',
        status: SearchUserStatus.USER_VALID,
        avatarRemoteId: 'avatar456',
        grantedPermission: true,
      };

      const initialSelectedUsers: InviteToOrganizationInput[] = [];

      handleChangeCheckbox({
        user: userWithAllProps,
        setSelectedUsers: mockSetSelectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(initialSelectedUsers);

      expect(updatedState[0]).toEqual({
        ...userWithAllProps,
        role: ORGANIZATION_ROLES.MEMBER,
      });
    });

    it('should handle user with minimal properties', () => {
      const minimalUser: IUserResult = {
        _id: 'minimal-id',
        email: 'minimal@example.com',
        name: '',
        status: SearchUserStatus.USER_UNAVAILABLE,
        avatarRemoteId: '',
        grantedPermission: false,
      };

      const initialSelectedUsers: InviteToOrganizationInput[] = [];

      handleChangeCheckbox({
        user: minimalUser,
        setSelectedUsers: mockSetSelectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(initialSelectedUsers);

      expect(updatedState[0]).toEqual({
        ...minimalUser,
        role: ORGANIZATION_ROLES.MEMBER,
      });
    });
  });

  describe('event tracking', () => {
    it('should call eventTracking', async () => {
      const { eventTracking } = require('utils');

      handleChangeCheckbox({
        user: mockUser1,
        setSelectedUsers: mockSetSelectedUsers,
      });

      // Give time for async call
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(eventTracking).toHaveBeenCalled();
    });
  });
});

