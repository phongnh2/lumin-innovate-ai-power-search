import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const LeaveOrg = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.leaveOrg">
      <span className="bold">{{ actorName: notification.actor.name }}</span> left
      <span className="bold">{{ entityName: notification.entity.name }}</span>
    </Trans>
  </span>
);

LeaveOrg.propTypes = propTypes;

export default LeaveOrg;
