import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const DeleteOrgTemplate = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.deleteOrgTemplate">
      <span className="bold">{{ actorName: notification.actor.name }}</span> deleted
      <span className="bold">{{ entityName: notification.entity.name }}</span> from
      <span className="bold">{{ orgName: notification.target.targetData.orgName }}</span>
    </Trans>
  </span>
);

DeleteOrgTemplate.propTypes = propTypes;

export default DeleteOrgTemplate;
