import { Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { SearchUserStatus } from 'constants/lumin-common';
import { ERROR_MESSAGE_NOT_BELONG_TO_ORG } from 'constants/messages';

import NoResults from './NoResults';
import UserInfo from './UserInfo';

import styles from './SearchResultItem.module.scss';

function TeamMember({ data = {}, onClick, selected }) {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const {
    name, avatarRemoteId, email, status,
  } = data;
  const isExternalUser = status === SearchUserStatus.USER_NOT_BELONG_TO_ORG;
  const invalidStatus = [SearchUserStatus.USER_ADDED, SearchUserStatus.USER_DELETING].find(
    (_status) => status === _status,
  );
  if (isExternalUser) {
    if (isEnableReskin) {
      return (
        <div className={styles.notBelongtoOrg}>
          <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)">
            {t(ERROR_MESSAGE_NOT_BELONG_TO_ORG.key, ERROR_MESSAGE_NOT_BELONG_TO_ORG.interpolation)}
          </Text>
        </div>
      );
    }
    return (
      <NoResults>{t(ERROR_MESSAGE_NOT_BELONG_TO_ORG.key, ERROR_MESSAGE_NOT_BELONG_TO_ORG.interpolation)}</NoResults>
    );
  }
  return (
    <UserInfo
      name={name}
      email={email}
      avatarRemoteId={avatarRemoteId}
      onClick={onClick}
      selected={selected}
      invalidStatus={invalidStatus}
      disabled={Boolean(invalidStatus)}
      isReskin={isEnableReskin}
    />
  );
}

TeamMember.propTypes = {
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
};

TeamMember.defaultProps = {
  onClick: () => {},
  selected: false,
};

export default TeamMember;
