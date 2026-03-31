import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { APP_USER_TYPE } from 'constants/lumin-common';

const propTypes = {
  notification: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const TransferAdmin = ({ notification, currentUser }) => {
  const { t } = useTranslation();
  const isCurrentUser = notification.target.targetId === currentUser._id;
  const actorType = get(notification, 'actor.actorData.type');
  return (
    <span>
      <Trans shouldUnescape i18nKey="notification.notificationOrgItem.transferAdmin">
        <span className="bold">
          {{ actorName: actorType === APP_USER_TYPE.SALE_ADMIN ? 'Lumin Admin' : notification.actor.name }}
        </span>
        transferred the ownership of <span className="bold">{{ entityName: notification.entity.name }} </span>
        to
        <span
          className={!isCurrentUser ? 'bold' : ''}
        >
          {{
            targetName: isCurrentUser ? t('common.you').toLowerCase() : notification.target.targetName,
          }}
        </span>
      </Trans>
    </span>
  );
};

TransferAdmin.propTypes = propTypes;

export default TransferAdmin;
