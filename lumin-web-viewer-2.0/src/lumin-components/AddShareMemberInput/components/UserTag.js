import { Chip, Text, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { UserStatus } from 'constants/lumin-common';

import styles from './UserTag.module.scss';

const UserTag = (props) => {
  const { tag, pendingUserList, handleDelete, hasEmailIncluded, canDelete = true } = props;

  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <Chip
        key={tag.email}
        className={styles.userTag}
        label={
          <Text component="label" type="label" size="sm">
            {tag.email}
            {pendingUserList.some(hasEmailIncluded(tag.email)) && (
              <Text component="label" type="label" size="sm" color="var(--kiwi-colors-semantic-error)">
                &nbsp;({t('modalShare.pendingUser')})
              </Text>
            )}
          </Text>
        }
        colorType="blue"
        rightIcon={
          canDelete && (
            <span className={styles.closeChipIcon} role="presentation" onClick={() => handleDelete(tag)}>
              <KiwiIcomoon type="x-sm" />
            </span>
          )
        }
        enablePointerEvents
      />
    );
  }

  return (
    <div className="ACInput__chipContainer" key={tag.email}>
      <div className="ACInput__chip">
        <span>{tag.email}</span>
        {pendingUserList.some(hasEmailIncluded(tag.email)) && (
          <label className="ACInput__pending-user">{` (${UserStatus.PENDING})`}</label>
        )}
        {canDelete && (
          <span role="presentation" className="ACInput__delete-icon" onClick={() => handleDelete(tag)}>
            <Icomoon className="cancel" size="8" />
          </span>
        )}
      </div>
    </div>
  );
};

UserTag.propTypes = {
  tag: PropTypes.object.isRequired,
  pendingUserList: PropTypes.array,
  handleDelete: PropTypes.func.isRequired,
  hasEmailIncluded: PropTypes.func.isRequired,
  canDelete: PropTypes.bool,
};

UserTag.defaultProps = {
  pendingUserList: [],
  canDelete: true,
};

export default UserTag;
