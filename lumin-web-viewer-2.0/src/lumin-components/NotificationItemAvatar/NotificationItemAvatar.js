import classNames from 'classnames';
import { get } from 'lodash';
import { Avatar } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import LuminLogo from 'assets/reskin/images/lumin-logo.png';

import Icomoon from 'lumin-components/Icomoon';
import MaterialAvatar from 'luminComponents/MaterialAvatar';

import { useEnableWebReskin } from 'hooks';

import { avatar } from 'utils';

import { APP_USER_TYPE } from 'constants/lumin-common';
import { NotiOrg } from 'constants/notificationConstant';

function NotificationItemAvatar(props) {
  const { notification } = props;
  const { isEnableReskin } = useEnableWebReskin();

  const getActorDetail = () => {
    const { actor, entity } = notification;
    switch (notification.actionType) {
      case NotiOrg.DISABLED_AUTO_APPROVE:
      case NotiOrg.STOP_TRANSFER_ADMIN:
      case NotiOrg.CONVERT_TO_CUSTOM_ORGANIZATION:
      case NotiOrg.CONVERT_TO_MAIN_ORGANIZATION:
      case NotiOrg.REMOVE_ASSOCIATE_DOMAIN:
      case NotiOrg.FIRST_USER_MANUALLY_JOIN_ORG:
      case NotiOrg.FIRST_MEMBER_INVITE_COLLABORATOR:
        return {
          name: entity.name,
          avatarRemoteId: entity.entityData.avatarRemoteId,
        };
      default:
        return {
          name: actor.name,
          avatarRemoteId: actor.avatarRemoteId,
        };
    }
  };
  const actorDetail = getActorDetail();

  const actorDataType = get(actorDetail, 'actorData.type');
  let src = null;
  let content = null;
  if (actorDataType === APP_USER_TYPE.SALE_ADMIN) {
    content = <Icomoon className="logo" size={18} color="#fff" />;
  } else {
    src = avatar.getAvatar(actorDetail.avatarRemoteId);
    content = avatar.getTextAvatar(actorDetail.name);
  }

  if (isEnableReskin) {
    return (
      <Avatar
        size="sm"
        src={actorDataType === APP_USER_TYPE.SALE_ADMIN ? LuminLogo : avatar.getAvatar(actorDetail.avatarRemoteId)}
        alt="avatar"
        variant="outline"
        name={actorDetail.name}
      />
    );
  }

  return (
    <MaterialAvatar
      hasBorder
      containerClasses={classNames('ProfileButton__avatar', {
        NotificationItem__lumin: actorDataType === APP_USER_TYPE.SALE_ADMIN,
      })}
      size={32}
      src={src}
    >
      {content}
    </MaterialAvatar>
  );
}

NotificationItemAvatar.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default NotificationItemAvatar;
