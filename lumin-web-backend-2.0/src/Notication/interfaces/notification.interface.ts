/* eslint-disable no-use-before-define */
import { NotificationTab } from 'graphql.schema';

export interface INotificationModel {
    actor: Actor,
    entity: Entity,
    target: Target,
    actionType: number,
    notificationType: string,
    createdAt: string,
}

export interface INotification extends INotificationModel {
    _id: string;
}

export interface Actor {
    actorId: string,
    type: string,
    actorName: string,
    actorData: Record<string, any>
}

export interface Entity {
    entityId: string,
    type: string,
    entityName: string
    entityData: Record<string, any>
}

export interface Target {
    targetId: string,
    type: string,
    targetName: string,
    targetData: Record<string, any>
}

export interface INotificationUserModel {
    notificationId : string,
    userId: string,
    is_read: boolean,
    tab: string,
    createdAt: string,
}

export interface INotificationUser extends INotificationUserModel {
    _id: string;
}

export interface IFirebaseNotification {
    tag?: string,
    body?: string,
    icon?: string,
    badge?: string,
    color?: string,
    sound?: string,
    title?: string,
    bodyLocKey?: string,
    bodyLocArgs?: string,
    clickAction?: string,
    titleLocKey?: string,
    titleLocArgs?: string,
    [key: string]: string | undefined,
}

export type IPublishNotification = INotification & {
    is_read: boolean,
    tab: NotificationTab
    product: NotificationProduct,
    metadata?: Record<string, any>,
};

export interface IEntityFirebaseNotificationData {
    orgUrl?: string
    teamId?: string
    documentId?: string
    annotationId?:string
    targetId?: string
    [key: string]: string,
}

export interface IFirebaseNotificationData extends IEntityFirebaseNotificationData{
    actionType: string
    notificationType: string
}

export enum GrpcNotificationTab {
    GENERAL,
    INVITES,
    REQUESTS,
}

export interface SyncSignNotificationMessage {
    notification: Omit<INotification, 'createdAt'>,
    receiverIds: string[],
    tab: NotificationTab,
}

export enum NotificationProduct {
    LUMIN_PDF = 'LUMIN_PDF',
    LUMIN_SIGN = 'LUMIN_SIGN',
}
