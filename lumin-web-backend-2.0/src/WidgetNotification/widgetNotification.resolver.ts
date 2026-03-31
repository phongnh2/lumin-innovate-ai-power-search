import { UseGuards, HttpStatus } from '@nestjs/common';
import {
  Resolver, Query, Args, Context, Mutation,
} from '@nestjs/graphql';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { ServeWidgetsOncePerUser } from 'Common/constants/WidgetNotificationConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import {
  BasicResponse, BasicResponseData, WidgetIdsInput, WidgetType,
  DismissWidgetNotificationsInput, WidgetNotificationPayload,
} from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { IWidgetNotification, ICreateWidgetNotification } from 'WidgetNotification/interfaces/widgetNotification.interface';
import { WidgetNotificationService } from 'WidgetNotification/widgetNotification.service';

@UseGuards(GqlAuthGuard)
@Resolver('WidgetNotification')
export class WidgetNotificationResolver {
  constructor(
    private readonly widgetNotificationService: WidgetNotificationService,
  ) {
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('dismissAllWidgetNotifications')
  async dismissAllWidgetNotifications(@Context() context): Promise<BasicResponse> {
    const { user } = context.req;

    try {
      await this.widgetNotificationService.updateWidgetNotifications({
        userId: user._id,
      }, {
        isPreviewed: true, isRead: true, updateAt: Date.now(), isNewWidget: false,
      });
      return {
        message: 'All widget notifications are read',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw GraphErrorException.BadRequest('Failed to read all widget notifications', ErrorCode.WidgetNoti.READ_ALL_WIDGET_NOTIFICATIONS_FAIL);
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('dismissWidgetNotification')
  async dismissWidgetNotification(@Context() context, @Args('input') input: DismissWidgetNotificationsInput): Promise<BasicResponse> {
    const { notificationId } = input;

    const dismissCondition = {
      _id: notificationId,
    };
    try {
      await this.widgetNotificationService.updateWidgetNotifications(dismissCondition, {
        isPreviewed: true, isRead: true, updateAt: Date.now(), isNewWidget: false,
      });
      return {
        message: 'Widget notification is dismissed',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw GraphErrorException.BadRequest('Failed to read notifications', ErrorCode.WidgetNoti.READ_WIDGET_NOTIFICATION_FAIL);
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('previewWidgetNotification')
  async previewWidgetNotification(@Context() context, @Args('input') input: WidgetIdsInput): Promise<BasicResponse> {
    const { widgetIds } = input;
    const { user } = context.req;
    const condition = {
      _id: {
        $in: widgetIds,
      },
      userId: user._id,
    };
    try {
      await this.widgetNotificationService.updateWidgetNotifications(condition, { isPreviewed: true });
      return {
        message: 'Widget notification is previewed',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw GraphErrorException.BadRequest('Failed to preview notifications', ErrorCode.WidgetNoti.PREVIEW_WIDGET_NOTIFICATIONS_FAIL);
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('previewAllWidgetNotifications')
  async previewAllWidgetNotifications(@Context() context): Promise<BasicResponse> {
    const { user } = context.req;

    const updateCondition = {
      userId: user._id,
    };
    try {
      await this.widgetNotificationService.updateWidgetNotifications(updateCondition, {
        isPreviewed: true,
        isNewWidget: false,
      });

      return {
        message: 'All notifications are previewed',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw GraphErrorException.BadRequest('Failed to read all notifications', ErrorCode.WidgetNoti.PREVIEW_ALL_WIDGET_NOTIFICATIONS_FAIL);
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('createWidgetNotification')
  async createWidgetNotification(@Context() context, @Args('widgetType') widgetType: WidgetType): Promise<BasicResponseData> {
    const { user } = context.req;

    const isExistedSameWidgetType = await this.widgetNotificationService.getWidgetNotificationUserByType({ userId: user._id, type: widgetType });

    if (!isExistedSameWidgetType?._id) {
      const notification: ICreateWidgetNotification = {
        type: widgetType,
        isPreviewed: false,
        isRead: false,
        isNewWidget: true,
        userId: user._id,
      };
      const newWidget = await this.widgetNotificationService.createWidgetNotifications(notification);
      if (!newWidget._id) {
        throw GraphErrorException.BadRequest(
          `Failed to create new ${widgetType} widget notifications`,
          ErrorCode.WidgetNoti.CREATE_WIDGET_NOTIFICATIONS_FAIL,
        );
      }
      return {
        message: `${widgetType} Widget is created`,
        statusCode: HttpStatus.OK,
        data: newWidget,
      };
    }

    if (isExistedSameWidgetType?.isRead && !ServeWidgetsOncePerUser.includes(widgetType)) {
      const updateCreatedDate = Date.now().toString();
      const updateProps = {
        isPreviewed: false, isRead: false, updateAt: updateCreatedDate, isNewWidget: true,
      };

      await this.widgetNotificationService.updateWidgetNotifications({
        userId: user._id,
        type: widgetType,
      }, updateProps);
      return {
        message: `${widgetType} Widget is created`,
        statusCode: HttpStatus.OK,
        data: { widgetType },
      };
    }
    throw GraphErrorException.BadRequest(`${widgetType} has already existed`, ErrorCode.WidgetNoti.CREATE_WIDGET_NOTIFICATIONS_FAIL);
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query('widgetNotifications')
  async widgetNotifications(@Context() context): Promise<WidgetNotificationPayload> {
    const { user } = context.req;
    const widgetNotificationsUser: IWidgetNotification[] = await this.widgetNotificationService.getWidgetNotificationsUser(user._id as string);

    return {
      widgetList: widgetNotificationsUser,
    };
  }
}
