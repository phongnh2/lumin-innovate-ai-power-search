import { Avatar, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import MaterialAvatar from 'lumin-components/MaterialAvatar';

import { useTranslation } from 'hooks';

import { avatar } from 'utils';

import { SearchUserStatus } from 'constants/lumin-common';

import UserInfoWrapper from './components/UserInfoWrapper';
import mapInvalidStatus from './helpers/mapInvalidStatus';

import {
  StyledText,
  StyledRow,
  StyledAvatar,
  StyledInfo,
  StyledEmail,
  StyledRightSectionText,
  StyledRowWrapper,
} from './SearchResultItem.styled';

import styles from './SearchResultItem.module.scss';

function UserInfo({ name, avatarRemoteId, email, onClick, selected, disabled, invalidStatus, unallowed, isReskin }) {
  const { t } = useTranslation();
  if (isReskin) {
    return (
      <div
        onClick={onClick}
        data-selected={selected}
        data-disabled={disabled}
        className={styles.userInfoWrapper}
        role="presentation"
      >
        <Avatar size="sm" src={avatar.getAvatar(avatarRemoteId)} name={name} variant="outline" />
        <div className={styles.infoWrapper}>
          <Text type="title" size="sm" ellipsis>
            {name}
          </Text>
          <Text
            type="body"
            size="sm"
            ellipsis
            color="var(--kiwi-colors-surface-on-surface-variant)"
            className={styles.email}
          >
            {email}
          </Text>
        </div>
        {invalidStatus && (
          <Text
            type="label"
            size="md"
            color={
              invalidStatus === SearchUserStatus.USER_ADDED
                ? 'var(--kiwi-colors-surface-on-surface)'
                : 'var(--kiwi-colors-semantic-error)'
            }
          >
            {t(`common.${mapInvalidStatus[invalidStatus].toLowerCase()}`)}
          </Text>
        )}
      </div>
    );
  }
  return (
    <UserInfoWrapper unallowed={unallowed} disabled={disabled}>
      <StyledRowWrapper onClick={onClick} selected={selected} disabled={disabled}>
        <StyledRow>
          <StyledAvatar>
            <MaterialAvatar size={32} src={avatar.getAvatar(avatarRemoteId)}>
              {avatar.getTextAvatar(name)}
            </MaterialAvatar>
          </StyledAvatar>
          <StyledInfo>
            <StyledText>{name}</StyledText>
            <StyledEmail>{email}</StyledEmail>
          </StyledInfo>
          {invalidStatus && (
            <StyledRightSectionText>
              {t(`common.${mapInvalidStatus[invalidStatus].toLowerCase()}`)}
            </StyledRightSectionText>
          )}
        </StyledRow>
      </StyledRowWrapper>
    </UserInfoWrapper>
  );
}

UserInfo.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string.isRequired,
  avatarRemoteId: PropTypes.string,
  onClick: PropTypes.func,
  invalidStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  unallowed: PropTypes.bool,
  isReskin: PropTypes.bool,
};

UserInfo.defaultProps = {
  name: '',
  avatarRemoteId: '',
  invalidStatus: '',
  selected: false,
  disabled: false,
  unallowed: false,
  onClick: () => {},
  isReskin: false,
};

export default UserInfo;
