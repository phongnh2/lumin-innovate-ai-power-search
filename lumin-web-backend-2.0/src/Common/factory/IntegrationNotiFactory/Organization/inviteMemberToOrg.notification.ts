import { OrganizationAction } from 'Common/constants/NotificationIntegrationConstant';
import { IntegrationNotiOrganization } from './notification.organization';
import { OrganizationNotificationInput } from '../notification.interface';

export class InviteMemberToOrgNotification extends IntegrationNotiOrganization {
  constructor(input: OrganizationNotificationInput) {
    super({
      sendTo: input.sendTo,
      actor: input.actor,
      data: input.data,
      target: input.target,
      type: OrganizationAction.INVITE_MEMBER_TO_ORG,
    });
  }
}
