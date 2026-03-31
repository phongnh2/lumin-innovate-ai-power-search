import React from 'react';

import NotiRequestOrgItem from 'luminComponents/NotificationRequestItem/NotiRequestOrgItem';
import NotiRequestDocumentItem from 'luminComponents/NotiRequestDocumentItem';

import { NotiType } from 'constants/notificationConstant';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type Props = {
  notification: INotificationBase;
};

const NotiRequestItem = (props: Props): JSX.Element => {
  const { notification } = props;
  return notification.notificationType === NotiType.ORGANIZATION ? (
    <NotiRequestOrgItem notification={notification} />
  ) : (
    <NotiRequestDocumentItem notification={notification} />
  );
};

export default NotiRequestItem;
