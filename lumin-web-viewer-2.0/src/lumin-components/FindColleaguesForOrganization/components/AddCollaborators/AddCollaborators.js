import { produce } from 'immer';
import { debounce, filter, uniqBy } from 'lodash';
import { Text, Button, Checkbox, ScrollArea, Avatar } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

import DefaultUserAvatar from 'assets/reskin/lumin-svgs/default-user-avatar.svg';

import selectors from 'selectors';

import { ButtonSize } from 'lumin-components/ButtonMaterial';
import Loading from 'lumin-components/Loading';
import MaterialAvatar from 'lumin-components/MaterialAvatar';
import SearchInput from 'lumin-components/Shared/SearchInput';
import UserResults from 'lumin-components/Shared/UserResults';

import { useEnableWebReskin, useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { userServices } from 'services';

import { avatar, errorUtils, toastUtils, validator } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ErrorCode } from 'constants/errorCode';
import { EntitySearchType, SearchUserStatus, DEBOUNCED_SEARCH_TIME, UserStatus } from 'constants/lumin-common';
import { ORGANIZATION_ROLES, CONTACT_LIST_CONNECT } from 'constants/organizationConstants';

import { useFetchCollaborators } from './useFetchCollaborators';

import * as Styled from './AddCollaborators.styled';

import styles from './AddCollaborators.module.scss';

