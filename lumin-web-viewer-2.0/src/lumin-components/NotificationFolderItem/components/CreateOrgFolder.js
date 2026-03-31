import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const CreateOrgFolder = ({ notification: { actor, entity, target } }) => {
  const orgName = target.targetName;
  return (
    <span>
      <Trans
        shouldUnescape
        i18nKey="notification.notificationFolderItem.createOrgFolder"
        components={{ b: <span className="bold" /> }}
        values={{
          actorName: actor.name,
          entityName: entity.name,
          targetName: `All ${orgName}`,
        }}
      />
    </span>
  );
};

CreateOrgFolder.propTypes = propTypes;

export default CreateOrgFolder;
