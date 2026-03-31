import { DocumentAction, OrganizationAction } from 'Common/constants/NotificationIntegrationConstant';
import { NotificationFactory } from 'Common/factory/IntegrationNotiFactory/notification.factory';
import {
  DocumentNotificationInput,
  NotificationContext,
  OrganizationNotificationInput,
} from 'Common/factory/IntegrationNotiFactory/notification.interface';

export default (
  { context, type, data }
  : {
    context: NotificationContext, type: DocumentAction | OrganizationAction, data: DocumentNotificationInput | OrganizationNotificationInput,
  },
) => {
  const { notificationFactory, notificationType } = NotificationFactory.getFactory(context, type);
  return notificationFactory.createNotification(notificationType as unknown as never, data).exportData();
};
