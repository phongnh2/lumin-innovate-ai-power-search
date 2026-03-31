import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

const propTypes = {
  notification: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const RemoveTeamMember = ({ notification, currentUser }) => {
  const userId = notification.target.targetId;
  const isCurrentUser = userId === currentUser._id;
  const { t } = useTranslation();

  return (
    <span>
      <Trans shouldUnescape i18nKey="notification.notificationOrgItem.removeTeamMember">
        <span className="bold">{{ actorName: notification.actor.name }}</span> removed
        <span
          className={classNames({
            bold: !isCurrentUser,
          })}
        >
          {{
            targetName: isCurrentUser ? t('common.you').toLowerCase() : notification.target.targetName,
          }}
        </span>
        from
        <span className="bold">{{ entityName: notification.entity.name }}</span>
      </Trans>
    </span>
  );
};

RemoveTeamMember.propTypes = propTypes;
export default RemoveTeamMember;
