import React from 'react';
import { render, screen, fireEvent } from 'features/CNC/utils/testUtil';

import AddUserCollaborators from '../AddUserCollaborators';

import { SearchUserStatus, UserStatus } from 'constants/lumin-common';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import { InviteToOrganizationInput } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

import { handleChangeCheckbox } from '../../helper/handleChangeCheckbox';
import { handleParentCheckbox } from '../../helper/handleParentCheckbox';

import '@testing-library/jest-dom';
import { mockUser1, mockUser2, mockUserUnavailable } from 'features/CNC/CncComponents/__mocks__/mockUser';

jest.mock('lumin-components/Shared/Checkbox', () => ({
  Checkbox: ({ checked, onChange, indeterminate }: any) => {
    const testId = indeterminate !== undefined ? 'checkbox-parent' : 'checkbox-user';
    return (
      <input
        type="checkbox"
        data-testid={testId}
        checked={checked}
        onChange={onChange}
        data-indeterminate={indeterminate}
      />
    );
  },
}));

jest.mock('lumin-components/MaterialAvatar', () => ({
  __esModule: true,
  default: ({ src, children }: any) => (
    <div data-testid="material-avatar" data-src={src}>
      {children}
    </div>
  ),
}));

jest.mock('utils', () => ({
  avatar: {
    getTextAvatar: jest.fn((name: string) => name?.charAt(0)?.toUpperCase() || 'U'),
  },
  capitalize: jest.fn((str: string) => str.charAt(0).toUpperCase() + str.slice(1)),
}));

jest.mock('../../helper/handleChangeCheckbox', () => ({
  handleChangeCheckbox: jest.fn(),
}));

jest.mock('../../helper/handleParentCheckbox', () => ({
  handleParentCheckbox: jest.fn(),
}));

const mockHandleChangeCheckbox = handleChangeCheckbox as jest.MockedFunction<typeof handleChangeCheckbox>;
const mockHandleParentCheckbox = handleParentCheckbox as jest.MockedFunction<typeof handleParentCheckbox>;

