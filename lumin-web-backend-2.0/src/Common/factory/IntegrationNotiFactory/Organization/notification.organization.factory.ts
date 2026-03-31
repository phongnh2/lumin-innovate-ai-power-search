import { OrganizationAction } from 'Common/constants/NotificationIntegrationConstant';
import { NotificationBaseFactory } from '../notification.base.factory';
import { InviteMemberToOrgNotification } from './inviteMemberToOrg.notification';
import { AddUserToTeamNotification } from './addUserToTeam.notification';
import { OrganizationNotificationDataType } from '../notification.interface';
import { HitDocstackNotification } from './hitDocstack.notification';
import { AcceptInviteNotification } from './acceptInvite.notification';

export class NotificationOrganizationFactory extends NotificationBaseFactory<OrganizationAction, { data: OrganizationNotificationDataType }> {
  public createNotification(type: OrganizationAction, input: { data: OrganizationNotificationDataType; }) {
    switch (type) {
      case OrganizationAction.INVITE_MEMBER_TO_ORG:
        return new InviteMemberToOrgNotification(input);
      case OrganizationAction.ADD_USER_TO_TEAM:
        return new AddUserToTeamNotification(input);
      case OrganizationAction.ORG_HIT_DOC_STACK:
        return new HitDocstackNotification(input);
      case OrganizationAction.ACCEPT_INVITE:
        return new AcceptInviteNotification(input);
      default:
        throw new Error('Invalid notification type');
    }
  }
}
