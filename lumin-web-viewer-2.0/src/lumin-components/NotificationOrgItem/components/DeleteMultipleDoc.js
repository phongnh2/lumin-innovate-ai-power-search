import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const DeleteMultipleDoc = ({ notification }) => (
  <span>
    <Trans
      shouldUnescape
      i18nKey="notification.notificationOrgItem.deleteMultipleDoc"
      components={{ b: <span className="bold" /> }}
      values={{
        actorName: notification.actor.name,
        totalDocument: notification.entity.entityData?.totalDocument,
        targetName: `All ${notification.target.targetName}`,
      }}
    />
  </span>
);

DeleteMultipleDoc.propTypes = propTypes;

export default DeleteMultipleDoc;