describe('AddUserCollaborators', () => {
  const mockSetSelectedUsers = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when userCollaborators is empty', () => {
    it('should return null', () => {
      const { container } = render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[]}
        />
      );

      // Component returns null, so no content should be rendered
      expect(container.querySelector('.container')).not.toBeInTheDocument();
      expect(screen.queryByText('Select who you want to collaborate with:')).not.toBeInTheDocument();
    });
  });

  describe('when userCollaborators has items', () => {
    it('should render the component with header and list', () => {
      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUser1, mockUser2]}
        />
      );

      expect(screen.getByText('Select who you want to collaborate with:')).toBeInTheDocument();
      expect(screen.getByText('0/2 selected')).toBeInTheDocument();
    });

    it('should render all user collaborators', () => {
      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUser1, mockUser2]}
        />
      );

      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });

    it('should display correct selected count', () => {
      const selectedUsers: InviteToOrganizationInput[] = [
        { _id: mockUser1._id, email: mockUser1.email, role: ORGANIZATION_ROLES.MEMBER },
      ];

      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={selectedUsers}
          userCollaborators={[mockUser1, mockUser2]}
        />
      );

      expect(screen.getByText('1/2 selected')).toBeInTheDocument();
    });

    it('should display all selected count when all users are selected', () => {
      const selectedUsers: InviteToOrganizationInput[] = [
        { _id: mockUser1._id, email: mockUser1.email, role: ORGANIZATION_ROLES.MEMBER },
        { _id: mockUser2._id, email: mockUser2.email, role: ORGANIZATION_ROLES.MEMBER },
      ];

      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={selectedUsers}
          userCollaborators={[mockUser1, mockUser2]}
        />
      );

      expect(screen.getByText('2/2 selected')).toBeInTheDocument();
    });
  });

  describe('parent checkbox behavior', () => {
    it('should render parent checkbox as unchecked when no users are selected', () => {
      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUser1, mockUser2]}
        />
      );

      const parentCheckbox = screen.getByTestId('checkbox-parent');
      expect(parentCheckbox).not.toBeChecked();
      expect(parentCheckbox).toHaveAttribute('data-indeterminate', 'false');
    });

    it('should render parent checkbox as checked when all users are selected', () => {
      const selectedUsers: InviteToOrganizationInput[] = [
        { _id: mockUser1._id, email: mockUser1.email, role: ORGANIZATION_ROLES.MEMBER },
        { _id: mockUser2._id, email: mockUser2.email, role: ORGANIZATION_ROLES.MEMBER },
      ];

      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={selectedUsers}
          userCollaborators={[mockUser1, mockUser2]}
        />
      );

      const parentCheckbox = screen.getByTestId('checkbox-parent');
      expect(parentCheckbox).toBeChecked();
      expect(parentCheckbox).toHaveAttribute('data-indeterminate', 'false');
    });

    it('should render parent checkbox as indeterminate when some users are selected', () => {
      const selectedUsers: InviteToOrganizationInput[] = [
        { _id: mockUser1._id, email: mockUser1.email, role: ORGANIZATION_ROLES.MEMBER },
      ];

      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={selectedUsers}
          userCollaborators={[mockUser1, mockUser2]}
        />
      );

      const parentCheckbox = screen.getByTestId('checkbox-parent');
      expect(parentCheckbox).toHaveAttribute('data-indeterminate', 'true');
    });

    it('should call handleParentCheckbox when parent checkbox is clicked', () => {
      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUser1, mockUser2]}
        />
      );

      const parentCheckbox = screen.getByTestId('checkbox-parent') as HTMLInputElement;
      // Click the checkbox which triggers onChange with the event
      fireEvent.click(parentCheckbox);

      expect(mockHandleParentCheckbox).toHaveBeenCalledWith({
        e: expect.objectContaining({
          target: expect.objectContaining({
            checked: expect.any(Boolean),
          }),
        }),
        setSelectedUsers: mockSetSelectedUsers,
        userCollaborators: [mockUser1, mockUser2],
        selectedUsers: [],
      });
    });
  });

  describe('individual user checkbox behavior', () => {
    it('should render user checkboxes as unchecked when user is not selected', () => {
      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUser1]}
        />
      );

      const userCheckbox = screen.getByTestId('checkbox-user');
      expect(userCheckbox).not.toBeChecked();
    });

    it('should render user checkbox as checked when user is selected', () => {
      const selectedUsers: InviteToOrganizationInput[] = [
        { _id: mockUser1._id, email: mockUser1.email, role: ORGANIZATION_ROLES.MEMBER },
      ];

      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={selectedUsers}
          userCollaborators={[mockUser1]}
        />
      );

      const userCheckbox = screen.getByTestId('checkbox-user');
      expect(userCheckbox).toBeChecked();
    });

    it('should call handleChangeCheckbox when user checkbox is clicked', () => {
      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUser1]}
        />
      );

      const userCheckbox = screen.getByTestId('checkbox-user') as HTMLInputElement;
      // Use click event which triggers onChange in the mocked Checkbox
      fireEvent.click(userCheckbox);

      expect(mockHandleChangeCheckbox).toHaveBeenCalledWith({
        user: mockUser1,
        setSelectedUsers: mockSetSelectedUsers,
      });
    });
  });

  describe('user status handling', () => {
    it('should display user name when available', () => {
      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUser1]}
        />
      );

      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    it('should display UNAVAILABLE label when user status is USER_UNAVAILABLE and name is empty', () => {
      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUserUnavailable]}
        />
      );

      expect(screen.getByText(UserStatus.UNAVAILABLE)).toBeInTheDocument();
    });

    it('should display PENDING label when user status is not USER_UNAVAILABLE but name is empty', () => {
      const mockUserPending: IUserResult = {
        _id: 'user4-id',
        email: 'user4@example.com',
        name: '',
        status: SearchUserStatus.USER_VALID,
        avatarRemoteId: '',
        grantedPermission: true,
      };

      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUserPending]}
        />
      );

      expect(screen.getByText(UserStatus.PENDING)).toBeInTheDocument();
    });
  });

  describe('MaterialAvatar rendering', () => {
    it('should render MaterialAvatar for each user', () => {
      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUser1, mockUser2]}
        />
      );

      const avatars = screen.getAllByTestId('material-avatar');
      expect(avatars).toHaveLength(2);
      expect(avatars[0]).toHaveAttribute('data-src', 'avatar1');
      expect(avatars[1]).toHaveAttribute('data-src', 'avatar2');
    });

    it('should handle users without avatarRemoteId', () => {
      const mockUserNoAvatar: IUserResult = {
        _id: 'user5-id',
        email: 'user5@example.com',
        name: 'User Five',
        status: SearchUserStatus.USER_VALID,
        avatarRemoteId: '',
        grantedPermission: true,
      };

      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUserNoAvatar]}
        />
      );

      const avatars = screen.getAllByTestId('material-avatar');
      expect(avatars).toHaveLength(1);
      expect(avatars[0]).toHaveAttribute('data-src', '');
    });
  });

  describe('edge cases', () => {
    it('should handle single user correctly', () => {
      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={[mockUser1]}
        />
      );

      expect(screen.getByText('0/1 selected')).toBeInTheDocument();
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    it('should handle many users correctly', () => {
      const manyUsers: IUserResult[] = Array.from({ length: 10 }, (_, i) => ({
        _id: `user${i}-id`,
        email: `user${i}@example.com`,
        name: `User ${i}`,
        status: SearchUserStatus.USER_VALID,
        avatarRemoteId: `avatar${i}`,
        grantedPermission: true,
      }));

      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={[]}
          userCollaborators={manyUsers}
        />
      );

      expect(screen.getByText('0/10 selected')).toBeInTheDocument();
    });

    it('should handle partial selection correctly', () => {
      const manyUsers: IUserResult[] = Array.from({ length: 5 }, (_, i) => ({
        _id: `user${i}-id`,
        email: `user${i}@example.com`,
        name: `User ${i}`,
        status: SearchUserStatus.USER_VALID,
        avatarRemoteId: `avatar${i}`,
        grantedPermission: true,
      }));

      const selectedUsers: InviteToOrganizationInput[] = [
        { _id: manyUsers[0]._id, email: manyUsers[0].email, role: ORGANIZATION_ROLES.MEMBER },
        { _id: manyUsers[1]._id, email: manyUsers[1].email, role: ORGANIZATION_ROLES.MEMBER },
      ];

      render(
        <AddUserCollaborators
          setSelectedUsers={mockSetSelectedUsers}
          selectedUsers={selectedUsers}
          userCollaborators={manyUsers}
        />
      );

      expect(screen.getByText('2/5 selected')).toBeInTheDocument();
      const parentCheckbox = screen.getByTestId('checkbox-parent');
      expect(parentCheckbox).toHaveAttribute('data-indeterminate', 'true');
    });
  });
});

