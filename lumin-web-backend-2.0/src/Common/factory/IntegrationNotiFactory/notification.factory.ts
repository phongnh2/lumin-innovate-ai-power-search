import { DocumentAction, OrganizationAction } from 'Common/constants/NotificationIntegrationConstant';
import { NotificationContext } from './notification.interface';
import { NotificationDocumentFactory } from './Document/notification.document.factory';
import { NotificationOrganizationFactory } from './Organization/notification.organization.factory';

export class NotificationFactory {
  static getFactory(context: NotificationContext, type: DocumentAction | OrganizationAction) {
    switch (context) {
      case NotificationContext.Document:
        return {
          notificationFactory: new NotificationDocumentFactory(),
          notificationType: type as DocumentAction,
        };
      case NotificationContext.Circle:
        return {
          notificationFactory: new NotificationOrganizationFactory(),
          notificationType: type as OrganizationAction,
        };
      default:
        throw new Error('Invalid notification context');
    }
  }
}
