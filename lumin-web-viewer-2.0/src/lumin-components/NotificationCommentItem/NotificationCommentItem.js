import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { NotiComment } from 'src/constants/notificationConstant';

NotificationCommentItem.propTypes = {
  notification: PropTypes.object,
  currentUser: PropTypes.object,
};

NotificationCommentItem.defaultProps = {
  notification: {},
  currentUser: {},
};

function NotificationCommentItem(props) {
  const { notification, currentUser } = props;
  switch (notification.actionType) {
    case NotiComment.CREATE: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationCommentItem.create">
            <span className={notification.actor.name === 'Someone' ? '' : 'bold'}>
              {{ actorName: notification.actor.name }}
            </span>
            commented in
            <span className="bold">{{ entityName: notification.entity.name }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiComment.MENTION: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationCommentItem.mention">
            <span className="bold">{{ actorName: notification.actor.name }}</span> mentioned you in a comment on
            <span className="bold">{{ entityName: notification.entity.name }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiComment.DELETE: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationCommentItem.delete">
            <span className="bold">{{ actorName: notification.actor.name }}</span> deleted your comment in
            <span className="bold">{{ entityName: notification.entity.name }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiComment.REPLY: {
      if (notification.target?.targetId !== currentUser._id) {
        return (
          <span>
            <Trans shouldUnescape i18nKey="notification.notificationCommentItem.notReplyCurrentUser">
              <span className="bold">{{ actorName: notification.actor.name }}</span> also commented in&&nbsp;
              <span className="bold">{{ entityName: notification.entity.name }}</span>.
            </Trans>
          </span>
        );
      }
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationCommentItem.reply">
            <span className="bold">{{ actorName: notification.actor.name }}</span> replied to your comment in&&nbsp;
            <span className="bold">{{ entityName: notification.entity.name }}</span>.
          </Trans>
        </span>
      );
    }

    default:
      return null;
  }
}

export default NotificationCommentItem;
