import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { commonUtils } from 'utils';

import { INotificationBase } from 'interfaces/notification/notification.interface';

type Props = {
  notification: INotificationBase;
};

const NotiRequestDocumentItem = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { notification } = props;

  return (
    <Trans
      i18nKey="notification.notificationRequest.requestDoc"
      components={{ bold: <span className="bold" /> }}
      values={{
        actorName: notification.actor.name,
        role: commonUtils.formatTitleCaseByLocale(t(`permission.${notification.target.targetData.role.toLowerCase()}`)),
        entityName: notification.entity.name,
      }}
    />
  );
};

export default NotiRequestDocumentItem;
