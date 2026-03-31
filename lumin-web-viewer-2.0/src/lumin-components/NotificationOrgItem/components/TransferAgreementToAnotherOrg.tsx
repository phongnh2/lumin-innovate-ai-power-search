import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

const TransferAgreementToAnotherOrg = ({ notification }: { notification: INotificationBase }) => (
  <span>
    <Trans
      i18nKey="notification.notificationOrgItem.transferAgreementToAnotherOrg"
      components={{ b: <span className="bold" /> }}
      values={{
        entityName: notification.entity.name,
        targetName: notification.target.targetName,
      }}
    />
  </span>
);

export default TransferAgreementToAnotherOrg;
