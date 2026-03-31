import { debounce, uniqBy } from 'lodash';
import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useState, useCallback, useRef } from 'react';

import SearchInput from 'lumin-components/Shared/SearchInput';
import UserResults from 'lumin-components/Shared/UserResults';

import { useTranslation } from 'hooks';
import useGetOrganizationData from 'hooks/useGetOrganizationData';

import { userServices } from 'services';

import { errorUtils, toastUtils, validator } from 'utils';

import { ErrorCode } from 'constants/errorCode';
import { EntitySearchType, SearchUserStatus, DEBOUNCED_SEARCH_TIME } from 'constants/lumin-common';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import TopSection from './TopSection';
import { User, UserPayload } from '../../InvitesToAddDocStackModal.types';

import styles from './SearchSection.module.scss';

type SearchSectionProps = {
  isSubmitting: boolean;
  userList: User[];
  setUserList: React.Dispatch<React.SetStateAction<User[]>>;
  setSelectedUsers: React.Dispatch<React.SetStateAction<UserPayload[]>>;
};

const SearchSection = ({ isSubmitting, setSelectedUsers, setUserList, userList }: SearchSectionProps) => {
  const { t } = useTranslation();

  const [searchResults, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const usersRef = useRef(userList);

  const organization = useGetOrganizationData();

  const renderResult = useCallback((resultProps: any) => {
    const tooltip = {
      [SearchUserStatus.USER_ADDED]: t('memberPage.addMemberModal.userAdded'),
      [SearchUserStatus.USER_UNAVAILABLE]: t('memberPage.addMemberModal.userUnavailable'),
      [SearchUserStatus.USER_RESTRICTED]: t('memberPage.addMemberModal.userRestricted'),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    }[resultProps.data?.status];
    return (
      <PlainTooltip content={tooltip} maw="none" position="top" offset={-40}>
        <div>
          <UserResults {...resultProps} />
        </div>
      </PlainTooltip>
    );
  }, []);

  const handleAddedMember = (member: User) => {
    setUserList((prevState) => uniqBy([member, ...prevState], 'email'));
    setSelectedUsers((prevState) =>
      uniqBy(
        [
          {
            email: member.email,
            role: ORGANIZATION_ROLES.MEMBER,
          },
          ...prevState,
        ],
        'email'
      )
    );
  };

  const handleSearchUser = async (searchText: string) => {
    if (!validator.validateEmail(searchText)) {
      setSearchResult([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await userServices.findUser({
        targetId: organization._id,
        searchKey: searchText,
        targetType: EntitySearchType.ORGANIZATION,
        excludeUserIds: usersRef.current.map((item) => item._id).filter(Boolean),
      });
      setSearchResult(
        data
          .filter((user) => usersRef.current.every((mem) => mem.email !== user.email))
          .map((user) => ({
            ...user,
            disabled: user.status !== SearchUserStatus.USER_VALID,
          }))
      );
    } catch (error) {
      const { code: errorCode } = errorUtils.extractGqlError(error) as { code: string };
      if (errorCode === ErrorCode.User.UNAVAILABLE_USER) {
        setSearchResult([{ email: searchText, disabled: true, status: SearchUserStatus.USER_UNAVAILABLE }]);
      } else {
        toastUtils.openUnknownErrorToast().finally(() => {});
      }
    } finally {
      setIsSearching(false);
    }
  };

  const searchDebounced = useRef(debounce(handleSearchUser, DEBOUNCED_SEARCH_TIME)).current;

  return (
    <div className={styles.container}>
      <TopSection isSubmitting={isSubmitting} setUserList={setUserList} setSelectedUsers={setSelectedUsers} />
      <SearchInput
        isReskin
        loading={isSearching}
        disabled={isSubmitting}
        options={searchResults}
        resultComponent={renderResult}
        onSelect={handleAddedMember}
        onChange={searchDebounced}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        placeholder={t('modalShare.enterEmailAddres')}
      />
    </div>
  );
};

export default SearchSection;
