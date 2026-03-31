import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type Props = {
  notification: INotificationBase;
};

const MembersOfFreeCircleUpgradeSubscription = ({ notification }: Props) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.membersOfFreeCircleUpgradeSubscription"
      components={{ b: <span className="bold" /> }}
      values={{ actorName: notification.actor.name, orgName: notification.entity.name }}
    />
  </span>
);

export default MembersOfFreeCircleUpgradeSubscription;
