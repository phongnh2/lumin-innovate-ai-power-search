import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type AssignedSignSeatsProps = {
  notification: INotificationBase;
};

const AssignedSignSeats = ({ notification }: AssignedSignSeatsProps) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.assignedSignSeats"
      components={{ b: <span className="bold" /> }}
      values={{ orgName: notification.entity.name }}
    />
  </span>
);

export default AssignedSignSeats;
