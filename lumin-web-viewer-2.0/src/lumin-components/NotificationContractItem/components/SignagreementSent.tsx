import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { NotiContract } from 'constants/notificationConstant';

import { INotificationBase } from 'interfaces/notification/notification.interface';

const SignagreementSent = ({ notification }: { notification: INotificationBase }) => {
  const { t } = useTranslation();

  const action = useMemo(
    () =>
      ({
        [NotiContract.ASSIGNED_SIGNER]: t('notification.notificationContractItem.sign'),
        [NotiContract.ASSIGNED_VIEWER]: t('notification.notificationContractItem.view'),
      }[notification.actionType]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notification.actionType]
  );

  return (
    <span>
      <Trans
        i18nKey="notification.notificationContractItem.signagreementSent"
        components={{ b: <span className="bold" /> }}
        values={{
          action,
          entityName: notification.entity.name,
        }}
      />
    </span>
  );
};

export default SignagreementSent;
