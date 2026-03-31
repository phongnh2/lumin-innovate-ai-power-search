import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const AcceptRequestAccess = ({ notification, currentUser }) => {
  const isCurrentUser = notification.target.targetId === currentUser._id;
  return isCurrentUser ? (
    <span>
      <Trans shouldUnescape i18nKey="notification.notificationOrgItem.acceptRequestAccessCurrentUser">
        You were accepted to join <span className="bold">{{ entityName: notification.entity.name }}</span>
      </Trans>
    </span>
  ) : (
    <span>
      <Trans shouldUnescape i18nKey="notification.notificationOrgItem.acceptRequestAccess">
        <span className="bold">{{ actorName: notification.actor.name }}</span> added
        <span className="bold">{{ targetName: notification.target.targetName }}</span> to
        <span className="bold">{{ entityName: notification.entity.name }}</span>
      </Trans>
    </span>
  );
};

AcceptRequestAccess.propTypes = propTypes;

export default AcceptRequestAccess;
