import { WidgetType } from 'graphql.schema';

export interface IWidgetNotification {
    _id: string,
    userId: string,
    type: WidgetType,
    isPreviewed: boolean,
    isRead: boolean,
    updateAt: string,
    createdAt: string,
    isNewWidget: boolean,
}

export interface ICreateWidgetNotification {
    userId: string,
    type: string,
    isPreviewed: boolean,
    isRead: boolean,
    isNewWidget: boolean,
}

export interface IGetWidgetUserByType {
    userId: string,
    type: WidgetType,
}
