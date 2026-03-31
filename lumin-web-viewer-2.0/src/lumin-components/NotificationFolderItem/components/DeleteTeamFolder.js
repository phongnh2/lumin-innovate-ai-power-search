import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const DeleteTeamFolder = ({ notification: { actor, entity, target } }) => (
  <span>
    <Trans
      shouldUnescape
      i18nKey="notification.notificationFolderItem.deleteTeamFolder"
      components={{ b: <span className="bold" /> }}
      values={{
        actorName: actor.name,
        entityName: entity.name,
        targetName: target.targetName,
      }}
    />
  </span>
);

DeleteTeamFolder.propTypes = propTypes;

export default DeleteTeamFolder;
