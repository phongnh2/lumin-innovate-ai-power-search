import { OrganizationAction } from 'Common/constants/NotificationIntegrationConstant';
import { IntegrationNotiOrganization } from './notification.organization';
import { OrganizationNotificationInput } from '../notification.interface';

export class AddUserToTeamNotification extends IntegrationNotiOrganization {
  constructor(input: OrganizationNotificationInput) {
    super({
      sendTo: input.sendTo,
      actor: input.actor,
      data: input.data,
      target: input.target,
      type: OrganizationAction.ADD_USER_TO_TEAM,
    });
  }
}
