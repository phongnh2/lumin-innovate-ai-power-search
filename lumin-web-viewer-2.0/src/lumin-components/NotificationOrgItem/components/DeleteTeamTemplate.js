import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const DeleteOrgTemplate = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.deleteTeamTemplate">
      <span className="bold">{{ actorName: notification.actor.name }}</span> removed
      <span className="bold">{{ entityname: notification.entity.name }}</span> from
      <span className="bold">{{ targetName: notification.target.targetName }}</span> (in
      <span className="bold">{{ orgName: notification.target.targetData.orgName }}</span>)
    </Trans>
  </span>
);

DeleteOrgTemplate.propTypes = propTypes;

export default DeleteOrgTemplate;
