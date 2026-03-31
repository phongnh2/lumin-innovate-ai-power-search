import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { ORGANIZATION_ROLE_TEXT } from 'constants/organizationConstants';

const propTypes = {
  notification: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const UpdateUserRole = ({ notification, currentUser }) => {
  const { t } = useTranslation();
  const isCurrentUser = notification.target.targetId === currentUser._id;
  const targetRole = notification.target.targetData.role;
  const targetRoleText = t(ORGANIZATION_ROLE_TEXT[targetRole.toUpperCase()]);

  return (
    <span>
      <Trans shouldUnescape i18nKey="notification.notificationOrgItem.updateUserRole">
        <span className="bold">{{ actorName: notification.actor.name }}</span> changed
        <span
          className={classNames({
            bold: !isCurrentUser,
          })}
        >
          {{
            targetName: isCurrentUser
              ? t('notification.notificationOrgItem.your')
              : `${notification.target.targetName}'s`,
          }}
        </span>
        role to
        <span className="bold">{{ targetRole: targetRoleText }}</span> in
        <span className="bold">{{ entityName: notification.entity.name }}</span>
      </Trans>
    </span>
  );
};

UpdateUserRole.propTypes = propTypes;

export default UpdateUserRole;
