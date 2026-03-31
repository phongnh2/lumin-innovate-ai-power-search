import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type FirstUserManuallyJoinOrgProps = {
  notification: INotificationBase;
};

const FirstUserManuallyJoinOrg = ({ notification }: FirstUserManuallyJoinOrgProps) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.firstUserManuallyJoinOrg"
      components={{ b: <span className="bold" /> }}
      values={{ orgName: notification.entity.name }}
    />
  </span>
);

export default FirstUserManuallyJoinOrg;
