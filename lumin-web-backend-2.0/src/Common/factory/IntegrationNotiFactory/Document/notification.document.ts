import { DocumentAction } from 'Common/constants/NotificationIntegrationConstant';
import { NotificationBase } from '../notification.base';
import { DocumentNotificationDataType, DocumentNotificationInput, NotificationContext } from '../notification.interface';

export class NotificationDocument extends NotificationBase<DocumentAction, DocumentNotificationDataType> {
  constructor(input: DocumentNotificationInput & { type: DocumentAction }) {
    super({
      sendTo: input.sendTo,
      actor: input.actor,
      target: input.target,
      data: input.data,
      type: input.type,
      context: NotificationContext.Document,
    });
  }
}
