import classNames from 'classnames';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { APP_USER_TYPE } from 'constants/lumin-common';

const propTypes = {
  notification: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const AddMemberToOrg = ({ notification, currentUser }) => {
  const userType = get(notification, 'actor.actorData.type');
  const addedMemberIds = get(notification, 'target.targetData.addedMemberIds');
  const totalMember = get(notification, 'target.targetData.totalMember');
  const targetName = get(notification, 'target.targetName');
  const targetId = get(notification, 'target.targetId');
  const isCurrentUser = targetId === currentUser._id || addedMemberIds?.includes(currentUser._id);
  const { t } = useTranslation();
  const textTarget =
    totalMember > 1 ? t('notification.notificationOrgItem.textMembers', { totalMember }) : targetName;

  return (
    <span>
      <Trans shouldUnescape i18nKey="notification.notificationOrgItem.addMemberToOrg">
        <span className="bold">
          {{ actorName: userType === APP_USER_TYPE.SALE_ADMIN ? 'Lumin Admin' : notification.actor.name }}
        </span>
        invited
        <span
          className={classNames({
            bold: !isCurrentUser,
          })}
        >
          {{ targetName: isCurrentUser ? t('common.you').toLowerCase() : textTarget }}
        </span>
        to
        <span className="bold">{{ entityName: notification.entity.name }}</span>
      </Trans>
    </span>
  );
};

AddMemberToOrg.propTypes = propTypes;

export default AddMemberToOrg;
