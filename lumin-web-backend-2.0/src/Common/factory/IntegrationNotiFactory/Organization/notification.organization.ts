import { OrganizationAction } from 'Common/constants/NotificationIntegrationConstant';
import { NotificationBase } from '../notification.base';
import { NotificationContext, OrganizationNotificationDataType, OrganizationNotificationInput } from '../notification.interface';

export class IntegrationNotiOrganization extends NotificationBase<OrganizationAction, OrganizationNotificationDataType> {
  constructor(input: OrganizationNotificationInput & { type: OrganizationAction }) {
    super({
      sendTo: input.sendTo,
      actor: input.actor,
      target: input.target,
      data: input.data,
      type: input.type,
      context: NotificationContext.Circle,
    });
  }
}
