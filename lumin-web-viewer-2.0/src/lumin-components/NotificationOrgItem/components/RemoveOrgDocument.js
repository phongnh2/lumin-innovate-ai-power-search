import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const RemoveOrgDocument = ({ notification }) => (
  <span>
    <Trans
      shouldUnescape
      i18nKey="notification.notificationOrgItem.removeOrgDocument"
      components={{ b: <span className="bold" /> }}
      values={{
        actorName: notification.actor.name,
        entityName: notification.entity.name,
        targetName: `All ${notification.target.targetName}`,
      }}
    />
  </span>
);

RemoveOrgDocument.propTypes = propTypes;

export default RemoveOrgDocument;
