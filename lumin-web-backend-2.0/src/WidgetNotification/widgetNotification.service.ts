import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateResult } from 'mongodb';
import { Model, PipelineStage, FilterQuery } from 'mongoose';

import { UserService } from 'User/user.service';
import { IWidgetNotification, ICreateWidgetNotification, IGetWidgetUserByType } from 'WidgetNotification/interfaces/widgetNotification.interface';

@Injectable()
export class WidgetNotificationService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel('WidgetNotification') private readonly WidgetNotificationModel: Model<IWidgetNotification>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
  }

  aggregateNotificationUsers(pipelines: PipelineStage[]): Promise<any> {
    return this.WidgetNotificationModel.aggregate(pipelines).exec();
  }

  async getWidgetNotificationsUser(userId: string) : Promise<IWidgetNotification[]> {
    return this.WidgetNotificationModel.find({ userId }).sort({ updateAt: -1 }).exec();
  }

  async getWidgetNotificationUserByType({ userId, type }: IGetWidgetUserByType) : Promise<IWidgetNotification> {
    return this.WidgetNotificationModel.findOne({ userId, type }).exec();
  }

  createWidgetNotifications(notifications: ICreateWidgetNotification): Promise<IWidgetNotification> {
    const widgetNotification = new this.WidgetNotificationModel(notifications);
    return widgetNotification.save();
  }

  updateWidgetNotifications(
    conditions: FilterQuery<IWidgetNotification>,
    newProperty: FilterQuery<IWidgetNotification>,
  ): Promise<UpdateResult> {
    return this.WidgetNotificationModel.updateMany(conditions, {
      $set: {
        ...newProperty,
      },
    }, { new: true }).exec();
  }

  publishWidgetNotificationToUser(receiverId, publishData, publishType) {
    this.pubSub.publish(`${publishType}.${receiverId}`, {
      [publishType]: {
        userId: receiverId,
        ...publishData,
      },
    });
  }
}
