/* eslint-disable no-use-before-define */
export type OrganizationNotificationDataType = {
  circleId?: string;
  teamId?: string;
  circleName?: string;
  circleUrl?: string;
  inviteUrl?: string;
}

export type OrganizationNotificationInput = Partial<INotificationIntegrationBase> & { data: OrganizationNotificationDataType };

export type DocumentNotificationDataType = {
  documentId?: string;
}

export type DocumentNotificationInput = Partial<INotificationIntegrationBase> & { data: DocumentNotificationDataType };

export enum NotificationContext {
  Circle = 'circle',
  Document = 'document'
}

export interface INotificationIntegrationBase {
  sendTo: string[]
  actor: {
    id?: string
  }
  data: OrganizationNotificationDataType | DocumentNotificationDataType
  target?: Record<string, string>
}

export interface INotificationIntegration extends INotificationIntegrationBase {
  context: NotificationContext,
  type: string,
  message?: string
}
