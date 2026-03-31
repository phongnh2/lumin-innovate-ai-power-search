import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

const SignagreementApproved = ({ notification }: { notification: INotificationBase }) => (
  <span>
    <Trans
      i18nKey="notification.notificationContractItem.signagreementApproved"
      components={{ b: <span className="bold" /> }}
      values={{
        entityName: notification.entity.name,
      }}
    />
  </span>
);

export default SignagreementApproved;
