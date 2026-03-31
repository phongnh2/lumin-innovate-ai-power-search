// Mock selectors
const mockGetUserNotificationStatus = jest.fn();

jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getUserNotificationStatus: (state: any) => mockGetUserNotificationStatus(state),
  },
}));

import * as notificationActions from '../notificationActions';

describe('notificationActions', () => {
  let dispatch: jest.Mock;
  let getState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn();
    getState = jest.fn();
  });

  describe('updateNotification', () => {
    it('should dispatch UPDATE_NOTIFICATION', () => {
      const data = { unread: 5 };
      notificationActions.updateNotification(data)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_NOTIFICATION',
        payload: data,
      });
    });
  });

  describe('changeNotificationTab', () => {
    it('should return updateNotification thunk', () => {
      const result = notificationActions.changeNotificationTab('messages');
      expect(typeof result).toBe('function');
    });

    it('should dispatch UPDATE_NOTIFICATION with tab', () => {
      const thunk = notificationActions.changeNotificationTab('messages');
      thunk(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_NOTIFICATION',
        payload: { tab: 'messages' },
      });
    });
  });

  describe('increaseNewNotificationCounter', () => {
    it('should dispatch UPDATE_NOTIFICATION_STATUS with increased count', () => {
      mockGetUserNotificationStatus.mockReturnValue({
        messages: { unreadCount: 5, hasNewNoti: false },
      });

      notificationActions.increaseNewNotificationCounter('MESSAGES')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_NOTIFICATION_STATUS',
        payload: {
          notificationStatus: {
            messages: {
              unreadCount: 6,
              hasNewNoti: true,
            },
          },
        },
      });
    });

    it('should handle zero unread count', () => {
      mockGetUserNotificationStatus.mockReturnValue({
        alerts: { unreadCount: 0, hasNewNoti: false },
      });

      notificationActions.increaseNewNotificationCounter('ALERTS')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_NOTIFICATION_STATUS',
        payload: {
          notificationStatus: {
            alerts: {
              unreadCount: 1,
              hasNewNoti: true,
            },
          },
        },
      });
    });
  });

  describe('decreaseNewNotificationCounter', () => {
    it('should dispatch UPDATE_NOTIFICATION_STATUS with decreased count', () => {
      mockGetUserNotificationStatus.mockReturnValue({
        messages: { unreadCount: 5, hasNewNoti: true },
      });

      notificationActions.decreaseNewNotificationCounter('MESSAGES')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_NOTIFICATION_STATUS',
        payload: {
          notificationStatus: {
            messages: {
              unreadCount: 4,
              hasNewNoti: false,
            },
          },
        },
      });
    });

    it('should not go below zero', () => {
      mockGetUserNotificationStatus.mockReturnValue({
        messages: { unreadCount: 0, hasNewNoti: false },
      });

      notificationActions.decreaseNewNotificationCounter('MESSAGES')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_NOTIFICATION_STATUS',
        payload: {
          notificationStatus: {
            messages: {
              unreadCount: 0,
              hasNewNoti: false,
            },
          },
        },
      });
    });
  });
});

