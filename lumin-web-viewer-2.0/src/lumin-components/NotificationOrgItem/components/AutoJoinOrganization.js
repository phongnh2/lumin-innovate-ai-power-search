import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const AutoJoinOrganization = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.autoJoinOrganization">
      <span className="bold">{{ actorName: notification.actor.name }}</span> joined
      <span className="bold">{{ targetname: notification.target.targetName }}</span>
      automatically
    </Trans>
  </span>
);

AutoJoinOrganization.propTypes = propTypes;

export default AutoJoinOrganization;
