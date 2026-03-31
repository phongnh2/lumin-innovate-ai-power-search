import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

const JoinOrgViaInviteLink = ({ notification }: { notification: INotificationBase }) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.joinOrgViaInviteLink"
      components={{ b: <span className="bold" /> }}
      values={{
        actorName: notification.actor.name,
        entityName: notification.entity.name,
      }}
    />
  </span>
);

export default JoinOrgViaInviteLink;
