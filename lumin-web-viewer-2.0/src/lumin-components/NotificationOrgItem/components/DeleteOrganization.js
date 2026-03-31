import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const DeleteOrganization = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.deleteOrganization">
      <span className="bold">{{ entityName: notification.entity.name }}</span> was deleted
    </Trans>
  </span>
);

DeleteOrganization.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default DeleteOrganization;
