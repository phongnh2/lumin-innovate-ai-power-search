import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { LIMIT_NOTIFICATIONS_PER_QUERY } from 'Common/constants/NotificationConstants';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';
import { ServerErrorException } from 'Common/errors/ServerErrorException';

import { NotificationTab } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { GrpcNotificationTab } from 'Notication/interfaces/notification.interface';
import { UserService } from 'User/user.service';

import { NotificationService } from './notification.service';
import { NotificationUtils } from './utils/notification.utils';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly loggerService: LoggerService,
    private readonly userService: UserService,
  ) {}

  @GrpcMethod('NotificationService', 'GetNotifications')
  async getNotifications(data: { userId: string, tab?: GrpcNotificationTab; cursor?: string; forSignProduct?: boolean; limit?: number }) {
    const {
      userId,
      tab,
      cursor,
      forSignProduct,
      limit,
    } = data;
    try {
      const user = await this.userService.findUserById(userId, { _id: 1 });
      if (!user) {
        throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
      }

      const notifications = await this.notificationService.getNotificationUsers({
        userId: user._id,
        tab: tab ? NotificationTab[GrpcNotificationTab[tab]] : undefined,
        cursor,
        forSignProduct,
        limit,
      });
      const limitPerQuery = limit || LIMIT_NOTIFICATIONS_PER_QUERY;
      const returnNotifications = await Promise.all(
        notifications.slice(0, limitPerQuery).map((noti) => this.notificationService.genPublishNotificationData(noti)),
      );
      const filteredNotifications = returnNotifications.filter(Boolean);
      const lastNoti = filteredNotifications[filteredNotifications.length - 1];
      const hasNextPage = notifications.length === limitPerQuery + 1;
      const cursorResponse = hasNextPage ? String(new Date(lastNoti.createdAt as string).getTime()) : '';
      const formattedNotifications = filteredNotifications.map((noti) => NotificationUtils.transformNotificationForGrpc(noti));
      return {
        notifications: formattedNotifications,
        hasNextPage,
        cursor: cursorResponse,
      };
    } catch (error) {
      this.loggerService.error({
        context: this.getNotifications.name,
        error,
      });
      throw error;
    }
  }

  @GrpcMethod('NotificationService', 'ReadNotifications')
  async readNotifications(data: { userId: string, notificationIds: string[] }): Promise<void> {
    const { userId, notificationIds } = data;
    const user = await this.userService.findUserById(userId, { _id: 1 });
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }

    if (!notificationIds || notificationIds.length === 0) {
      throw GrpcErrorException.InvalidArgument('Notification IDs are required', ErrorCode.Common.INVALID_INPUT);
    }

    try {
      const updateIsReadNotif = { is_read: true };
      const condition = {
        notificationId: {
          $in: notificationIds,
        },
        userId: user._id,
      };
      const updatedNotification = await this.notificationService.updateNotificationsUser(condition, updateIsReadNotif);
      if (!updatedNotification) {
        throw GrpcErrorException.ApplicationError(
          ServerErrorException.Internal('Failed to read notifications', ErrorCode.Noti.READ_NOTIFICATION_FAIL),
        );
      }
    } catch (error) {
      this.loggerService.error({
        context: this.readNotifications.name,
        error,
      });
      throw error;
    }
  }

  @GrpcMethod('NotificationService', 'ReadAllNotifications')
  async readAllNotifications(data: { userId: string }): Promise<void> {
    const { userId } = data;
    const user = await this.userService.findUserById(userId, { _id: 1 });
    if (!user) {
      throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    }

    try {
      const updatedNotifications = await this.notificationService.updateNotificationsUser({ userId: user._id }, { is_read: true });
      if (!updatedNotifications) {
        throw GrpcErrorException.ApplicationError(
          ServerErrorException.Internal('Failed to read all notifications', ErrorCode.Noti.READ_ALL_NOTIFICATIONS_FAIL),
        );
      }
    } catch (error) {
      this.loggerService.error({
        context: this.readAllNotifications.name,
        error,
      });
      throw error;
    }
  }
}
