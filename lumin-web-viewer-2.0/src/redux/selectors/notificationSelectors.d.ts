import { RootState } from 'redux/store';

type NotificationStatus = {
  general: { unreadCount: number; hasNewNoti?: boolean };
  invites: { unreadCount: number; hasNewNoti?: boolean };
  requests: { unreadCount: number; hasNewNoti?: boolean };
};

export function getCurrentNotificationTab(state: RootState): string;

export function hasNewNotifications(state: RootState): boolean;

export function getUserNotificationStatus(state: RootState): NotificationStatus;
