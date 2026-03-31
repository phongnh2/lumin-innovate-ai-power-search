import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type MembersOfFreeCircleStartFreeTrialProps = {
  notification: INotificationBase;
};

const MembersOfFreeCircleStartFreeTrial = ({ notification }: MembersOfFreeCircleStartFreeTrialProps) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.membersOfFreeCircleStartFreeTrial"
      components={{ b: <span className="bold" /> }}
      values={{ actorName: notification.actor.name, orgName: notification.entity.name }}
    />
  </span>
);

export default MembersOfFreeCircleStartFreeTrial;
