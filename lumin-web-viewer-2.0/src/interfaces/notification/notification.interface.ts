import { NotificationTabs } from 'constants/notificationConstant';

type UserType = {
  id: string;
  name: string;
  type: string;
  avatarRemoteId: string;
  actorData: object;
  actorId: string;
  entityId: string;
  entityData: Record<string, unknown>;
};

type TargetType = {
  targetId: string;
  type: string;
  targetName: string;
  targetData: {
    role: string;
  };
};

export interface INotificationBase {
  _id: string;
  actor: UserType;
  is_read: boolean;
  entity: UserType;
  target: TargetType;
  notificationType: string;
  actionType: number;
  createdAt: Date;
  tab: typeof NotificationTabs;
  todayLabel?: boolean;
  earlierLabel?: boolean;
}
