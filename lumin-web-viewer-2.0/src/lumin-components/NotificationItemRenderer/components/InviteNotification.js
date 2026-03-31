import PropTypes from 'prop-types';
import React from 'react';

import NotificationInviteItem from 'lumin-components/NotificationInviteItem';

function InviteNotification({
  notification
}) {
  return (
    <NotificationInviteItem
      notification={notification}
    />
  );
}

InviteNotification.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default InviteNotification;
