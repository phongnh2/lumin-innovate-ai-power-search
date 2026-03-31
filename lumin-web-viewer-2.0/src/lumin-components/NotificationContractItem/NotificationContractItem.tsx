import React from 'react';

import { ContractNotiTypeToName, NotiContractName } from 'constants/notificationConstant';

import { INotificationBase } from 'interfaces/notification/notification.interface';

import {
  SignagreementSigned,
  SignagreementSent,
  SignagreementRejected,
  SignNoResponse,
  SignagreementDeleted,
  SignagreementApproved,
  SignRemindSent,
  SignCommentMentioned,
  SignCommentAdded,
  SignDueDateChanged,
  SignRoleChanged,
} from './components';

const NotificationContractItem = ({ notification }: { notification: INotificationBase }) => {
  const notiContractName = ContractNotiTypeToName[notification.actionType as keyof typeof ContractNotiTypeToName];

  const maps = {
    [NotiContractName.signagreementSigned]: <SignagreementSigned notification={notification} />,
    [NotiContractName.signagreementRejected]: <SignagreementRejected notification={notification} />,
    [NotiContractName.signNoResponse]: <SignNoResponse notification={notification} />,
    [NotiContractName.signagreementSent]: <SignagreementSent notification={notification} />,
    [NotiContractName.signagreementDeleted]: <SignagreementDeleted notification={notification} />,
    [NotiContractName.signagreementApproved]: <SignagreementApproved notification={notification} />,
    [NotiContractName.signRemindSent]: <SignRemindSent notification={notification} />,
    [NotiContractName.signCommentMentioned]: <SignCommentMentioned notification={notification} />,
    [NotiContractName.signCommentAdded]: <SignCommentAdded notification={notification} />,
    [NotiContractName.signDueDateChanged]: <SignDueDateChanged notification={notification} />,
    [NotiContractName.signRoleChanged]: <SignRoleChanged notification={notification} />,
  };
  /**
   * must return null to fallback incorrect notification type
   */
  return maps[notiContractName] || null;
};

export default NotificationContractItem;
