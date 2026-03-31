import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type FirstMemberInviteCollaboratorProps = {
  notification: INotificationBase,
};
const FirstMemberInviteCollaborator = ({ notification }: FirstMemberInviteCollaboratorProps) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.firstMemberInviteCollaborator"
      components={{ b: <span className="bold" /> }}
      values={{ orgName: notification.entity.name }}
    />
  </span>
);

export default FirstMemberInviteCollaborator;
