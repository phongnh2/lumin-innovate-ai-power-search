import classNames from 'classnames';
import { Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import styles from 'lumin-components/ShareListItem/ShareListItem.module.scss';

import { useEnableWebReskin, useTranslation } from 'hooks';

const RoleText = ({ isOwner, role }) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  if (isEnableReskin) {
    return (
      <Text type="label" size="md" className={classNames(styles.roleText, { [styles.docOwner]: isOwner })}>
        {isOwner ? t('sharePermission.docOwner') : role}
      </Text>
    );
  }
  return (
    <div className="SharingList__itemRole">
      <span
        className={classNames('SharingList__itemRoleLabel', {
          'SharingList__itemRoleLabel--owner': isOwner,
        })}
      >
        {isOwner ? t('sharePermission.docOwner') : role}
      </span>
    </div>
  );
};

RoleText.propTypes = {
  isOwner: PropTypes.bool,
  role: PropTypes.string,
};

RoleText.defaultProps = {
  isOwner: false,
  role: undefined,
};

export default RoleText;
