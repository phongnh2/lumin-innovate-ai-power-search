import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const LuminAdminDeleteOrg = ({ notification }) => (
  <span>
    <Trans
      shouldUnescape
      i18nKey="notification.notificationOrgItem.luminAdminDeleteOrganization"
      components={{ b: <span className="bold" /> }}
      values={{
        entityName: notification.entity.name,
      }}
    />
  </span>
);

LuminAdminDeleteOrg.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default LuminAdminDeleteOrg;
