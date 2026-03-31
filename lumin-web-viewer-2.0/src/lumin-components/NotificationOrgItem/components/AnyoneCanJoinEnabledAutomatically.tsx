import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type Props = {
  notification: INotificationBase;
};

const AnyoneCanJoinEnabledAutomatically = ({ notification }: Props) => (
  <span>
    <Trans
      shouldUnescape
      i18nKey="notification.notificationOrgItem.anyoneCanJoinEnabledAutomatically"
      values={{ entityName: notification.entity.name }}
      components={{ b: <span className="bold" /> }}
    />
  </span>
);

export default AnyoneCanJoinEnabledAutomatically;
