import selectors from 'selectors';

export const updateNotification = (data) => (dispatch) => {
  dispatch({
    type: 'UPDATE_NOTIFICATION',
    payload: data,
  });
};

export const changeNotificationTab = (tab) => updateNotification({ tab });

export const increaseNewNotificationCounter = (tab) => (dispatch, getState) => {
  const store = getState();
  const notificationStatus = selectors.getUserNotificationStatus(store);
  const tabProperty = tab.toLowerCase();
  dispatch({
    type: 'UPDATE_NOTIFICATION_STATUS',
    payload: {
      notificationStatus: {
        [tabProperty]: {
          unreadCount: Math.max(notificationStatus[tabProperty].unreadCount + 1, 0),
          hasNewNoti: true,
        },
      },
    },
  });
};

export const decreaseNewNotificationCounter = (tab) => (dispatch, getState) => {
  const store = getState();
  const notificationStatus = selectors.getUserNotificationStatus(store);
  const tabProperty = tab.toLowerCase();
  dispatch({
    type: 'UPDATE_NOTIFICATION_STATUS',
    payload: {
      notificationStatus: {
        [tabProperty]: {
          unreadCount: Math.max(notificationStatus[tabProperty].unreadCount - 1, 0),
          hasNewNoti: false,
        },
      },
    },
  });
};
