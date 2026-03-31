import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const DeleteTeam = ({ notification }) => (
  <span>
    <Trans
      shouldUnescape
      i18nKey="notification.notificationOrgItem.deleteTeam"
      components={{ b: <span className="bold" /> }}
      values={{ entityName: notification.entity.name }}
    />
  </span>
);

DeleteTeam.propTypes = propTypes;

export default DeleteTeam;
