import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const UploadOrgTeamTemplate = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.uploadOrgTeamTemplate">
      <span className="bold">{{ actorName: notification.actor.name }}</span> uploaded
      <span className="bold">{{ entityName: notification.entity.name }}</span> to
      <span className="bold">{{ targetName: notification.target.targetName }}</span> (in
      <span className="bold">{{ orgName: notification.target.targetData.orgName }}</span>)
    </Trans>
  </span>
);

UploadOrgTeamTemplate.propTypes = propTypes;

export default UploadOrgTeamTemplate;
