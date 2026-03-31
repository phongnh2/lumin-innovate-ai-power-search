import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type RejectedSignSeatsRequestProps = {
  notification: INotificationBase;
};

const RejectedSignSeatsRequest = ({ notification }: RejectedSignSeatsRequestProps) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.rejectedSignSeatsRequest"
      components={{ b: <span className="bold" /> }}
      values={{ actorName: notification.actor.name, orgName: notification.entity.name }}
    />
  </span>
);

export default RejectedSignSeatsRequest;
