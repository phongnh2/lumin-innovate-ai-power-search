import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { NotiContract } from 'constants/notificationConstant';

import { INotificationBase } from 'interfaces/notification/notification.interface';

const SignRoleChanged = ({ notification }: { notification: INotificationBase }) => {
  const { t } = useTranslation();

  const action = useMemo(
    () =>
      ({
        [NotiContract.CHANGED_ROLE_SIGNER_TO_VIEWER]: t('notification.notificationContractItem.viewer'),
        [NotiContract.CHANGED_ROLE_VIEWER_TO_SINGER]: t('notification.notificationContractItem.signer'),
      }[notification.actionType]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notification.actionType]
  );

  return (
    <span>
      <Trans
        i18nKey="notification.notificationContractItem.signRoleChanged"
        components={{ b: <span className="bold" /> }}
        values={{
          action,
          entityName: notification.entity.name,
        }}
      />
    </span>
  );
};

export default SignRoleChanged;
