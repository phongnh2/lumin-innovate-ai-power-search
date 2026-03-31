import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const CreateTeamFolder = ({ notification: { actor, entity, target } }) => (
  <span>
    <Trans
      shouldUnescape
      i18nKey="notification.notificationFolderItem.createTeamFolder"
      components={{ b: <span className="bold" /> }}
      values={{
        actorName: actor.name,
        entityName: entity.name,
        targetName: target.targetName,
      }}
    />
  </span>
);

CreateTeamFolder.propTypes = propTypes;

export default CreateTeamFolder;
