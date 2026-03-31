import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

const propTypes = {
  notification: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const AddMemberToTeam = ({ notification, currentUser }) => {
  const userId = notification.entity.id;
  const isCurrentUser = userId === currentUser._id;
  const { t } = useTranslation();

  return (
    <span>
      <Trans
        shouldUnescape
        i18nKey="notification.notificationOrgItem.addMemberToSpace"
        components={{
          entity: <span className={classNames({ bold: !isCurrentUser })} />,
          target: <span className="bold" />,
          actor: <span className="bold" />,
          b: <span className="bold" />,
        }}
        values={{
          actorName: notification.actor.name,
          entityName: isCurrentUser ? t('common.you').toLowerCase() : notification.entity.name,
          targetName: notification.target.targetName,
        }}
      />
    </span>
  );
};

AddMemberToTeam.propTypes = propTypes;

export default AddMemberToTeam;
