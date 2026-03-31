import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type UnassignedSignSeatsProps = {
  notification: INotificationBase;
};

const UnassignedSignSeats = ({ notification }: UnassignedSignSeatsProps) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.unassignedSignSeats"
      components={{ b: <span className="bold" /> }}
      values={{ orgName: notification.entity.name }}
    />
  </span>
);

export default UnassignedSignSeats;
