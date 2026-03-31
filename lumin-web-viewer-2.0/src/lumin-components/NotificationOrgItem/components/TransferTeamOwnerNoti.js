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

function TransferTeamOwnerNoti({ notification, currentUser }) {
  const { actor, entity, target } = notification;
  const isCurrentUser = currentUser._id === entity.id;
  const actorType = get(actor, 'actorData.type');
  const { t } = useTranslation();

  return (
    <span>
      <Trans
        shouldUnescape
        i18nKey="notification.notificationOrgItem.transferTeamOwner"
        components={{
          b: <span className="bold" />,
          boldIndicator: <span className={isCurrentUser ? '' : 'bold'} />,
        }}
        values={{
          actorName: actorType === APP_USER_TYPE.SALE_ADMIN ? 'Lumin Admin' : actor.name,
          targetName: target.targetName,
          entityName: isCurrentUser ? t('common.you').toLowerCase() : notification.entity.name,
        }}
      />
    </span>
  );
}

TransferTeamOwnerNoti.propTypes = propTypes;

export default TransferTeamOwnerNoti;
