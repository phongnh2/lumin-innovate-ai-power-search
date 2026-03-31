/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-use-before-define */
/* eslint-disable sonarjs/no-small-switch */
import { withApollo } from '@apollo/client/react/hoc';
import produce from 'immer';
import { Divider, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';

import EditLogo from 'assets/reskin/lumin-svgs/edit-logo.svg';
import SignLogo from 'assets/reskin/lumin-svgs/sign-logo.svg';

import NotificationDocumentItem from 'lumin-components/NotificationDocumentItem';
import NotificationItemAvatar from 'lumin-components/NotificationItemAvatar';
import NotificationActionButton from 'luminComponents/NotificationActionButton';
import NotificationCommentItem from 'luminComponents/NotificationCommentItem';
import NotificationContractItem from 'luminComponents/NotificationContractItem';
import NotificationFolderItem from 'luminComponents/NotificationFolderItem';
import { useTrackingNotificationsEvent } from 'luminComponents/NotificationItemRenderer/hooks/useTrackingNotificationsEvent';
import NotificationOrgItem from 'luminComponents/NotificationOrgItem';
import NotificationTeamItem from 'luminComponents/NotificationTeamItem';

import { useEnableWebReskin, useTranslation } from 'hooks';
import useGetNotificationName from 'hooks/useGetNotificationName';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { dateUtil, string } from 'utils';

import { NotiType, NotificationTabs } from 'constants/notificationConstant';

import './NotificationItem.scss';

import { formatTime } from './utils';

import styles from './NotificationItem.module.scss';

const propTypes = {
  notification: PropTypes.object,
  handleClickNotification: PropTypes.func.isRequired,
  onMarkAsReadPress: PropTypes.func,
};

const defaultProps = {
  notification: {},
  onMarkAsReadPress: () => {},
};

function NotificationItem(props) {
  const { notification, handleClickNotification, onMarkAsReadPress } = props;
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const notificationName = useGetNotificationName(notification, NotificationTabs.GENERAL);
  const elementRef = useRef(null);
  const { onKeyDown } = useKeyboardAccessibility();

  useTrackingNotificationsEvent({ elementRef, notificationName });

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    onMarkAsReadPress(notification);
  };

  const renderContent = (_notification) => {
    const noticationNameShorten = produce(_notification, (draftState) => {
      draftState.actor.name = string.getShortenStringNotification(_notification.actor.name);
      if (_notification.entity) {
        draftState.entity.name = string.getShortenStringNotification(_notification.entity.name);
      }
      if (_notification.target) {
        draftState.target.targetName = string.getShortenStringNotification(_notification.target.targetName);
      }
    });

    switch (_notification.notificationType) {
      case NotiType.DOCUMENT: {
        return <NotificationDocumentItem notification={noticationNameShorten} />;
      }
      case NotiType.COMMENT: {
        return <NotificationCommentItem notification={noticationNameShorten} />;
      }
      case NotiType.TEAM: {
        return <NotificationTeamItem notification={noticationNameShorten} />;
      }
      case NotiType.ORGANIZATION: {
        return <NotificationOrgItem notification={noticationNameShorten} />;
      }
      case NotiType.FOLDER: {
        return <NotificationFolderItem notification={noticationNameShorten} />;
      }
      case NotiType.CONTRACT: {
        return <NotificationContractItem notification={noticationNameShorten} />;
      }
      default: {
        return null;
      }
    }
  };
  const renderProduct = () => {
    switch (notification.notificationType) {
      case NotiType.DOCUMENT:
      case NotiType.COMMENT:
      case NotiType.TEAM:
      case NotiType.FOLDER: {
        return (
          <>
            <div className={styles.productWrapper}>
              <img src={EditLogo} alt="edit" className={styles.product} />
              <p>Lumin Edit</p>
            </div>
            <Divider orientation="vertical" className={styles.divider} />
          </>
        );
      }
      case NotiType.ORGANIZATION:
        return null;
      case NotiType.CONTRACT:
      default: {
        return (
          <>
            <div className={styles.productWrapper}>
              <img src={SignLogo} alt="sign" className={styles.product} />
              <p>Lumin Sign</p>
            </div>
            <Divider orientation="vertical" className={styles.divider} />
          </>
        );
      }
    }
  };

  if (isEnableReskin) {
    return (
      <div
        className={styles.container}
        onClick={handleClickNotification}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        data-type={notification.actionType}
        ref={elementRef}
        data-cy="notification_general_item"
      >
        <div className={styles.avatarWrapper}>
          <NotificationItemAvatar notification={notification} />
        </div>
        <div className={styles.contentWrapper}>
          <div className={styles.content}>{renderContent(notification)}</div>
          <div className={styles.timeAndProduct}>
            {renderProduct()}
            <div className={styles.time}>
              <span>{formatTime(notification)}</span>
            </div>
          </div>
        </div>
        {!notification.is_read && (
          <PlainTooltip content={t('common.markAsRead')}>
            <div
              role="button"
              data-cy="notification_unread_indicator"
              tabIndex={0}
              onKeyDown={onKeyDown}
              className={styles.unreadIndicator}
              onClick={handleMarkAsRead}
            />
          </PlainTooltip>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClickNotification}
      className={`NotificationItem ${notification.is_read ? '' : 'NotificationItem--unseen'}`}
      role="button"
      tabIndex={0}
      data-type={notification.actionType}
      ref={elementRef}
    >
      <div className="NotificationItem__header">
        <div className="NotificationItem__time">
          <span>{dateUtil.formatFullDate(new Date(notification.createdAt))}</span>
        </div>
        <div className="NotificationItem__actions">
          {!notification.is_read && (
            <NotificationActionButton
              icon="double-check"
              title={t('common.markAsRead')}
              onClick={() => onMarkAsReadPress(notification)}
            />
          )}
        </div>
      </div>
      <div className="NotificationItem__wrapper">
        <div className="NotificationItem__left">
          <NotificationItemAvatar notification={notification} />
        </div>
        <div className="NotificationItem__right">
          <div className="NotificationItem__right__content">{renderContent(notification)}</div>
        </div>
      </div>
    </div>
  );
}

NotificationItem.propTypes = propTypes;
NotificationItem.defaultProps = defaultProps;

export default withApollo(NotificationItem);
