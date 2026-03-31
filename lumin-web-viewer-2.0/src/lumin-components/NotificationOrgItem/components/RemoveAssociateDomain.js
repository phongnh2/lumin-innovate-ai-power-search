import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const RemoveAssociateDomain = ({ notification }) => (
  <span>
    <Trans shouldUnescape i18nKey="notification.notificationOrgItem.removeAssociateDomain">
      <span className="bold"> Lumin admin </span> dissasociated
      <span className="bold">{{ domain: notification.entity.entityData.removedDomain }}</span>
      domain from <span className="bold">{{ orgName: notification.entity.name }}</span>
    </Trans>
  </span>
);

RemoveAssociateDomain.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default RemoveAssociateDomain;
