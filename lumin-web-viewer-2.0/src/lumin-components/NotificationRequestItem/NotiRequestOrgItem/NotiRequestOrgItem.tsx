import React from 'react';
import { Trans } from 'react-i18next';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type Props = {
  notification: INotificationBase;
};

const NotiRequestOrgItem = (props: Props): JSX.Element => {
  const { notification } = props;

  return (
    <Trans
      i18nKey="notification.notificationOrgItem.requestToJoin"
      components={{ b: <span className="bold" /> }}
      values={{
        actorName: notification.actor.name,
        entityName: notification.entity.name,
      }}
    />
  );
};

export default NotiRequestOrgItem;
