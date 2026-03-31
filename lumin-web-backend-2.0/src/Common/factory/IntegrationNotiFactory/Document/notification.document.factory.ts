import { DocumentAction } from 'Common/constants/NotificationIntegrationConstant';
import { NotificationBaseFactory } from '../notification.base.factory';
import { ShareDocumentToUserNotification } from './shareDocumentToUser.notification';
import { DocumentNotificationDataType, DocumentNotificationInput } from '../notification.interface';

export class NotificationDocumentFactory extends NotificationBaseFactory<DocumentAction, { data: DocumentNotificationDataType }> {
  public createNotification(type: DocumentAction, input: DocumentNotificationInput) {
    switch (type) {
      case DocumentAction.SHARED_DOCUMENT_TO_YOU:
        return new ShareDocumentToUserNotification(input);
      default:
        throw new Error('Invalid notification type');
    }
  }
}
