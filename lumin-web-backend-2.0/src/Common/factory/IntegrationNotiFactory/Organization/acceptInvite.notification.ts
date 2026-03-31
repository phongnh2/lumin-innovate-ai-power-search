import { OrganizationAction } from 'Common/constants/NotificationIntegrationConstant';
import { OrganizationNotificationInput } from '../notification.interface';
import { IntegrationNotiOrganization } from './notification.organization';

export class AcceptInviteNotification extends IntegrationNotiOrganization {
  constructor(input: OrganizationNotificationInput) {
    super({
      sendTo: input.sendTo,
      actor: input.actor,
      data: input.data,
      target: input.target,
      type: OrganizationAction.ACCEPT_INVITE,
    });
  }
}
