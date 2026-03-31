import { DocumentAction } from 'Common/constants/NotificationIntegrationConstant';
import { NotificationDocument } from './notification.document';
import { DocumentNotificationInput } from '../notification.interface';

export class ShareDocumentToUserNotification extends NotificationDocument {
  constructor(input: DocumentNotificationInput) {
    super({
      sendTo: input.sendTo,
      actor: input.actor,
      data: input.data,
      target: input.target,
      type: DocumentAction.SHARED_DOCUMENT_TO_YOU,
    });
  }
}
