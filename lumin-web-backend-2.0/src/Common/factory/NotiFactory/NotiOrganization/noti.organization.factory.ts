/* eslint-disable import/extensions */
import { NotiOrg, NotiOrgTeam } from 'Common/constants/NotificationConstants';
import { NotiAbstractFactory } from 'Common/factory/NotiFactory/noti.abstract.factory';
import { NotiInterface } from 'Common/factory/NotiFactory/noti.interface';

import { NotiOrganizationInterface } from './noti.organization.interface';
import { NotiUpdateSignSeats } from './Product/noti-update-sign-seats';
import { NotiAcceptRequestAccessOrganization } from './Product/noti.accept-request-access-organization';
import { NotiAnyoneCanJoinEnabledAutomatically } from './Product/noti.anyone-can-join-enabled-automatically';
import { NotiAutoJoinOrganization } from './Product/noti.auto-join.organization';
import { NotiOrganizationBase } from './Product/noti.base.organization';
import { NotiConvertOrganization } from './Product/noti.convert-organization';
import { NotiDeleteMultiFolderOrganization } from './Product/noti.delete-multi-folder.organization';
import { NotiDeleteMultiOrganizationDocument } from './Product/noti.delete-multi-org-document';
import { NotiDeleteOrganization } from './Product/noti.delete.organization';
import { NotiDisabledAutoApproveOrganization } from './Product/noti.disabled-auto-approve.organization';
import { NotiFirstMemberInviteCollaborator } from './Product/noti.first-member-invite-collaborator.organization';
import { NotiFirstUserManuallyJoinOrg } from './Product/noti.first-user-manually-join-org.organization';
import { NotiInviteJoinSameUnpopularDomainOrganization } from './Product/noti.invite-join-same-unpopular-domain.organization';
import { NotiInviteJoinOrganization } from './Product/noti.invite-join.organization';
import { NotiJoinOrgViaInviteLink } from './Product/noti.join-org-via-invite-link.organization';
import { NotiLeaveOrganization } from './Product/noti.leave.organization';
import { NotiMembersOfFreeCircleChangeSubscription } from './Product/noti.members-of-free-circle-change-subscription.organization';
import { NotiTransferAgreementToAnotherOrg } from './Product/noti.noti-transfer-agreement-to-another-org';
import { NotiRemoveAssociateDomain } from './Product/noti.remove-associate-domain';
import { NotiRemoveDocumentOrganization } from './Product/noti.remove-document.organization';
import { NotiRemoveMemberOrganization } from './Product/noti.remove-member.organization';
import { NotiRequestJoinOrganization } from './Product/noti.request-join.organization';
import { NotiStopTransferOwnerOrganization } from './Product/noti.stop-transfer-owner.organization';
import { NotiTransferOwnerOrganization } from './Product/noti.transfer-owner.organization';
import { NotiUpdateUserRole } from './Product/noti.update-user-role.organization';
import { NotiUploadTemplateOrganization } from './Product/noti.upload-template.organization';
import { NotiDeleteTemplateOrganization } from './Product/notif.delete-template.organization';
import { NotiActionToMemberOrganizationTeam } from './Product/Team/noti.action-to-member.organization-team';
import { NotiDeleteMultiDocumentOrganizationTeam } from './Product/Team/noti.delete-multi-document.organization-team';
import { NotiDeleteMultiFolderOrganizationTeam } from './Product/Team/noti.delete-multi-folder.organization-team';
import { NotiDeleteTemplateOrganizationTeam } from './Product/Team/noti.delete-template.organization-team';
import { NotiDeleteOrganizationTeam } from './Product/Team/noti.delete.organization-team';
import { NotiLeaveOrganizationTeam } from './Product/Team/noti.leave.organization-team';
import { NotiRemoveDocumentOrganizationTeam } from './Product/Team/noti.remove-document.organization-team';
import { NotiRemoveMemberOrganizationTeam } from './Product/Team/noti.remove-member.organization-team';
import { NotiTeamMemberInvited } from './Product/Team/noti.team-member-invited.organization-team';
import { NotiUploadTemplateOrganizationTeam } from './Product/Team/noti.upload-template.organization-team';

