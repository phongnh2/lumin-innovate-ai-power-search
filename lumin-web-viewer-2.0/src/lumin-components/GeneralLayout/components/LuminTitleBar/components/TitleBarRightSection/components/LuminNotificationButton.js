import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import * as Styled from '../TitleBarRightSection.styled';

LuminNotificationButton.propTypes = {
  hasNewNotifications: PropTypes.bool,
  notificationShow: PropTypes.bool,
  toggleNotification: PropTypes.func.isRequired,
};

LuminNotificationButton.defaultProps = {
  notificationShow: false,
  hasNewNotifications: false,
};

function LuminNotificationButton({ hasNewNotifications, toggleNotification, notificationShow, ...props }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const isOffline = useSelector(selectors.isOffline);
  const onClick = () => {
    setOpen(false);
    toggleNotification();
  };

  return (
    <IconButton
      onClick={onClick}
      disabled={isOffline}
      icon="viewer-notification"
      size="large"
      iconSize={24}
      active={notificationShow}
      tooltipData={{ placement: 'bottom', title: t('common.notifications'), open }}
      {...props}
    >
      {hasNewNotifications && <Styled.NotificationDot />}
    </IconButton>
  );
}

export default LuminNotificationButton;
