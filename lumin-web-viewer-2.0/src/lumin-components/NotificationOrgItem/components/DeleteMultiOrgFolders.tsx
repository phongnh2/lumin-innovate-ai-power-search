import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

const DeleteMultiOrgFolder = ({ notification }: { notification: INotificationBase }) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.deleteMultiFolder"
      components={{ b: <span className="bold" /> }}
      values={{
        actorName: notification.actor.name,
        totalFolder: notification.entity.entityData.totalFolder,
        targetName: notification.target.targetName,
      }}
    />
  </span>
);

export default DeleteMultiOrgFolder;
