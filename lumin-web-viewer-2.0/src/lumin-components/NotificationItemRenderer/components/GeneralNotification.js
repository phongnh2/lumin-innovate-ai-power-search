import { debounce, find } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import NotificationItem from 'lumin-components/NotificationItem';

import useGetNotificationName from 'hooks/useGetNotificationName';

import { markReadNotifications, updateNotificationsCache } from 'services/graphServices/notification';

import logger from 'helpers/logger';

import { eventTracking } from 'utils';

import { AWS_EVENTS } from 'constants/awsEvents';
import { DEBOUNCED_CLICK_NOTIFICATION_TIME, LOGGER } from 'constants/lumin-common';
import {
  NotificationTabs,
  NotiTeam,
  NotiType,
  NotiContractName,
  ContractNotiTypeToName,
} from 'constants/notificationConstant';
import { SIGN_URL } from 'constants/urls';

import { useDocumentNotiClick, useOrganizationNotiClick } from '../hooks';

function GeneralNotification({ notification, closePopper }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { general } = useSelector(selectors.getUserNotificationStatus, shallowEqual);

  const handleDocumentNotiClick = useDocumentNotiClick({ notification });
  const { handleOrgNotification, handleFolderNotification } = useOrganizationNotiClick({ notification });
  const notificationName = useGetNotificationName(notification, NotificationTabs.GENERAL);

  const markNotificationsAsRead = async () => {
    try {
      if (notification.is_read) {
        return;
      }
      await markReadNotifications([notification._id]);

      updateNotificationsCache((draft) => {
        find(draft, { _id: notification._id }).is_read = true;
      }, NotificationTabs.GENERAL);

      dispatch(
        actions.updateCurrentUser({
          notificationStatus: {
            general: {
              unreadCount: general.unreadCount - 1,
              hasNewNoti: false,
            },
          },
        })
      );
    } catch (e) {
      logger.logInfo({
        message: 'markNotificationsAsRead',
        reason: LOGGER.Service.COMMON_ERROR,
      });
    }
  };

  const handleTeamNotification = () => {
    if (notification.actionType === NotiTeam.MOVE_FILE) {
      navigate(`/viewer/${notification.entity.id}`);
    } else {
      navigate('/team-deprecated');
    }
  };

  const handleCommentNotification = () => {
    window.open(`/viewer/${notification.entity.id}`);
  };

  const handleContractNotification = () => {
    const { actionType, entity } = notification;

    const notiContractName = ContractNotiTypeToName[actionType];

    if ([NotiContractName.signCommentAdded, NotiContractName.signCommentMentioned].includes(notiContractName)) {
      window.open(`${SIGN_URL}/document/${entity.entityData?.contractId}`);
    } else {
      window.open(`${SIGN_URL}/document/${entity.id}`);
    }
  };

  const debounceClickNotification = useCallback(
    debounce(() => {
      eventTracking(AWS_EVENTS.NOTIFICATION.ELEMENT_CLICK, { notificationName });
    }, DEBOUNCED_CLICK_NOTIFICATION_TIME),
    []
  );

  const handleClickNotification = async (e) => {
    e.stopPropagation();
    closePopper();
    const NOTIFICATION_EXECUTER_MAPPING = {
      [NotiType.DOCUMENT]: handleDocumentNotiClick,
      [NotiType.TEAM]: handleTeamNotification,
      [NotiType.COMMENT]: handleCommentNotification,
      [NotiType.ORGANIZATION]: handleOrgNotification,
      [NotiType.FOLDER]: handleFolderNotification,
      [NotiType.CONTRACT]: handleContractNotification,
    };
    debounceClickNotification();
    const executer = NOTIFICATION_EXECUTER_MAPPING[notification.notificationType] || (() => {});
    executer();
    markNotificationsAsRead();
  };

  return (
    <NotificationItem
      handleClickNotification={handleClickNotification}
      notification={notification}
      onMarkAsReadPress={markNotificationsAsRead}
    />
  );
}

GeneralNotification.propTypes = {
  notification: PropTypes.object.isRequired,
  closePopper: PropTypes.func.isRequired,
};

export default GeneralNotification;
