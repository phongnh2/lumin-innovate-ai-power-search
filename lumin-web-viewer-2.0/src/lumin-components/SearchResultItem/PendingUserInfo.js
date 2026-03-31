import { Avatar, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import DefaultUserAvatar from 'assets/reskin/lumin-svgs/default-user-avatar.svg';

import MaterialAvatar from 'lumin-components/MaterialAvatar';

import { useTranslation } from 'hooks';

import { SearchUserStatus } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import mapInvalidStatus from './helpers/mapInvalidStatus';

import {
  StyledRow,
  StyledAvatar,
  StyledInfo,
  StyledEmail,
  StyledRowWrapper,
  StyledRightSectionText,
  StyledText,
} from './SearchResultItem.styled';

import styles from './SearchResultItem.module.scss';

function PendingUserInfo({ email, onClick, selected, invalidStatus, disabled, children, isReskin }) {
  const { t } = useTranslation();
  const isUnavailableUser = invalidStatus === SearchUserStatus.USER_UNAVAILABLE;

  if (isReskin) {
    return (
      <div
        onClick={onClick}
        data-selected={selected}
        data-disabled={disabled}
        className={styles.userInfoWrapper}
        role="presentation"
      >
        <Avatar size="sm" src={DefaultUserAvatar} name={email} variant="outline" />
        <div className={styles.infoWrapper}>
          <Text type="title" size="sm" ellipsis color="var(--kiwi-colors-semantic-error)">
            {isUnavailableUser ? t('modalShare.unavailableUser') : t('modalShare.pendingUser')}
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
        {invalidStatus && !isUnavailableUser && (
          <Text type="label" size="md" color="var(--kiwi-colors-semantic-error)">
            {t(`common.${mapInvalidStatus[invalidStatus].toLowerCase()}`)}
          </Text>
        )}
      </div>
    );
  }

  return (
    <StyledRowWrapper onClick={onClick} selected={selected} disabled={disabled}>
      <StyledRow>
        <StyledAvatar>
          <MaterialAvatar
            size={32}
            secondary
          />
        </StyledAvatar>
        <StyledInfo>
          {children || (
            <>
              <StyledText color={Colors.SECONDARY_50}>
                {isUnavailableUser ? t('modalShare.unavailableUser') : t('modalShare.pendingUser')}
              </StyledText>
              <StyledEmail>{email}</StyledEmail>
            </>
          )}
        </StyledInfo>
        {invalidStatus && !isUnavailableUser && (
          <StyledRightSectionText>
            {t(`common.${mapInvalidStatus[invalidStatus].toLowerCase()}`)}
          </StyledRightSectionText>
        )}
      </StyledRow>
    </StyledRowWrapper>
  );
}

PendingUserInfo.propTypes = {
  email: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  invalidStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  disabled: PropTypes.bool,
  children: PropTypes.node,
  isReskin: PropTypes.bool,
};

PendingUserInfo.defaultProps = {
  selected: false,
  onClick: () => {},
  invalidStatus: '',
  disabled: false,
  children: undefined,
  isReskin: false,
};

export default PendingUserInfo;