export class NotiOrganizationFactory extends NotiAbstractFactory {
  public create(type: number, notificationInterface: Partial<NotiOrganizationInterface>): NotiInterface {
    const notificationInitialize = {
      ...notificationInterface,
      actionType: type,
      notificationType: 'OrganizationNotification',
    } as NotiOrganizationInterface;

    let ConstructType: new (noti: NotiOrganizationInterface) => NotiOrganizationBase;

    switch (type) {
      // organization
      case NotiOrg.DELETE_MULTI_DOCUMENT:
        ConstructType = NotiDeleteMultiOrganizationDocument;
        break;
      case NotiOrg.REQUEST_JOIN:
        ConstructType = NotiRequestJoinOrganization;
        break;
      case NotiOrg.INVITE_JOIN:
        ConstructType = NotiInviteJoinOrganization;
        break;
      case NotiOrg.TRANSFER_OWNER:
        ConstructType = NotiTransferOwnerOrganization;
        break;
      case NotiOrg.UPDATE_ORGANIZATION_ROLE:
        ConstructType = NotiUpdateUserRole;
        break;
      case NotiOrg.LEAVE_ORG:
        ConstructType = NotiLeaveOrganization;
        break;
      case NotiOrg.REMOVE_MEMBER:
        ConstructType = NotiRemoveMemberOrganization;
        break;
      case NotiOrg.REMOVE_DOCUMENT:
        ConstructType = NotiRemoveDocumentOrganization;
        break;
      case NotiOrg.ACCEPT_REQUEST_ACCESS_ORG:
        ConstructType = NotiAcceptRequestAccessOrganization;
        break;
      case NotiOrg.DISABLED_AUTO_APPROVE:
        ConstructType = NotiDisabledAutoApproveOrganization;
        break;
      case NotiOrg.AUTO_JOIN_ORG:
        ConstructType = NotiAutoJoinOrganization;
        break;
      case NotiOrg.DELETE_ORGANIZATION:
      case NotiOrg.LUMIN_ADMIN_DELETE_ORG:
        ConstructType = NotiDeleteOrganization;
        break;
      case NotiOrg.STOP_TRANSFER_ADMIN:
        ConstructType = NotiStopTransferOwnerOrganization;
        break;
      case NotiOrg.CONVERT_TO_MAIN_ORGANIZATION:
        ConstructType = NotiConvertOrganization;
        break;
      case NotiOrg.CONVERT_TO_CUSTOM_ORGANIZATION:
        ConstructType = NotiConvertOrganization;
        break;
      case NotiOrg.REMOVE_ASSOCIATE_DOMAIN:
        ConstructType = NotiRemoveAssociateDomain;
        break;
      case NotiOrg.FIRST_USER_MANUALLY_JOIN_ORG:
        ConstructType = NotiFirstUserManuallyJoinOrg;
        break;
      case NotiOrg.DELETE_ORGANIZATION_TEMPLATE:
        ConstructType = NotiDeleteTemplateOrganization;
        break;
      case NotiOrg.UPLOAD_TEMPLATE:
        ConstructType = NotiUploadTemplateOrganization;
        break;
      case NotiOrg.FIRST_MEMBER_INVITE_COLLABORATOR:
        ConstructType = NotiFirstMemberInviteCollaborator;
        break;
      case NotiOrg.INVITE_JOIN_SAME_UNPOPULAR_DOMAIN:
        ConstructType = NotiInviteJoinSameUnpopularDomainOrganization;
        break;
      case NotiOrg.MEMBERS_OF_FREE_CIRCLE_START_FREE_TRIAL:
      case NotiOrg.MEMBERS_OF_FREE_CIRCLE_UPGRADE_SUBSCRIPTION:
        ConstructType = NotiMembersOfFreeCircleChangeSubscription;
        break;
      case NotiOrg.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY:
        ConstructType = NotiAnyoneCanJoinEnabledAutomatically;
        break;
      case NotiOrg.DELETE_MULTI_FOLDER:
        ConstructType = NotiDeleteMultiFolderOrganization;
        break;
      case NotiOrg.JOIN_ORG_VIA_INVITE_LINK:
        ConstructType = NotiJoinOrgViaInviteLink;
        break;
      case NotiOrg.TRANSFER_AGREEMENT_TO_ANOTHER_ORG:
        ConstructType = NotiTransferAgreementToAnotherOrg;
        break;
      case NotiOrg.ASSIGNED_SIGN_SEATS:
      case NotiOrg.UNASSIGNED_SIGN_SEATS:
      case NotiOrg.REJECT_SIGN_SEAT_REQUEST:
        ConstructType = NotiUpdateSignSeats;
        break;

      // organization team
      case NotiOrgTeam.ADD_MEMBER:
      case NotiOrgTeam.TRANSFER_OWNER:
        ConstructType = NotiActionToMemberOrganizationTeam;
        break;
      case NotiOrgTeam.REMOVE_MEMBER:
        ConstructType = NotiRemoveMemberOrganizationTeam;
        break;
      case NotiOrgTeam.LEAVE_ORG_TEAM:
        ConstructType = NotiLeaveOrganizationTeam;
        break;
      case NotiOrgTeam.DELETE_TEAM:
        ConstructType = NotiDeleteOrganizationTeam;
        break;
      case NotiOrgTeam.DELETE_MULTI_DOCUMENT:
        ConstructType = NotiDeleteMultiDocumentOrganizationTeam;
        break;
      case NotiOrgTeam.DELETE_DOCUMENT:
        ConstructType = NotiRemoveDocumentOrganizationTeam;
        break;
      case NotiOrgTeam.DELETE_TEAM_TEMPLATE:
        ConstructType = NotiDeleteTemplateOrganizationTeam;
        break;
      case NotiOrgTeam.UPLOAD_TEMPLATE:
        ConstructType = NotiUploadTemplateOrganizationTeam;
        break;
      case NotiOrgTeam.DELETE_MULTI_FOLDER:
        ConstructType = NotiDeleteMultiFolderOrganizationTeam;
        break;
      case NotiOrgTeam.TEAM_MEMBER_INVITED:
        ConstructType = NotiTeamMemberInvited;
        break;
      default:
        throw Error('Initialize error');
    }

    return new ConstructType(notificationInitialize).derive();
  }
}
