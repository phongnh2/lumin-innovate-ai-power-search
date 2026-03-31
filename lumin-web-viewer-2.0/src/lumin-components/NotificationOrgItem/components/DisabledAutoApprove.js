import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const DisabledAutoApprove = ({ notification }) => (
  <span>
    <Trans
      shouldUnescape
      i18nKey="notification.notificationOrgItem.disabledAutoApprove"
      values={{ entityName: notification.entity.name }}
      components={{ b: <span className="bold" /> }}
    />
  </span>
);

DisabledAutoApprove.propTypes = propTypes;

export default DisabledAutoApprove;
