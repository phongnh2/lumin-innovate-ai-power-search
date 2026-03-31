import { debounce } from 'lodash';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import FreeTrialContext from 'luminComponents/OrganizationFreeTrial/FreeTrialContext';

import { userServices } from 'services';

import { errorUtils, toastUtils, validator } from 'utils';

import getPrioritizedUsers from 'features/CNC/CncComponents/InviteCollaborators/helper/getPrioritizedUsers';
import { CNC_LOCAL_STORAGE_KEY } from 'features/CNC/constants/customConstant';

import { ErrorCode } from 'constants/errorCode';
import { EntitySearchType, SearchUserStatus } from 'constants/lumin-common';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import { InviteToOrganizationInput } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

const DEBOUNCE_TIME = 200;

const useHandleSearchUsers = () => {
  const [searchResults, setSearchResult] = useState<IUserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { billingInfo } = useContext(FreeTrialContext);
  const { organizationId } = billingInfo as { organizationId: string };
  const driveUsersCanInviteToWorkspace = JSON.parse(
    localStorage.getItem(CNC_LOCAL_STORAGE_KEY.DRIVE_COLLABORATORS_NOT_IN_CIRCLE) || '[]'
  ) as IUserResult[];
  const prioritizedUserCollaborators = getPrioritizedUsers(driveUsersCanInviteToWorkspace);
  const [selectedUsers, setSelectedUsers] = useState<InviteToOrganizationInput[]>(
    prioritizedUserCollaborators.map((user) => ({
      ...user,
      role: ORGANIZATION_ROLES.MEMBER,
    }))
  );
  const selectedUsersRef = useRef<InviteToOrganizationInput[]>(selectedUsers);
  const [allUsers, setAllUsers] = useState<IUserResult[]>(prioritizedUserCollaborators);

  const canAddEmail = (email: string, status: string) =>
    !allUsers.some((member) => member.email === email) && status === SearchUserStatus.USER_VALID;

  const onRemoveUser = (userEmail: string) => {
    setSelectedUsers((prevState) => prevState.filter((item) => item.email !== userEmail));
    setAllUsers((prevState) => prevState.filter((item) => item.email !== userEmail));
  };

  const onSelectUser = (member: IUserResult) => {
    if (canAddEmail(member.email, member.status)) {
      const newMember = {
        ...member,
        role: ORGANIZATION_ROLES.MEMBER,
      } as InviteToOrganizationInput;
      setSelectedUsers((prevState) => [newMember, ...prevState]);
      setAllUsers((prevState) => [member, ...prevState]);
    }
  };

  const onRemoveTag = (userEmail: string) => {
    setSelectedUsers((prevState) => prevState.filter((item) => item.email !== userEmail));
  };

  const filterAddedMemberList = (user: IUserResult) =>
    selectedUsersRef.current.every((selectedUser) => selectedUser.email !== user.email);

  const filterCollaboratorsList = (user: IUserResult) =>
    prioritizedUserCollaborators.every(
      (_prioritizedUserCollaborators) => _prioritizedUserCollaborators.email !== user.email
    );

  const injectDataToResults = (user: IUserResult) => ({
    ...user,
    disabled: user.status !== SearchUserStatus.USER_VALID,
  });

  const onSearch = async (searchText: string) => {
    if (!validator.validateEmail(searchText)) {
      setSearchResult([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await userServices.findUser({
        searchKey: searchText,
        targetId: organizationId,
        targetType: EntitySearchType.ORGANIZATION,
        excludeUserIds: selectedUsersRef.current.map((item) => item._id).filter(Boolean),
      });

      setSearchResult(data.filter(filterAddedMemberList).filter(filterCollaboratorsList).map(injectDataToResults));
    } catch (error) {
      const { code } = errorUtils.extractGqlError(error) as { code: string };

      if (code === ErrorCode.User.UNAVAILABLE_USER) {
        setSearchResult([
          { email: searchText, status: SearchUserStatus.USER_UNAVAILABLE, disabled: true } as IUserResult,
        ]);
      } else {
        toastUtils.openUnknownErrorToast().catch(() => {});
      }
    } finally {
      setIsSearching(false);
    }
  };

  const onChange = useCallback(debounce(onSearch, DEBOUNCE_TIME), []);

  useEffect(() => {
    selectedUsersRef.current = selectedUsers;
  }, [selectedUsers]);

  return {
    searchResults,
    selectedUsers,
    onChange,
    isSearching,
    onSelectUser,
    onRemoveUser,
    setSelectedUsers,
    allUsers,
    prioritizedUserCollaborators,
    onRemoveTag,
  };
};

export default useHandleSearchUsers;
