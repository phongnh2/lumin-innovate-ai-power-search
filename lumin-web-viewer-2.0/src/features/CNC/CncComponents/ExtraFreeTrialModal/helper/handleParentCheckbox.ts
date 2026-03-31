import { filter, uniqWith, isEqual } from 'lodash';
import { ChangeEvent } from 'react';

import { eventTracking } from 'utils';

import { CNCInputName, CNCInputPurpose } from 'features/CNC/constants/events/input';

import UserEventConstants from 'constants/eventConstants';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import { InviteToOrganizationInput } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

export const handleParentCheckbox = ({
  e,
  setSelectedUsers,
  userCollaborators,
  selectedUsers,
}: {
  e: ChangeEvent<HTMLInputElement>;
  setSelectedUsers: React.Dispatch<React.SetStateAction<InviteToOrganizationInput[]>>;
  userCollaborators: IUserResult[];
  selectedUsers: InviteToOrganizationInput[];
}) => {
  const isSelected = e.target.checked;
  if (isSelected) {
    setSelectedUsers((prev) => {
      const _userCollaborator = userCollaborators.map((user) => ({ ...user, role: ORGANIZATION_ROLES.MEMBER }));
      const newSelectedUsers = [...prev, ..._userCollaborator];
      return uniqWith(newSelectedUsers, isEqual) as InviteToOrganizationInput[];
    });
  } else {
    setSelectedUsers((prev) =>
      filter(prev, (item) => !selectedUsers.some((checkedUser) => item.email === checkedUser.email))
    );
  }
  eventTracking(UserEventConstants.EventType.CLICK, {
    elementName: CNCInputName.SELECT_ALL_SUGGESTED_EMAIL,
    elementPurpose: CNCInputPurpose[CNCInputName.SELECT_ALL_SUGGESTED_EMAIL],
  }).catch(() => {});
};
