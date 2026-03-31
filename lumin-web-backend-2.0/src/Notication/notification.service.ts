/* eslint-disable import/no-unresolved */
/* eslint-disable new-cap */
import { defaultNackErrorHandler, MessageHandlerErrorBehavior, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import * as moment from 'moment';
import {
  Types, Model, PipelineStage, FilterQuery, ClientSession, ProjectionType,
} from 'mongoose';

import 'moment-timezone';
import {
  NotificationEntityType, NotificationTargetType, NotificationType,
  NotiOrgTeam, LIMIT_NOTIFICATIONS_PER_QUERY, MAX_UNREAD_COUNT_QUERY,
  ORGANIZATION_ACTION_TYPES_FOR_SIGN_PRODUCT,
  NotiOrg,
} from 'Common/constants/NotificationConstants';
import { OrganizationAction } from 'Common/constants/NotificationIntegrationConstant';
import { NEW_NOTIFICATION } from 'Common/constants/SubscriptionConstants';
import { NotificationContext } from 'Common/factory/IntegrationNotiFactory/notification.interface';
import { notiOrgFactory } from 'Common/factory/NotiFactory';
import { notiFirebaseTeamFactory } from 'Common/factory/NotiFirebaseFactory';

import { APP_USER_TYPE } from 'Auth/auth.enum';
import {
  TransactionExecutor,
} from 'Database/transactionExecutor';
import { DocumentService } from 'Document/document.service';
import { FolderService } from 'Folder/folder.service';
import { NewNotificationTabData, NotificationTab } from 'graphql.schema';
import { integrationNotificationHandler } from 'Integration/handler';
import { IntegrationService } from 'Integration/Integration.service';
import { LoggerService } from 'Logger/Logger.service';
import { PublishNewNotification } from 'LuminContract/interface/luminContract.interface';
import { LuminContractService } from 'LuminContract/luminContract.service';
import {
  IFirebaseNotification,
  IFirebaseNotificationData,
  INotification,
  INotificationModel,
  INotificationUser,
  INotificationUserModel,
  IPublishNotification,
  NotificationProduct,
  SyncSignNotificationMessage,
} from 'Notication/interfaces/notification.interface';
import { OrganizationService } from 'Organization/organization.service';
import { QUEUES } from 'RabbitMQ/RabbitMQ.constant';
import { TeamService } from 'Team/team.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel('Notification') private readonly notificationModel: Model<INotificationModel>,
    @InjectModel('NotificationUser') private readonly notificationUserModel: Model<INotificationUserModel>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => FolderService))
    private readonly folderService: FolderService,
    @Inject(forwardRef(() => LoggerService))
    private readonly loggerService: LoggerService,
    private readonly transaction: TransactionExecutor,
    private readonly integrationService: IntegrationService,
    private readonly luminContractService: LuminContractService,
  ) {
    const credentials = process.env.LUMIN_GOOGLE_APPLICATION_CREDENTIALS;
    if (!getApps().length) {
      initializeApp({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        credential: cert(JSON.parse(credentials)),
      });
    }
  }

  aggregateNotificationUsers(pipelines: PipelineStage[]): Promise<any> {
    return this.notificationUserModel.aggregate(pipelines).exec();
  }

  async createNotifications(notifications) {
    const notification = await this.notificationModel.create(notifications);
    return { ...notification.toObject(), _id: notification._id.toHexString() };
  }

  async createNotificationUser(notificationUser) {
    const notiUser = await this.notificationUserModel.create(notificationUser);
    return { ...notiUser.toObject(), _id: notiUser._id.toHexString() };
  }

  async getNotificationUsersByCondition(
    conditions: FilterQuery<INotificationUser>,
    projections?: ProjectionType<INotificationUser>,
  ): Promise<INotificationUser[]> {
    const notificationUsers = await this.notificationUserModel.find(conditions, projections).exec();
    return notificationUsers.map((notificationUser) => ({ ...notificationUser.toObject(), _id: notificationUser._id.toHexString() }));
  }

  async getNotificationsByConditions(
    conditions: FilterQuery<INotification>,
    projections?: ProjectionType<INotification>,
  ): Promise<INotification[]> {
    const notifications = await this.notificationModel.find(conditions, projections).exec();
    return notifications.map((notification) => ({ ...notification.toObject(), _id: notification._id.toHexString() }));
  }

  updateNotificationsUser(conditions:FilterQuery<INotificationUser>, newProperty) {
    return this.notificationUserModel.updateMany(conditions, {
      $set: {
        ...newProperty,
      },
    }, { new: true });
  }

  async updateNotificationUser(
    conditions: FilterQuery<INotificationUser>,
    newProperty: FilterQuery<INotificationUser>,
    options?: Record<string, any>,
  ): Promise<INotificationUser> {
    const notificationUser = await this.notificationUserModel.findOneAndUpdate(conditions, newProperty, options).exec();
    return notificationUser ? { ...notificationUser.toObject(), _id: notificationUser._id.toHexString() } : null;
  }

  async updateNotification(
    conditions: FilterQuery<INotificationUser>,
    newProperty: FilterQuery<INotificationUser>,
    options?: Record<string, any>,
  ): Promise<INotification> {
    const notification = await this.notificationModel.findOneAndUpdate(conditions, newProperty, options).exec();
    return notification ? { ...notification.toObject(), _id: notification._id.toHexString() } : null;
  }

  publishNewNotifications(receiverIdList, publishNewNotification) {
    receiverIdList.forEach((receiverId) => {
      this.publishNotificationToUser(receiverId, publishNewNotification, NEW_NOTIFICATION);
    });
  }

  publishFirebaseNotifications(receiverIdList: string[], notification: IFirebaseNotification, data: IFirebaseNotificationData) {
    receiverIdList.forEach((receiverId) => {
      this.firebasePushNotification(receiverId, notification, data);
    });
  }

  publishDeleteNotification(receiverIdList, data) {
    receiverIdList.forEach((receiverId) => {
      this.publishNotificationToUser(receiverId, data, 'deleteNotification');
    });
  }

  publishNotificationToUser(receiverId, publishNotification, publishType) {
    this.pubSub.publish(`${publishType}.${receiverId}`, {
      [publishType]: {
        userId: receiverId,
        ...publishNotification,
      },
    });
  }

  firebasePushNotification(receiverId: string, notification: IFirebaseNotification, data: IFirebaseNotificationData) {
    /**
     * Resolve issue: Deprecated endpoint
     * https://github.com/firebase/firebase-admin-node/issues/2602
     * https://github.com/firebase/firebase-admin-node/discussions/2518
     */
    getMessaging().send({
      data,
      notification,
      topic: typeof receiverId === 'object' ? (receiverId as Types.ObjectId)?.toHexString() : receiverId,
    }).then(() => {
      if (typeof receiverId === 'object') {
        this.loggerService.warn({
          context: 'firebasePushNotificationWarning',
          extraInfo: {
            data,
            notification,
            receiverId: (receiverId as Types.ObjectId)?.toHexString(),
          },
        });
      }
    }).catch((err) => {
      this.loggerService.error({
        context: 'firebasePushNotificationError',
        error: err,
        extraInfo: {
          data,
          notification,
          receiverId: typeof receiverId === 'object' ? (receiverId as Types.ObjectId)?.toHexString() : receiverId,
        },
      });
    });
  }

  interceptorActor(actor, actorExist) {
    const {
      actorData, type, actorId, actorName, payment,
    } = actor;
    if (actorData?.type === APP_USER_TYPE.SALE_ADMIN) {
      return {
        type,
        actorData,
      };
    }
    if (actorExist) {
      if (type === 'user') {
        return {
          id: actorId,
          avatarRemoteId: actorExist.avatarRemoteId,
          type,
          name: actorExist.name,
          actorData,
        };
      }
      if (type === 'plan') {
        return {
          type: payment.period,
          name: payment.type,
        };
      }
    }
    return {
      id: 'ANONYMOUS',
      avatarRemoteId: '',
      type: type || 'unknown',
      name: actorName || 'anonymous',
      actorData,
    };
  }

  interceptorEntity(entity, entityExist) {
    if (!(entity || entityExist)) {
      return null;
    }
    if (entityExist) {
      if ([
        NotificationEntityType.USER,
        NotificationEntityType.TEAM,
        NotificationEntityType.DOCUMENT,
        NotificationEntityType.FOLDER,
      ].includes(entity.type as string)) {
        return {
          id: entity.entityId,
          name: entity.entityName,
          type: entity.type,
          avatarRemoteId: entity.avatarRemoteId,
          entityData: entity.entityData,
        };
      }
      if (entity.type === 'organization') {
        return {
          id: entity.entityId,
          name: entity.entityName,
          type: entity.type,
          avatarRemoteId: entity.avatarRemoteId,
          entityData: entity.entityData,
        };
      }
    }
    return {
      type: entity.type,
      id: entity.entityId,
      name: entity.entityName,
      entityData: entity.entityData,
    };
  }

  interceptorTarget(target, targetExist) {
    if (targetExist) {
      if (target.type === 'team' || target.type === 'user' || target.type === 'organization') {
        return {
          targetId: target.targetId,
          targetName: target.targetName,
          type: target.type,
          targetData: target.targetData,
        };
      }
    } else if (!target) {
      return {
        targetId: null,
      };
    }
    return target;
  }

  async initNotificationData(notification: {
    notificationId: string,
    target: Record<string, any>,
    isRead: boolean,
    actor: Record<string, any>,
    entity: Record<string, any>,
    notificationType: string,
    actionType: number,
    createdAt: string,
    tab: NotificationTab,
    product: NotificationProduct,
  }): Promise<Record<string, any>> {
    const {
      notificationId, target, isRead, actor, entity, notificationType, actionType, createdAt, tab, product,
    } = notification;
    if (target) {
      target.targetData = await this.interceptorMetadata(target.targetData as Record<string, unknown>);
    }
    if (entity) {
      entity.entityData = await this.interceptorMetadata(entity.entityData as Record<string, unknown>);
    }
    return {
      _id: notificationId,
      actor,
      entity,
      is_read: isRead,
      target,
      notificationType,
      actionType,
      createdAt,
      tab,
      product,
    };
  }

  private async interceptorMetadata(data: Record<string, any>): Promise<Record<string, any>> {
    const { orgId, ...rest } = data || {};
    if (!orgId) {
      return data;
    }
    const organization = await this.organizationService.getOrgById(orgId as string);
    if (!organization) {
      return data;
    }
    return {
      ...rest,
      orgId: organization._id,
      orgUrl: organization.url,
      orgName: organization.name,
      avatarRemoteId: organization.avatarRemoteId,
    };
  }

  private async genPublishCommonNotificationData(notification: IPublishNotification) {
    const actorExist = await this.userService.findUserById(notification.actor.actorId);
    const actorData = this.interceptorActor(notification.actor, actorExist);

    let entityExist;
    switch (notification.notificationType) {
      case NotificationType.DOCUMENT:
      case NotificationType.COMMENT:
        entityExist = await this.documentService.getDocumentByDocumentId(notification.entity.entityId);
        break;
      case NotificationType.FOLDER:
        entityExist = await this.folderService.findOneFolder(notification.entity.entityId);
        break;
      default:
        break;
    }

    const entityData = this.interceptorEntity(notification.entity, entityExist);

    let targetExist = null;
    if (notification.target?.targetId) {
      if (notification.target?.type === 'team') {
        targetExist = await this.teamService.findOneById(notification.target.targetId);
      }
      if (notification.target?.type === 'user') {
        targetExist = await this.userService.findUserById(notification.target.targetId);
      }
      if (notification.target?.type === 'organization') {
        targetExist = await this.organizationService.getOrgById(notification.target.targetId);
      }
    }
    const targetData = this.interceptorTarget(notification.target, targetExist);

    return this.initNotificationData({
      notificationId: notification._id,
      target: targetData,
      isRead: notification.is_read,
      actor: actorData,
      entity: entityData,
      notificationType: notification.notificationType,
      actionType: notification.actionType,
      createdAt: notification.createdAt,
      tab: notification.tab,
      product: notification.product,
    });
  }

  private async genPublishPaymentNotificationData(notification: IPublishNotification) {
    const actor = await this.userService.findUserById(notification.actor.actorId);
    const actorData = this.interceptorActor(actor, 'plan');
    const entityData = {};
    return this.initNotificationData({
      notificationId: notification._id,
      target: notification.target,
      isRead: notification.is_read,
      actor: actorData,
      entity: entityData,
      notificationType: notification.notificationType,
      actionType: notification.actionType,
      createdAt: notification.createdAt,
      tab: notification.tab,
      product: notification.product,
    });
  }

  private async genPublishTeamNotificationData(notification: IPublishNotification) {
    let entityExist;

    const actorExist = await this.userService.findUserById(notification.actor.actorId);
    const actorData = this.interceptorActor(notification.actor, actorExist);

    switch (notification.entity.type) {
      case NotificationEntityType.USER:
        entityExist = await this.userService.findUserById(notification.entity.entityId);
        break;
      case NotificationEntityType.DOCUMENT:
        entityExist = await this.documentService.getDocumentByDocumentId(notification.entity.entityId);
        break;
      case NotificationEntityType.FOLDER:
        entityExist = await this.folderService.findOneFolder(notification.entity.entityId);
        break;
      default:
        break;
    }

    const entityData = this.interceptorEntity(notification.entity, entityExist);

    const targetExist = notification.target?.targetId
      ? await this.teamService.findOneById(notification.target.targetId)
      : null;
    const targetData = this.interceptorTarget(notification.target, targetExist);

    return this.initNotificationData({
      notificationId: notification._id,
      target: targetData,
      isRead: notification.is_read,
      actor: actorData,
      entity: entityData,
      notificationType: notification.notificationType,
      actionType: notification.actionType,
      createdAt: notification.createdAt,
      tab: notification.tab,
      product: notification.product,
    });
  }

  private async genPublishOrganizationNotificationData(notification: IPublishNotification) {
    const actorExist = notification.actor && await this.userService.findUserById(notification.actor.actorId);
    const actorData = this.interceptorActor(notification.actor || {}, actorExist);

    let entityExist;
    if (notification.entity) {
      switch (notification.entity.type) {
        case NotificationEntityType.USER:
          entityExist = await this.userService.findUserById(notification.entity.entityId);
          break;
        case NotificationEntityType.ORGANIZATION:
          entityExist = await this.organizationService.getOrgById(notification.entity.entityId);
          break;
        case NotificationEntityType.TEAM:
          entityExist = await this.teamService.findOneById(notification.entity.entityId);
          break;
        default:
          break;
      }
    }
    const entityData = this.interceptorEntity(notification.entity, entityExist);
    let targetData = null;

    if (notification.target) {
      const isNonUser = notification.target.type === NotificationTargetType.NON_USER;
      targetData = {
        targetId: isNonUser ? null : notification.target.targetId,
        targetName: notification.target.targetName,
        type: notification.target.type,
        targetData: notification.target.targetData,
      };
    }

    return this.initNotificationData({
      notificationId: notification._id,
      target: targetData,
      isRead: notification.is_read,
      actor: actorData,
      entity: entityData,
      notificationType: notification.notificationType,
      actionType: notification.actionType,
      createdAt: notification.createdAt,
      tab: notification.tab,
      product: notification.product,
    });
  }

  private async genPublishContractNotificationData(notification: IPublishNotification) {
    const actorExist = notification.actor && await this.userService.findUserById(notification.actor.actorId);
    const actorData = this.interceptorActor(notification.actor || {}, actorExist);

    let entityExist;
    if (notification.entity) {
      switch (notification.entity.type) {
        case NotificationEntityType.USER:
          entityExist = await this.userService.findUserById(notification.entity.entityId);
          break;
        case NotificationEntityType.ORGANIZATION:
          entityExist = await this.organizationService.getOrgById(notification.entity.entityId);
          break;
        case NotificationEntityType.TEAM:
          entityExist = await this.teamService.findOneById(notification.entity.entityId);
          break;
        default:
          break;
      }
    }
    const entityData = this.interceptorEntity(notification.entity, entityExist);
    let targetData = null;

    if (notification.target) {
      const isNonUser = notification.target.type === NotificationTargetType.NON_USER;
      targetData = {
        targetId: isNonUser ? null : notification.target.targetId,
        targetName: notification.target.targetName,
        type: notification.target.type,
        targetData: notification.target.targetData,
      };
    }

    return this.initNotificationData({
      notificationId: notification._id,
      target: targetData,
      isRead: notification.is_read,
      actor: actorData,
      entity: entityData,
      notificationType: notification.notificationType,
      actionType: notification.actionType,
      createdAt: notification.createdAt,
      tab: notification.tab,
      product: notification.product,
    });
  }

  async genPublishNotificationData(notification: IPublishNotification): Promise<Record<string, any>> {
    switch (notification.notificationType) {
      case NotificationType.DOCUMENT:
      case NotificationType.COMMENT:
      case NotificationType.FOLDER:
        return this.genPublishCommonNotificationData(notification);
      case NotificationType.PAYMENT:
        return this.genPublishPaymentNotificationData(notification);
      case NotificationType.TEAM:
        return this.genPublishTeamNotificationData(notification);
      case NotificationType.ORGANIZATION:
        return this.genPublishOrganizationNotificationData(notification);
      case NotificationType.CONTRACT:
        return this.genPublishContractNotificationData(notification);
      default:
        return null;
    }
  }

  async createUsersNotifications(
    notification: any,
    receiverIdList: string[],
    tab: NotificationTab = NotificationTab.GENERAL,
    product: NotificationProduct = NotificationProduct.LUMIN_PDF,
  ): Promise<INotification> {
    const notificationsResp = await this.createNotifications(notification);
    this.handleCreateNotificationUser({
      createdNotification: notificationsResp,
      receiverIds: receiverIdList,
      tab,
      product,
    });
    return notificationsResp;
  }

  async handleCreateNotificationUser(
    params: {
      createdNotification: INotification,
      receiverIds: string[],
      tab: NotificationTab,
      product?: NotificationProduct,
    },
  ): Promise<INotificationUser[]> {
    const {
      createdNotification, receiverIds, tab, product = NotificationProduct.LUMIN_PDF,
    } = params;

    const createdNotificationsUsers: INotificationUser[] = await Promise.all(receiverIds.map((receiverId) => {
      const notificationUser = {
        notificationId: createdNotification._id,
        userId: receiverId,
        tab,
        product,
      };
      this.userService.findUserById(receiverId, { newNotifications: 1 }, true).then((user) => {
        const { newNotifications } = user || {};
        if (!newNotifications || !(newNotifications[tab.toLowerCase()] instanceof Date)) {
          this.userService.setUserNotificationStatus({
            userId: receiverId,
            tab,
            time: new Date(Date.now() - 30000),
          });
        }
      });
      return this.createNotificationUser(notificationUser);
    }));
    if (!createdNotificationsUsers.length) {
      return null;
    }
    const attachNotificationId = {
      _id: createdNotification._id,
      createdAt: createdNotification.createdAt,
      is_read: false,
      tab,
      product,
      ...createdNotification,
    } as IPublishNotification;
    const publishData = await this.genPublishNotificationData(attachNotificationId);
    this.luminContractService.publishNewNotification({
      notification: publishData as PublishNewNotification,
      receiverIds,
    });
    this.publishNewNotifications(receiverIds, publishData);
    return createdNotificationsUsers;
  }

  async deleteNotification(_id: string | Types.ObjectId, session: ClientSession = null): Promise<void> {
    await this.notificationModel.deleteOne({ _id }).session(session).exec();
  }

  async deleteNotificationUser(conditions: FilterQuery<INotificationUser>, session: ClientSession = null): Promise<void> {
    await this.notificationUserModel.deleteOne(conditions).session(session).exec();
  }

  async getNotificationUserByNotiId(notificationId: string): Promise<INotificationUser[]> {
    const notificationUsers = await this.notificationUserModel.find({ notificationId }).exec();
    return notificationUsers.map((notificationUser) => ({ ...notificationUser.toObject(), _id: notificationUser._id.toHexString() }));
  }

  async getNotificationById(_id: string): Promise<INotification> {
    const notification = await this.notificationModel.findOne({ _id }).exec();
    return notification ? { ...notification.toObject(), _id: notification._id.toHexString() } : null;
  }

  async deleteNotificationUsers(conditions: FilterQuery<INotificationUser>, session: ClientSession = null): Promise<void> {
    await this.notificationUserModel.deleteMany(conditions).session(session).exec();
  }

  async deleteNotifications(conditions: FilterQuery<INotification>, session: ClientSession = null): Promise<void> {
    await this.notificationModel.deleteMany(conditions).session(session).exec();
  }

  async sendNotificationAfterAddTeamMember({
    members, resource,
  }): Promise<void> {
    const { actor, team, organization = {} } = resource;
    const membersInfo = await Promise.all(members.map((member) => this.userService.findUserByEmail(member.userEmail as string))) as User[];
    const listMemberName = membersInfo.map((member) => member.name);
    members.forEach((member, index) => {
      const notification = notiOrgFactory.create(NotiOrgTeam.ADD_MEMBER, {
        actor: { user: actor },
        entity: {
          user: {
            _id: member.userId,
            name: listMemberName[index],
          },
        },
        target: { team, organization },
      });
      const integrationNotification = integrationNotificationHandler({
        context: NotificationContext.Circle,
        type: OrganizationAction.ADD_USER_TO_TEAM,
        data: {
          sendTo: [member.userId],
          actor: {
            id: actor._id,
          },
          target: {
            actorName: actor.name,
            teamName: team.name,
            circleName: organization.name,
          },
          data: {
            circleUrl: organization.url,
            teamId: team._id,
          },
        },
      });
      this.integrationService.sendNotificationToIntegration(integrationNotification);
      this.createUsersNotifications(notification, [member.userId as string]);

      // send out-app noti for mobile
      const {
        notificationContent: firebaseNotificationContent,
        notificationData: firebaseNotificationData,
        notificationContentForTargetUser: firebaseNotificationContentExtra,
      } = notiFirebaseTeamFactory.create(NotiOrgTeam.ADD_MEMBER, {
        organization,
        team,
        actor,
        targetUser: membersInfo[index],
      });

      this.organizationService.publishFirebaseNotiToAllTeamMember({
        teamId: team._id,
        firebaseNotificationData,
        firebaseNotificationContent,
        excludes: [actor._id, member.userId],
        firebaseNotificationContentExtra,
        extraMembers: [member.userId],
      });
    });
  }

  private getMinimumDateStoreNotifications(): Date {
    return moment().subtract(1, 'month').toDate();
  }

  private getTabQuery(tab: NotificationTab): FilterQuery<INotificationUser> {
    return tab !== NotificationTab.GENERAL ? { tab } : {
      $or: [
        { tab: { $exists: false } },
        { tab: { $eq: NotificationTab.GENERAL } },
      ],
    };
  }

  async countUnreadNotifications(user: User, tab: NotificationTab): Promise<NewNotificationTabData> {
    const date = this.getMinimumDateStoreNotifications();
    /**
      * the old user doesn't have the `newNotifications` field in the User schema or is boolean value
    */
    const latestOpenedDate = user.newNotifications?.[tab.toLowerCase()] || false;
    const facetStage: Record<string, PipelineStage.FacetPipelineStage[]> = {
      unreadCount: [
        {
          $match: {
            createdAt: {
              $gte: date,
            },
            is_read: false,
          },
        },
        {
          $limit: MAX_UNREAD_COUNT_QUERY,
        },
        {
          $count: 'value',
        },
      ],
    };
    /**
       * the old user have the `newNotifications` with boolean value
    */
    if (latestOpenedDate instanceof Date) {
      facetStage.latestNoti = [
        {
          $match: {
            createdAt: {
              $gte: latestOpenedDate,
            },
          },
        },
        { $limit: 1 },
      ];
    }

    const pipeline: PipelineStage[] = [
      {
        $match: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          userId: new Types.ObjectId(user._id),
          ...this.getTabQuery(tab),
        },
      },
      {
        $facet: facetStage,
      },
    ];

    // For REQUESTS tab, exclude notifications from SCIM-enabled organizations
    if (tab === NotificationTab.REQUESTS) {
      try {
        const scimEnabledOrgIds = await this.organizationService.getOrganizationIdsWithScimEnabled(user._id);
        if (scimEnabledOrgIds.length > 0) {
          pipeline[0] = {
            $match: {
              ...(pipeline[0] as any).$match,
              'noti.entity.entityId': { $nin: scimEnabledOrgIds.map((id) => new Types.ObjectId(id)) },
            },
          };

          pipeline.splice(0, 0, {
            $lookup: {
              from: 'notifications',
              localField: 'notificationId',
              foreignField: '_id',
              as: 'noti',
            },
          });

          pipeline.splice(1, 0, {
            $unwind: {
              path: '$noti',
              preserveNullAndEmptyArrays: false,
            },
          });
        }
      } catch (error) {
        this.loggerService.error({
          context: this.countUnreadNotifications.name,
          error: 'Failed to get SCIM-enabled organization IDs',
          extraInfo: { error: error.message || error },
        });
      }
    }

    const [data] = await this.notificationUserModel.aggregate(pipeline);

    return {
      /**
       * the old user doesn't have the `newNotifications` field in the User schema or is boolean value
       */
      hasNewNoti: latestOpenedDate instanceof Boolean ? Boolean(latestOpenedDate) : Boolean(data.latestNoti?.length),
      unreadCount: data.unreadCount[0]?.value,
    };
  }

  // change `tab` to optional parameter to support get all notifications for Sign product
  async getNotificationUsers(params: {
    userId: string, tab?: NotificationTab, cursor?: string, excludeNotiId?: string, forSignProduct?: boolean, limit?: number
  }): Promise<IPublishNotification[]> {
    const {
      tab, userId, cursor, excludeNotiId, forSignProduct, limit,
    } = params;
    const matchTab = tab ? this.getTabQuery(tab) : {};
    const minDate = this.getMinimumDateStoreNotifications();
    const matchCursor = cursor ? {
      createdAt: { $lt: new Date(+cursor), $gte: minDate },
    } : { createdAt: { $gte: minDate } };

    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: new Types.ObjectId(userId),
          notificationId: { $ne: new Types.ObjectId(excludeNotiId) },
          ...matchTab,
          ...matchCursor,
        },
      },
      {
        $lookup: {
          from: 'notifications',
          localField: 'notificationId',
          foreignField: '_id',
          as: 'noti',
        },
      },
      {
        $unwind: {
          path: '$noti',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          'noti.is_read': '$is_read',
          'noti.tab': '$tab',
          'noti.product': '$product',
        },
      },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$noti', { createdAt: '$createdAt' }] },
        },
      },
    ];

    // For REQUESTS tab, exclude notifications from SCIM-enabled organizations
    if (tab === NotificationTab.REQUESTS) {
      try {
        const scimEnabledOrgIds = await this.organizationService.getOrganizationIdsWithScimEnabled(userId);
        if (scimEnabledOrgIds.length > 0) {
          pipeline.push({
            $match: {
              'entity.entityId': { $nin: scimEnabledOrgIds.map((id) => new Types.ObjectId(id)) },
            },
          });
        }
      } catch (error) {
        this.loggerService.error({
          context: this.getNotificationUsers.name,
          message: 'Failed to exclude notifications from SCIM-enabled organizations',
          error,
          extraInfo: {
            userId,
          },
        });
      }
    }

    if (forSignProduct) {
      pipeline.push({
        $match: {
          $or: [
            {
              actionType: { $in: ORGANIZATION_ACTION_TYPES_FOR_SIGN_PRODUCT },
              notificationType: NotificationType.ORGANIZATION,
            },
            { notificationType: NotificationType.CONTRACT },
          ],
        },
      });
    }

    pipeline.push(
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: (limit || LIMIT_NOTIFICATIONS_PER_QUERY) + 1,
      },
    );

    return this.aggregateNotificationUsers(pipeline);
  }

  async removeNotification(notification: INotification, userId: string): Promise<void> {
    if (!notification) {
      return;
    }
    const { _id } = notification;
    const notificationUser = await this.getNotificationUserByNotiId(_id);
    const context = { fn: this.removeNotification.name, notificationId: _id, userId };
    await this.transaction.withTransaction<{ notificationId: string; userId: string }>(
      async (session) => {
        if (notificationUser.length === 1) {
          await this.deleteNotification(_id, session);
        }
        await this.deleteNotificationUser({ notificationId: _id, userId }, session);
      },
      context,
    );
    this.publishDeleteNotification([userId], { notificationId: _id, tab: notificationUser[0].tab });
  }

  async removeMultiNotifications({
    notification,
    userIds,
    tabs,
  }: {
    notification: INotification,
    userIds: string[],
    tabs: NotificationTab[],
  }): Promise<void> {
    const { _id } = notification;
    await this.deleteNotificationUsers({ notificationId: _id, userId: { $in: userIds } });
    await this.deleteNotification(_id);
    tabs.forEach((tab) => {
      this.publishDeleteNotification(userIds, { notificationId: _id, tab });
    });
  }

  @RabbitSubscribe({
    queue: QUEUES.LUMIN_WEB_SYNC_SIGN_NOTIFICATION,
    errorBehavior: MessageHandlerErrorBehavior.REQUEUE,
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      messageTtl: 604800000, // 7 days
    },
  })
  async handleSyncSignNotification(message: SyncSignNotificationMessage): Promise<void> {
    const {
      notification,
      receiverIds,
      tab,
    } = message;
    if (!receiverIds.length) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.createUsersNotifications(notification, receiverIds, tab, NotificationProduct.LUMIN_SIGN);
  }

  async removeRequestJoinOrgNotification({
    actorId,
    entityId,
  }: {
    actorId: string;
    entityId: string;
  }): Promise<void> {
    if (!actorId || !entityId) return;
    const notification = await this.notificationModel.findOne({
      actionType: NotiOrg.REQUEST_JOIN,
      'actor.actorId': actorId,
      'entity.entityId': entityId,
    });
    if (notification) {
      const notificationUsers = await this.notificationUserModel.find({ notificationId: notification._id });
      const userIds = notificationUsers.map((notificationUser) => notificationUser.userId);
      this.removeMultiNotifications({
        notification: {
          ...notification,
          _id: notification._id.toString(),
        },
        userIds,
        tabs: [NotificationTab.REQUESTS],
      });
    }
  }
}
