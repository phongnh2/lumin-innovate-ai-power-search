import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const StopTransferAdmin = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.stopTransferAdmin">
      Transferring ownership process stopped because
      <span className="bold">{{ targetName: notification.target.targetName }}</span>'s account was deleted
    </Trans>
  </span>
);

StopTransferAdmin.propTypes = propTypes;

export default StopTransferAdmin;
