import { produce } from 'immer';
import { filter } from 'lodash';

import { eventTracking } from 'utils';

import { CNCInputName, CNCInputPurpose } from 'features/CNC/constants/events/input';

import UserEventConstants from 'constants/eventConstants';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import { InviteToOrganizationInput } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

export const handleChangeCheckbox = ({
  user,
  setSelectedUsers,
}: {
  user: IUserResult;
  setSelectedUsers: React.Dispatch<React.SetStateAction<InviteToOrganizationInput[]>>;
}) => {
  setSelectedUsers((prev) =>
    produce(prev, (draftState) => {
      const selectedUser = draftState.find((item) => user.email === item.email);
      if (selectedUser) {
        return filter(draftState, (item) => user.email !== item.email);
      }
      return [
        {
          ...user,
          role: ORGANIZATION_ROLES.MEMBER,
        },
        ...draftState,
      ];
    })
  );
  eventTracking(UserEventConstants.EventType.CLICK, {
    elementName: CNCInputName.SELECT_SUGGESTED_EMAIL,
    elementPurpose: CNCInputPurpose[CNCInputName.SELECT_SUGGESTED_EMAIL],
  }).catch(() => {});
};
