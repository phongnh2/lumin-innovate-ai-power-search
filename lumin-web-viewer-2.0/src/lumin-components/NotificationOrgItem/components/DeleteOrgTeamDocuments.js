import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

const propTypes = {
  notification: PropTypes.object.isRequired,
  single: PropTypes.bool,
};

const defaultProps = {
  single: false,
};

const DeleteOrgTeamDocuments = ({ single, notification }) => {
  const { t } = useTranslation();
  const textEntityName = single
    ? notification.entity.name
    : t('notification.notificationOrgItem.textDocuments', { totalDoc: notification.entity.entityData?.totalDocument });

  return (
    <span>
      <Trans
        shouldUnescape
        i18nKey="notification.notificationOrgItem.deleteOrgTeamDocuments"
        components={{ b: <span className="bold" /> }}
        values={{
          actorName: notification.actor.name,
          textEntityName,
          targetName: notification.target.targetName,
        }}
      />
    </span>
  );
};

DeleteOrgTeamDocuments.propTypes = propTypes;
DeleteOrgTeamDocuments.defaultProps = defaultProps;
export default DeleteOrgTeamDocuments;
