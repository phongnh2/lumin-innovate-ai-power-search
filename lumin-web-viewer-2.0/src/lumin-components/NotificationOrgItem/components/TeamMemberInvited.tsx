import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

const TeamMemberInvited = ({ notification }: { notification: INotificationBase }) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.teamMemberInvited"
      components={{ b: <span className="bold" /> }}
      values={{
        actorName: notification.actor.name,
        entityName: notification.entity.name,
        targetName: notification.target.targetName,
      }}
    />
  </span>
);

export default TeamMemberInvited;
