import { get } from 'lodash';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import {
  NotiOrg,
  NotiOrgNameAddition,
  NotiOwnerTypeNameMapping,
  NotiType,
  NotiTypeNameMapping,
  NotificationTabs,
} from 'constants/notificationConstant';

import { INotificationBase } from 'interfaces/notification/notification.interface';
import { IUser } from 'interfaces/user/user.interface';

const useGetNotificationName = (notification: INotificationBase, NotificationTab: string): string => {
  const { notificationType, actionType } = notification;
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const addedMemberIds = get(notification, 'target.targetData.addedMemberIds') as string[];
  const isCurrentUser =
    notification.target?.targetId === currentUser._id ||
    currentUser._id === notification?.entity?.id ||
    addedMemberIds?.includes(currentUser._id);
  const totalMember = get(notification, 'target.targetData.totalMember', 0);

  if (
    totalMember > 1 &&
    notificationType === NotiType.ORGANIZATION &&
    actionType === NotiOrg.INVITE_JOIN &&
    NotificationTab === NotificationTabs.GENERAL
  ) {
    return NotiOrgNameAddition[actionType];
  }

  const notiTypeName = isCurrentUser ? NotiOwnerTypeNameMapping : NotiTypeNameMapping;
  return notiTypeName[notificationType][actionType];
};

export default useGetNotificationName;
