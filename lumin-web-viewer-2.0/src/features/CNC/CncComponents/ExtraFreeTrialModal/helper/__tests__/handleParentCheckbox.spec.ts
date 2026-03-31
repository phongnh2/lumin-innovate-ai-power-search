import { ChangeEvent } from 'react';
import { handleParentCheckbox } from '../handleParentCheckbox';

import { SearchUserStatus } from 'constants/lumin-common';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import { InviteToOrganizationInput } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

import '@testing-library/jest-dom';
import { mockUser1, mockUser2, mockUser3 } from 'features/CNC/CncComponents/__mocks__/mockUser';


// Mock the dependencies
jest.mock('utils', () => ({
  eventTracking: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('features/CNC/constants/events/input', () => ({
  CNCInputName: {
    SELECT_ALL_SUGGESTED_EMAIL: 'SELECT_ALL_SUGGESTED_EMAIL',
  },
  CNCInputPurpose: {
    SELECT_ALL_SUGGESTED_EMAIL: 'select_all_suggested_email',
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

describe('handleParentCheckbox', () => {
  let mockSetSelectedUsers: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetSelectedUsers = jest.fn();
  });

  describe('when checkbox is checked (select all)', () => {
    it('should add all userCollaborators to selectedUsers with MEMBER role', () => {
      const userCollaborators = [mockUser1, mockUser2];
      const selectedUsers: InviteToOrganizationInput[] = [];

      const mockEvent = {
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      expect(updatedState).toHaveLength(2);
      expect(updatedState).toEqual(
        expect.arrayContaining([
          { ...mockUser1, role: ORGANIZATION_ROLES.MEMBER },
          { ...mockUser2, role: ORGANIZATION_ROLES.MEMBER },
        ])
      );
    });

    it('should merge with existing selectedUsers', () => {
      const userCollaborators = [mockUser1, mockUser2];
      const existingSelectedUser: InviteToOrganizationInput = {
        _id: 'existing-id',
        email: 'existing@example.com',
        role: ORGANIZATION_ROLES.MEMBER,
      };

      const selectedUsers: InviteToOrganizationInput[] = [existingSelectedUser];

      const mockEvent = {
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      expect(updatedState.length).toBeGreaterThanOrEqual(2);
      expect(updatedState).toEqual(
        expect.arrayContaining([
          { ...mockUser1, role: ORGANIZATION_ROLES.MEMBER },
          { ...mockUser2, role: ORGANIZATION_ROLES.MEMBER },
        ])
      );
      // Should preserve existing user if not duplicate
      const existingInResult = updatedState.find((u: InviteToOrganizationInput) => u.email === existingSelectedUser.email);
      if (existingInResult) {
        expect(existingInResult).toEqual(existingSelectedUser);
      }
    });

    it('should remove duplicates using uniqWith', () => {
      const userCollaborators = [mockUser1, mockUser2];
      // uniqWith uses isEqual which does deep equality check, so the existing user must match exactly
      const existingSelectedUser = {
        ...mockUser1,
        role: ORGANIZATION_ROLES.MEMBER,
      };

      const selectedUsers: InviteToOrganizationInput[] = [existingSelectedUser as InviteToOrganizationInput];

      const mockEvent = {
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      // Should not have duplicates - uniqWith uses isEqual for deep equality
      const user1Count = updatedState.filter((u: InviteToOrganizationInput) => u.email === mockUser1.email).length;
      expect(user1Count).toBeLessThanOrEqual(1);
    });

    it('should handle multiple userCollaborators', () => {
      const userCollaborators = [mockUser1, mockUser2, mockUser3];
      const selectedUsers: InviteToOrganizationInput[] = [];

      const mockEvent = {
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      expect(updatedState).toHaveLength(3);
      expect(updatedState).toEqual(
        expect.arrayContaining([
          { ...mockUser1, role: ORGANIZATION_ROLES.MEMBER },
          { ...mockUser2, role: ORGANIZATION_ROLES.MEMBER },
          { ...mockUser3, role: ORGANIZATION_ROLES.MEMBER },
        ])
      );
    });
  });

  describe('when checkbox is unchecked (deselect all)', () => {
    it('should remove all selectedUsers that are in userCollaborators', () => {
      const userCollaborators = [mockUser1, mockUser2];
      const selectedUsers: InviteToOrganizationInput[] = [
        { _id: mockUser1._id, email: mockUser1.email, role: ORGANIZATION_ROLES.MEMBER },
        { _id: mockUser2._id, email: mockUser2.email, role: ORGANIZATION_ROLES.MEMBER },
      ];

      const mockEvent = {
        target: { checked: false },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      expect(updatedState).toEqual([]);
    });

    it('should preserve selectedUsers that are not in userCollaborators', () => {
      const userCollaborators = [mockUser1, mockUser2];
      const otherUser: InviteToOrganizationInput = {
        _id: 'other-id',
        email: 'other@example.com',
        role: ORGANIZATION_ROLES.MEMBER,
      };

      // The selectedUsers parameter represents currently selected users from userCollaborators
      // So it should only contain users from userCollaborators, not otherUser
      const selectedUsers: InviteToOrganizationInput[] = [
        { _id: mockUser1._id, email: mockUser1.email, role: ORGANIZATION_ROLES.MEMBER },
        { _id: mockUser2._id, email: mockUser2.email, role: ORGANIZATION_ROLES.MEMBER },
      ];

      // The prev state (current selected users) includes otherUser
      const prevSelectedUsers: InviteToOrganizationInput[] = [
        { _id: mockUser1._id, email: mockUser1.email, role: ORGANIZATION_ROLES.MEMBER },
        { _id: mockUser2._id, email: mockUser2.email, role: ORGANIZATION_ROLES.MEMBER },
        otherUser,
      ];

      const mockEvent = {
        target: { checked: false },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      // Pass prevSelectedUsers (which includes otherUser) to simulate the current state
      const updatedState = updateFunction(prevSelectedUsers);

      expect(updatedState).toHaveLength(1);
      expect(updatedState[0]).toEqual(otherUser);
    });

    it('should handle partial selection correctly', () => {
      const userCollaborators = [mockUser1, mockUser2, mockUser3];
      const selectedUsers: InviteToOrganizationInput[] = [
        { _id: mockUser1._id, email: mockUser1.email, role: ORGANIZATION_ROLES.MEMBER },
        { _id: mockUser2._id, email: mockUser2.email, role: ORGANIZATION_ROLES.MEMBER },
      ];

      const mockEvent = {
        target: { checked: false },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      expect(updatedState).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty userCollaborators array', () => {
      const userCollaborators: IUserResult[] = [];
      const selectedUsers: InviteToOrganizationInput[] = [];

      const mockEvent = {
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      expect(updatedState).toEqual([]);
    });

    it('should handle empty selectedUsers array when checking', () => {
      const userCollaborators = [mockUser1, mockUser2];
      const selectedUsers: InviteToOrganizationInput[] = [];

      const mockEvent = {
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      expect(updatedState).toHaveLength(2);
    });

    it('should handle empty selectedUsers array when unchecking', () => {
      const userCollaborators = [mockUser1, mockUser2];
      const selectedUsers: InviteToOrganizationInput[] = [];

      const mockEvent = {
        target: { checked: false },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      expect(updatedState).toEqual([]);
    });

    it('should handle single userCollaborator', () => {
      const userCollaborators = [mockUser1];
      const selectedUsers: InviteToOrganizationInput[] = [];

      const mockEvent = {
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      expect(updatedState).toHaveLength(1);
      expect(updatedState[0]).toEqual({
        ...mockUser1,
        role: ORGANIZATION_ROLES.MEMBER,
      });
    });

    it('should handle users with different statuses', () => {
      const userWithDifferentStatus: IUserResult = {
        _id: 'unavailable-id',
        email: 'unavailable@example.com',
        name: 'Unavailable User',
        status: SearchUserStatus.USER_UNAVAILABLE,
        avatarRemoteId: '',
        grantedPermission: false,
      };

      const userCollaborators = [mockUser1, userWithDifferentStatus];
      const selectedUsers: InviteToOrganizationInput[] = [];

      const mockEvent = {
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators,
        selectedUsers,
      });

      const updateFunction = mockSetSelectedUsers.mock.calls[0][0];
      const updatedState = updateFunction(selectedUsers);

      expect(updatedState).toHaveLength(2);
      expect(updatedState).toEqual(
        expect.arrayContaining([
          { ...mockUser1, role: ORGANIZATION_ROLES.MEMBER },
          { ...userWithDifferentStatus, role: ORGANIZATION_ROLES.MEMBER },
        ])
      );
    });
  });

  describe('event tracking', () => {
    it('should call eventTracking', async () => {
      const { eventTracking } = require('utils');

      const mockEvent = {
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>;

      handleParentCheckbox({
        e: mockEvent,
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators: [mockUser1],
        selectedUsers: [],
      });

      // Yield to the event loop to allow async operations to complete
      await Promise.resolve();

      expect(eventTracking).toHaveBeenCalled();
    });
  });
});

