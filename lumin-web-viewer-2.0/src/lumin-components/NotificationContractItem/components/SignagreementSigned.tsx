import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

const SignagreementSigned = ({ notification }: { notification: INotificationBase }) => (
  <span>
    <Trans
      i18nKey="notification.notificationContractItem.signagreementSigned"
      components={{ b: <span className="bold" /> }}
      values={{
        actorName: notification.actor.name,
        entityName: notification.entity.name,
      }}
    />
  </span>
);

export default SignagreementSigned;
