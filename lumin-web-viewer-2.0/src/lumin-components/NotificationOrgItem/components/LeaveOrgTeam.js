import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const LeaveOrgTeam = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.leaveOrgTeam">
      <span className="bold">{{ actorName: notification.actor.name }}</span> left
      <span className="bold">{{ entityName: notification.entity.name }}</span>
    </Trans>
  </span>
);

LeaveOrgTeam.propTypes = propTypes;

export default LeaveOrgTeam;
