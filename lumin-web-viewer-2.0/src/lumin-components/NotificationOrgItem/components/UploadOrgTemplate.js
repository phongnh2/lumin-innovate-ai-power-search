import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const UploadOrgTemplate = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.uploadOrgTemplate">
      <span className="bold">{{ actorName: notification.actor.name }}</span> uploaded
      <span className="bold">{{ entityName: notification.entity.name }}</span> to
      <span className="bold">{{ targetName: notification.target.targetName }}</span>
    </Trans>
  </span>
);

UploadOrgTemplate.propTypes = propTypes;

export default UploadOrgTemplate;
