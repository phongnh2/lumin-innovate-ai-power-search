import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import { NotiTeam } from 'constants/notificationConstant';

NotificationTeamItem.propTypes = {
  notification: PropTypes.object,
};

NotificationTeamItem.defaultProps = {
  notification: {},
};

function NotificationTeamItem(props) {
  const { notification } = props;
  switch (notification.actionType) {
    case NotiTeam.ADD_MEMBER: {
      const isRoleStartWithVowel = notification.entity.name === 'admin' || notification.entity.name === 'owner';
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.addMember">
            <span className="bold">{{ actorName: notification.actor.name }}</span> added you to
            <span className="bold">{{ targetName: notification.target.targetName }}</span> as
            {{ text: isRoleStartWithVowel ? 'an' : 'a' }}
            <span className="bold">{{ entityName: notification.entity.name }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiTeam.DELETE_DOCUMENT_TEAM: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.deleteDocumentTeam">
            <span className="bold">{{ actorName: notification.actor.name }}</span> removed
            <span className="bold">{{ entityName: notification.entity.name }}</span> from
            <span className="bold">{{ targetName: notification.target.targetName }}</span>
          </Trans>
        </span>
      );
    }

    case NotiTeam.ADD_MEMBER_LIST: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.addMemberList">
            <span className="bold">{{ actorName: notification.actor.name }}</span> added
            <span className="bold">{{ entityName: notification.entity.name }}</span> to
            <span className="bold">{{ targetName: notification.target.targetName }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiTeam.DELETE_MEMBER_LIST: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.addMemberList">
            <span className="bold">{{ actorName: notification.actor.name }}</span> removed
            <span className="bold">{{ entityName: notification.entity.name }}</span> from
            <span className="bold">{{ targetName: notification.target.targetName }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiTeam.DELETE_MEMBER: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.deleteMember">
            <span className="bold">{{ actorName: notification.actor.name }}</span> removed you from
            <span className="bold">{{ targetName: notification.target.targetName }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiTeam.TRANSFER_OWNER: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.transferOwner">
            <span className="bold">{{ actorName: notification.actor.name }}</span> transferred the ownership of
            <span className="bold">{{ targetName: notification.target.targetName }}</span> to you.
          </Trans>
        </span>
      );
    }

    case NotiTeam.TRANSFER_OWNER_LIST: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.transferOwnerList">
            <span className="bold">{{ actorName: notification.actor.name }}</span> transferred the ownership of{' '}
            <span className="bold">{{ targetName: notification.target.targetName }}</span> to{' '}
            <span className="bold">{{ entityName: notification.entity.name }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiTeam.CHANGE_ROLE: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.changeRole">
            <span className="bold">{{ actorName: notification.actor.name }}</span> changed your role to
            <span className="bold">{{ entityName: notification.entity.name }}</span> in
            <span className="bold">{{ targetName: notification.target.targetName }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiTeam.DELETE_TEAM: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.deleteTeam">
            <span className="bold">{{ actorName: notification.actor.name }}</span> deleted
            <span className="bold">{{ targetName: notification.target.targetName }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiTeam.LEAVE_TEAM: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.leaveTeam">
            <span className="bold">{{ actorName: notification.actor.name }}</span> left
            <span className="bold">{{ targetName: notification.target.targetName }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiTeam.MOVE_FILE: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.moveFile">
            <span className="bold">{{ actorName: notification.actor.name }}</span> uploaded
            <span className="bold">{{ entityName: notification.entity.name }}</span> to
            <span className="bold">{{ targetName: notification.target.targetName }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiTeam.DELETE_MULTI_DOCUMENT: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.deleteMultiDocument">
            <span className="bold">{{ actorName: notification.actor.name }}</span> removed
            <span className="bold">{{ totalDocument: notification.entity.entityData.totalDocument }} documents</span>
            from
            <span className="bold">{{ targetName: notification.target.targetName }}</span>.
          </Trans>
        </span>
      );
    }
    case NotiTeam.DELETE_TEAM_TEMPLATE: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationTeamItem.deleteTeamTemplate">
            <span className="bold">{{ actorName: notification.actor.name }}</span> deleted
            <span className="bold">{{ entityName: notification.entity.name }}</span> from
            <span className="bold">{{ targetName: notification.target.targetName }}</span>
          </Trans>
        </span>
      );
    }
    default:
      return null;
  }
}

export default NotificationTeamItem;
