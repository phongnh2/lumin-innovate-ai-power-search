export const getCurrentNotificationTab = (state) => state.notification.tab;

export const hasNewNotifications = (state) => {
  const { notificationStatus } = state.auth.currentUser;
  const tabs = Object.values(notificationStatus);
  return tabs.some((item) => item.hasNewNoti);
};

export const getUserNotificationStatus = (state) => state.auth.currentUser.notificationStatus;
