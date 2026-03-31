import PropTypes from 'prop-types';
import React from 'react';

import { useDocumentNotiClick } from 'lumin-components/NotificationItemRenderer/hooks';
import NotificationRequestItem from 'lumin-components/NotificationRequestItem';

import { NotiType } from 'constants/notificationConstant';

function RequestNotification({ notification, closePopper }) {
  const handleDocumentNotiClick = useDocumentNotiClick({ notification });

  const handleClickNotification = (e) => {
    e.stopPropagation();
    if (notification.notificationType !== NotiType.ORGANIZATION) {
      closePopper();
      handleDocumentNotiClick();
    }
  };

  return <NotificationRequestItem handleClickNotification={handleClickNotification} notification={notification} />;
}

RequestNotification.propTypes = {
  notification: PropTypes.object.isRequired,
  closePopper: PropTypes.func.isRequired,
};

export default RequestNotification;
