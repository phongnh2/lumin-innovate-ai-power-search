import ClickAwayListener from '@mui/material/ClickAwayListener';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import MaterialPopper from 'luminComponents/MaterialPopper';
import NotificationContent from 'luminComponents/NotificationContent';

import { useEnableWebReskin, useTabletMatch, useThemeMode } from 'hooks';

import * as Styled from './NotificationWrapper.styled';

function NotificationWrapper({
  notificationShow,
  notifications,
  fetchMoreData,
  error,
  loading,
  closePopper,
  anchorEl,
  closeNotification,
  hasNextPage,
}) {
  const isTabletUp = useTabletMatch();
  const theme = useThemeMode();
  const classes = Styled.useStyles();

  const { isEnableReskin } = useEnableWebReskin();
  if (isEnableReskin) {
    return null;
  }

  const renderNotiContent = () => (
    <NotificationContent
      error={error}
      loading={loading}
      notifications={notifications}
      fetchMore={fetchMoreData}
      closePopper={closePopper}
      hasNextPage={hasNextPage}
    />
  );

  if (isTabletUp && !notificationShow) {
    return null;
  }

  if (!isTabletUp) {
    return (
      <ClickAwayListener onClickAway={(e) => notificationShow && closeNotification(e)}>
        <Styled.MobilePanel
          className={`NotificationPanel ${
            notificationShow ? 'active' : ''
          }`}
        >
          {renderNotiContent()}
        </Styled.MobilePanel>
      </ClickAwayListener>
    );
  }

  return (
    <MaterialPopper
      open
      anchorEl={anchorEl.current}
      handleClose={closeNotification}
      parentOverflow="viewport"
      placement="bottom"
      classes={classNames('hide-in-mobile', classes.popper, `theme-${theme}`)}
      scrollbarClassName={classes.popperContent}
      disablePortal={false}
    >
      {renderNotiContent()}
    </MaterialPopper>
  );
}

NotificationWrapper.propTypes = {
  notificationShow: PropTypes.bool,
  notifications: PropTypes.array,
  fetchMoreData: PropTypes.func,
  error: PropTypes.any,
  loading: PropTypes.bool,
  hasNextPage: PropTypes.bool,
  closePopper: PropTypes.func,
  anchorEl: PropTypes.object,
  closeNotification: PropTypes.func,
};

NotificationWrapper.defaultProps = {
  notificationShow: false,
  notifications: [],
  fetchMoreData: () => {},
  error: null,
  loading: false,
  hasNextPage: false,
  closePopper: () => {},
  anchorEl: {},
  closeNotification: () => {},
};

export default NotificationWrapper;
