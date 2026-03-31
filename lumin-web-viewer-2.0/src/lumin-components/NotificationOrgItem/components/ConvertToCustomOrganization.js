import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const ConvertToMainOrganization = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.convertToCustomOrganization">
      <span className="bold">{{ entityName: notification.entity.name }}</span> was converted to custom.
    </Trans>
  </span>
);

ConvertToMainOrganization.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default ConvertToMainOrganization;
