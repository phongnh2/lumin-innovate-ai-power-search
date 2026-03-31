import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

const SignagreementDeleted = ({ notification }: { notification: INotificationBase }) => (
  <span>
    <Trans
      i18nKey="notification.notificationContractItem.signagreementDeleted"
      components={{ b: <span className="bold" /> }}
      values={{
        entityName: notification.entity.name,
      }}
    />
  </span>
);

export default SignagreementDeleted;
