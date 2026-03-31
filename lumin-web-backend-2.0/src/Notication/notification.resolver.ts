import { UseGuards, HttpStatus, Inject } from '@nestjs/common';
import {
  Resolver, Subscription, Query, Args, Context, Mutation,
} from '@nestjs/graphql';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { LIMIT_NOTIFICATIONS_PER_QUERY } from 'Common/constants/NotificationConstants';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { NEW_NOTIFICATION, DELETE_NOTIFICATION } from 'Common/constants/SubscriptionConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import {
  BasicResponse, NotificationPayload,
  GetNotificationsInput, NotificationTab, Notification,
} from 'graphql.schema';
import { IPublishNotification } from 'Notication/interfaces/notification.interface';
import { NotificationService } from 'Notication/notification.service';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { UserService } from 'User/user.service';

@Resolver('Notification')
export class NotificationResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {
  }

  @Subscription(NEW_NOTIFICATION)
  newNotification(@Args('input') input) {
    return this.pubSub.asyncIterator(`${NEW_NOTIFICATION}.${input.userId}`);
  }

  @Subscription(DELETE_NOTIFICATION)
  deleteNotification(@Args('input') input) {
    return this.pubSub.asyncIterator(`${DELETE_NOTIFICATION}.${input.userId}`);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation('readNotifications')
  async readNotifications(@Context() context, @Args('input') input): Promise<BasicResponse> {
    const { user } = context.req;
    const { notificationIds } = input;
    const updateIsReadNotif = {
      is_read: true,
    };
    const condition = {
      notificationId: {
        $in: notificationIds,
      },
      userId: user._id,
    };
    const updatedNotification = await this.notificationService.updateNotificationsUser(condition, updateIsReadNotif);
    if (!updatedNotification) {
      throw GraphErrorException.BadRequest('Failed to read notifications', ErrorCode.Noti.READ_NOTIFICATION_FAIL);
    }
    return {
      message: 'Notification is read',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Mutation('readAllNotifications')
  async readAllNotifications(@Context() context): Promise<BasicResponse> {
    const { user } = context.req;
    const condition = {
      userId: user._id,
      tab: NotificationTab.GENERAL,
    };
    const updatedNotifications = await this.notificationService.updateNotificationsUser(condition, { is_read: true });
    if (!updatedNotifications) {
      throw GraphErrorException.BadRequest('Failed to read all notifications', ErrorCode.Noti.READ_ALL_NOTIFICATIONS_FAIL);
    }
    return {
      message: 'All notifications are read',
      statusCode: HttpStatus.OK,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlAuthGuard)
  @Query('notifications')
  async notifications(
    @Context() context,
    @Args('cursor') oldCursor: string,
    @Args('input') input: GetNotificationsInput,
  ): Promise<NotificationPayload> {
    if (typeof oldCursor === 'string') {
      return null;
    }
    const { user } = context.req;
    const { cursor, tab } = input;
    const notifications: IPublishNotification[] = await this.notificationService.getNotificationUsers({ userId: user._id, tab, cursor });
    const returnNotifications = await Promise.all(
      notifications.slice(0, LIMIT_NOTIFICATIONS_PER_QUERY).map((noti) => this.notificationService.genPublishNotificationData(noti)),
    );
    const filteredNotifications = returnNotifications.filter(Boolean);
    const lastNoti = filteredNotifications[filteredNotifications.length - 1];
    const hasNextPage = notifications.length === LIMIT_NOTIFICATIONS_PER_QUERY as number + 1;
    return {
      notifications: filteredNotifications,
      hasNextPage,
      cursor: hasNextPage ? lastNoti?.createdAt : '',
    };
  }

  @UseGuards(GqlAuthGuard, RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query('getNotificationById')
  async getNotificationById(
    @Args('notificationId') notificationId: string,
    @Context() context,
  ): Promise<Notification> {
    const { _id: userId } = context.req.user;
    const [userNotification] = await this.notificationService.getNotificationUsersByCondition({ notificationId, userId });
    if (!userNotification) {
      throw GraphErrorException.NotFound('Notification not found', ErrorCode.Noti.NOTIFICATION_NOT_FOUND);
    }
    const notification = await this.notificationService.getNotificationById(notificationId);
    const returnNotiData = await this.notificationService.genPublishNotificationData(notification as IPublishNotification);
    return { ...returnNotiData, tab: userNotification.tab as NotificationTab };
  }
}
