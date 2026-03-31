import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

const propTypes = {
  notification: PropTypes.object.isRequired,
};

const RequestToJoin = ({ notification }) => (
  <Trans
    i18nKey="notification.notificationOrgItem.requestToJoin"
    components={{ b: <span className="bold" /> }}
    values={{
      actorName: notification.actor.name,
      entityName: notification.entity.name,
    }}
  />
);

RequestToJoin.propTypes = propTypes;

export default RequestToJoin;
