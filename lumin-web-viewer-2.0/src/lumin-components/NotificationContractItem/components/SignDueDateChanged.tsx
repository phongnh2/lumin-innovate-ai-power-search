import get from 'lodash/get';
import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';

import { dateUtil } from 'utils';

import { INotificationBase } from 'interfaces/notification/notification.interface';

const SignDueDateChanged = ({ notification }: { notification: INotificationBase }) => {
  const formattedDueDate = useMemo(() => {
    const { entity } = notification;
    const dueTimeExpired = get(entity, 'entityData.dueTimeExpired', '') as string;

    return dueTimeExpired ? dateUtil.formatMDYTime(dueTimeExpired) : '';
  }, [notification]);

  return (
    <span>
      <Trans
        i18nKey="notification.notificationContractItem.signDueDateChanged"
        components={{ b: <span className="bold" /> }}
        values={{
          entityName: notification.entity.name,
          dueDate: formattedDueDate,
        }}
      />
    </span>
  );
};

export default SignDueDateChanged;