const AddCollaborators = ({ type, onSubmit, accessToken, isSubmitting, googleMail }) => {
  const { t } = useTranslation();
  const [userList, setUserList] = useState([]);
  const [searchResults, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const isConnect = type === CONTACT_LIST_CONNECT.CONNECT;
  const usersRef = useRef(userList);
  const { isPopularDomain } = useSelector(selectors.getCurrentUser, shallowEqual);

  const { isEnableReskin } = useEnableWebReskin();
  const { onKeyDown } = useKeyboardAccessibility();

  useEffect(() => {
    usersRef.current = userList;
  }, [userList]);

  const { isLoading } = useFetchCollaborators({
    type,
    accessToken,
    setUserList,
    setSelectedUsers,
    googleAuthorizationEmail: googleMail,
  });

  const onAddedMember = (member) => {
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

  const filterAddedMemberList = (user) => usersRef.current.every((mem) => mem.email !== user.email);

  const injectDataToResults = (user) => ({
    ...user,
    disabled: user.status !== SearchUserStatus.USER_VALID,
  });

  const searchUser = async (searchText) => {
    if (!validator.validateEmail(searchText)) {
      setSearchResult([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await userServices.findUser({
        searchKey: searchText,
        targetType: EntitySearchType.ORGANIZATION_CREATION,
        excludeUserIds: usersRef.current.map((item) => item._id).filter(Boolean),
      });
      setSearchResult(data.filter(filterAddedMemberList).map(injectDataToResults));
    } catch (error) {
      const { code: errorCode } = errorUtils.extractGqlError(error);
      if (errorCode === ErrorCode.User.UNAVAILABLE_USER) {
        setSearchResult([{ email: searchText, disabled: true, status: SearchUserStatus.USER_UNAVAILABLE }]);
      } else {
        toastUtils.openUnknownErrorToast();
      }
    } finally {
      setIsSearching(false);
    }
  };

  const searchDebounced = useRef(debounce(searchUser, DEBOUNCED_SEARCH_TIME)).current;

  const handleChangeCheckbox = (user) => {
    setSelectedUsers((prev) =>
      produce(prev, (draftState) => {
        const selectedUser = draftState.find((item) => user.email === item.email);
        if (selectedUser) {
          return filter(draftState, (item) => user.email !== item.email);
        }
        return [
          {
            email: user.email,
            role: ORGANIZATION_ROLES.MEMBER,
          },
          ...draftState,
        ];
      })
    );
  };

  const handleSelectAll = (e) => {
    const isSelected = e.target.checked;
    if (isSelected) {
      setSelectedUsers(userList.map(({ email, role }) => ({ email, role })));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSkip = () => {
    onSubmit({ members: [] });
  };

  const getDescription = () => {
    if (isConnect) {
      return t('setUpOrg.descriptionConnectGoogle');
    }

    const isEmptyCowoker = userList.length === 0;

    return isPopularDomain || isEmptyCowoker
      ? t('setUpOrg.descriptionPopularDomain')
      : t('setUpOrg.descriptionNotPopularDomain');
  };

  const renderResult = useCallback((resultProps) => <UserResults {...resultProps} />, []);

  const renderList = () => {
    if (isLoading) {
      return <Loading normal useReskinCircularProgress={isEnableReskin} containerStyle={{ marginTop: '24px' }} />;
    }

    const totalSelect = selectedUsers.length;
    const totalUsers = userList.length;
    const isIndeterminateState = totalSelect > 0 && totalSelect < totalUsers;

    if (!totalUsers) {
      return null;
    }

    if (isEnableReskin) {
      return (
        <ScrollArea
          classNames={{
            root: styles.root,
            viewport: styles.viewport,
            scrollbar: styles.scrollbar,
          }}
          scrollbars="y"
          offsetScrollbars="x"
        >
          <div className={styles.selected}>
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
              {totalSelect}/{totalUsers} {t('setUpOrg.textSelected')}
            </Text>
            <Checkbox
              size="md"
              borderColor="var(--kiwi-colors-surface-outline)"
              checked={totalSelect === totalUsers}
              indeterminate={isIndeterminateState}
              onChange={handleSelectAll}
            />
          </div>
          <div className={styles.listWrapper}>
            {userList.map((item) => {
              const isChecked = selectedUsers.some((_user) => _user.email === item.email);
              const pendingLabel =
                item.status === UserStatus.UNAVAILABLE ? t('common.unavailable') : t('modalShare.pendingUser');
              return (
                <div
                  role="button"
                  tabIndex={0}
                  className={styles.listItem}
                  key={item.email}
                  onClick={() => handleChangeCheckbox(item)}
                  onKeyDown={onKeyDown}
                >
                  <div className={styles.collaboratorWrapper}>
                    {item.name ? (
                      <Avatar
                        size="sm"
                        variant="outline"
                        src={avatar.getAvatar(item.avatarRemoteId)}
                        name={item.name}
                      />
                    ) : (
                      <Avatar size="sm" variant="outline" src={DefaultUserAvatar} />
                    )}
                    <div className={styles.collaboratorInfo}>
                      <Text
                        className={!item.name && styles.pendingUser}
                        size="sm"
                        type="title"
                        color="var(--kiwi-colors-surface-on-surface)"
                        ellipsis
                      >
                        {item.name || pendingLabel}
                      </Text>
                      <Text size="sm" type="body" color="var(--kiwi-colors-surface-on-surface-variant)" ellipsis>
                        {item.email}
                      </Text>
                    </div>
                  </div>
                  <Checkbox
                    size="md"
                    tabIndex={-1}
                    borderColor="var(--kiwi-colors-surface-outline)"
                    checked={isChecked}
                    onChange={() => handleChangeCheckbox(item)}
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      );
    }

    return (
      <>
        <Styled.SelectAllWrapper>
          <Styled.SelectAllText>
            {totalSelect}/{totalUsers} {t('setUpOrg.textSelected')}
          </Styled.SelectAllText>
          <Styled.Checkbox
            checked={totalSelect === totalUsers}
            indeterminate={isIndeterminateState}
            onChange={handleSelectAll}
          />
        </Styled.SelectAllWrapper>
        <Styled.List>
          {userList.map((item, index) => {
            const isChecked = selectedUsers.some((_user) => _user.email === item.email);
            const pendingLabel =
              item.status === UserStatus.UNAVAILABLE ? t('common.unavailable') : t('modalShare.pendingUser');
            const srcImage = item.isCustomAvatar ? item.avatarRemoteId : avatar.getAvatar(item.avatarRemoteId);

            return (
              <Styled.ItemWrapper key={index}>
                <Styled.ItemContent>
                  <MaterialAvatar size={32} src={srcImage}>
                    {avatar.getTextAvatar(item.name)}
                  </MaterialAvatar>
                  <Styled.ItemInfo>
                    <Styled.ItemName $isPending={!item.name}>{item.name || pendingLabel}</Styled.ItemName>
                    <Styled.ItemEmail>{item.email}</Styled.ItemEmail>
                  </Styled.ItemInfo>
                </Styled.ItemContent>
                <Styled.Checkbox checked={isChecked} onChange={() => handleChangeCheckbox(item)} />
              </Styled.ItemWrapper>
            );
          })}
        </Styled.List>
      </>
    );
  };

  if (isEnableReskin) {
    return (
      <>
        <div className={styles.listTopWrapper}>
          <Text className={styles.title} type="headline" size="xl" color="var(--kiwi-colors-surface-on-surface)">
            {t('setUpOrg.addCollaborators')}
          </Text>
          <div className={styles.description}>
            {isConnect && (
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                <Trans
                  i18nKey="setUpOrg.youSignedInWith"
                  components={{
                    b: <b className={styles.bold} />,
                  }}
                  values={{ email: googleMail }}
                />
              </Text>
            )}
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
              {getDescription()}
            </Text>
          </div>
          <div className={styles.searchSection}>
            <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)">
              {t('setUpOrg.searchToInviteOthersViaEmail')}
            </Text>
            <SearchInput
              isReskin
              loading={isSearching}
              disabled={isSubmitting}
              options={searchResults}
              resultComponent={renderResult}
              onSelect={onAddedMember}
              onChange={searchDebounced}
              placeholder={t('common.eg', { egText: 'alice.metz@enlight.co' })}
            />
          </div>
        </div>
        {renderList()}
        <div className={styles.actions}>
          <Button
            size="lg"
            variant="outlined"
            onClick={handleSkip}
            data-lumin-btn-name={ButtonName.ON_BOARDING_SKIP_INVITE_ORGANIZATION_MEMBERS}
          >
            {t('common.skip')}
          </Button>
          <Button
            size="lg"
            variant="filled"
            onClick={() => onSubmit({ members: selectedUsers })}
            disabled={!selectedUsers.length}
            loading={isSubmitting}
            data-lumin-btn-name={ButtonName.ON_BOARDING_ORGANIZATION_CONNECT_DONT_GOOGLE_ACCOUNT}
          >
            {t('memberPage.invite')}
          </Button>
        </div>
      </>
    );
  }

  return (
    <Styled.Container $totalUsers={userList.length}>
      <Styled.TopContent>
        <Styled.Title>{t('setUpOrg.addCollaborators')}</Styled.Title>
        <Styled.Content>
          {isConnect && (
            <Styled.Label>
              <Trans
                i18nKey="setUpOrg.youSignedInWith"
                components={{
                  b: (
                    <b
                      style={{
                        fontWeight: 700,
                      }}
                    />
                  ),
                }}
                values={{ email: googleMail }}
              />
            </Styled.Label>
          )}
          <Styled.Description>{getDescription()}</Styled.Description>
        </Styled.Content>
        <Styled.InputWrapper>
          <Styled.InputLabel>{t('setUpOrg.searchToInviteOthersViaEmail')}</Styled.InputLabel>
          <div>
            <SearchInput
              loading={isSearching}
              disabled={isSubmitting}
              options={searchResults}
              resultComponent={renderResult}
              onSelect={onAddedMember}
              onChange={searchDebounced}
              placeholder={t('common.eg', { egText: 'alice.metz@enlight.co' })}
            />
          </div>
        </Styled.InputWrapper>
      </Styled.TopContent>

      {renderList()}

      <Styled.ButtonWrapper>
        <Styled.Button
          onClick={() => onSubmit({ members: selectedUsers })}
          disabled={!selectedUsers.length}
          size={ButtonSize.XL}
          data-lumin-btn-name={ButtonName.ON_BOARDING_ORGANIZATION_CONNECT_DONT_GOOGLE_ACCOUNT}
          loading={isSubmitting}
        >
          {t('setUpOrg.invitePeople', { text: selectedUsers.length || '' })}
        </Styled.Button>
        <Styled.Link onClick={handleSkip} data-lumin-btn-name={ButtonName.ON_BOARDING_SKIP_INVITE_ORGANIZATION_MEMBERS}>
          {t('common.skip')}
        </Styled.Link>
      </Styled.ButtonWrapper>
    </Styled.Container>
  );
};

AddCollaborators.propTypes = {
  type: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  googleMail: PropTypes.string.isRequired,
};

AddCollaborators.defaultProps = {};

export default AddCollaborators;
