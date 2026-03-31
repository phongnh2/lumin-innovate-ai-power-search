import {
  NotiOrg,
  NotificationType,
} from 'Common/constants/NotificationConstants';

import { NotiFirebaseOrganizationInterface } from './noti.firebase.organization.interface';
import { NotiFirebaseAcceptRequestAccessOrganization } from './Product/noti.firebase.accept-request-access.organization';
import { NotiAnyoneCanJoinEnableAutomaticallyOrganization } from './Product/noti.firebase.anyone-can-join-enable-automatically';
import { NotiFirebaseAutoJoinOrganization } from './Product/noti.firebase.auto-join.organization';
import { NotiFirebaseOrganizationBase } from './Product/noti.firebase.base.organization';
import { NotiFirebaseDeleteMultiDocumentOrganization } from './Product/noti.firebase.delete-multi-document.organization';
import { NotiFirebaseDeleteMultipleFoldersOrganization } from './Product/noti.firebase.delete-multiple-folders.organization';
import { NotiFirebaseDeleteOrganization } from './Product/noti.firebase.delete.organization';
import { NotiFirebaseDisabledAutoApproveOrganization } from './Product/noti.firebase.disable-auto-approve.organization';
import { NotiFirebaseFirstMemberInviteCollaboratorOrganization } from './Product/noti.firebase.first-member-invite-collaborator.organization';
import { NotiFirebaseFirstUserManuallyJoinOrganization } from './Product/noti.firebase.first-user-manually-join.organization copy';
import { NotiFirebaseInviteJoinOrganization } from './Product/noti.firebase.invite-join.organization';
import { NotiFirebaseLeaveOrganization } from './Product/noti.firebase.leave.organization';
import { NotiFirebaseMemberStartFreeTrialOrganization } from './Product/noti.firebase.member-start-free-trial.organization';
import { NotiFirebaseMemberUpgradeSubscriptionOrganization } from './Product/noti.firebase.member-upgrade-subscription.organization';
import { NotiFirebaseRemoveDocumentOrganization } from './Product/noti.firebase.remove-document.organization';
import { NotiFirebaseRemoveMemberOrganization } from './Product/noti.firebase.remove-member.organization';
import { NotiFirebaseTransferOwnerOrganization } from './Product/noti.firebase.remove-transfer.owner';
import { NotiFirebaseRequestJoinOrganization } from './Product/noti.firebase.request-join.organization';
import { NotiFirebaseStopTransferAdminOrganization } from './Product/noti.firebase.stop-transfer-admin.organization';
import { NotiFirebaseUpdateRoleOrganization } from './Product/noti.firebase.update-role.organization';
import { NotiInviteJoinSameUnpopularDomainOrganization } from './Product/noti.invite-join-same-unpopular-domain.organization';
import { NotiRemoveAssociateDomainOrganization } from './Product/noti.remove-associate-domain.organization';
import { NotiFirebaseAbstractFactory } from '../noti.firebase.abstract.factory';
import { NotiFirebaseInterface } from '../noti.firebase.interface';

export class NotiFirebaseOrganizationFactory extends NotiFirebaseAbstractFactory {
  public create(
    type: number,
    notificationFirebase: Partial<NotiFirebaseOrganizationInterface>,
  ): NotiFirebaseInterface {
    const notificationInitialize = {
      ...notificationFirebase,
      notificationData: {
        actionType: type.toString(),
        notificationType: NotificationType.ORGANIZATION,
      },
      notificationContentForTargetUser: {
        title: 'Lumin PDF',
      },
      notificationContent: {
        title: 'Lumin PDF',
      },
    } as NotiFirebaseOrganizationInterface;

    let ConstructType: new (
      noti: NotiFirebaseInterface,
    ) => NotiFirebaseOrganizationBase;

    switch (type) {
      case NotiOrg.REQUEST_JOIN:
        ConstructType = NotiFirebaseRequestJoinOrganization;
        break;
      case NotiOrg.AUTO_JOIN_ORG:
        ConstructType = NotiFirebaseAutoJoinOrganization;
        break;
      case NotiOrg.INVITE_JOIN:
        ConstructType = NotiFirebaseInviteJoinOrganization;
        break;
      case NotiOrg.ACCEPT_REQUEST_ACCESS_ORG:
        ConstructType = NotiFirebaseAcceptRequestAccessOrganization;
        break;
      case NotiOrg.DELETE_ORGANIZATION:
        ConstructType = NotiFirebaseDeleteOrganization;
        break;
      case NotiOrg.UPDATE_ORGANIZATION_ROLE:
        ConstructType = NotiFirebaseUpdateRoleOrganization;
        break;
      case NotiOrg.DELETE_MULTI_DOCUMENT:
        ConstructType = NotiFirebaseDeleteMultiDocumentOrganization;
        break;
      case NotiOrg.REMOVE_DOCUMENT:
        ConstructType = NotiFirebaseRemoveDocumentOrganization;
        break;
      case NotiOrg.LEAVE_ORG:
        ConstructType = NotiFirebaseLeaveOrganization;
        break;
      case NotiOrg.REMOVE_MEMBER:
        ConstructType = NotiFirebaseRemoveMemberOrganization;
        break;
      case NotiOrg.TRANSFER_OWNER:
        ConstructType = NotiFirebaseTransferOwnerOrganization;
        break;
      case NotiOrg.FIRST_MEMBER_INVITE_COLLABORATOR:
        ConstructType = NotiFirebaseFirstMemberInviteCollaboratorOrganization;
        break;
      case NotiOrg.FIRST_USER_MANUALLY_JOIN_ORG:
        ConstructType = NotiFirebaseFirstUserManuallyJoinOrganization;
        break;
      case NotiOrg.STOP_TRANSFER_ADMIN:
        ConstructType = NotiFirebaseStopTransferAdminOrganization;
        break;
      case NotiOrg.MEMBERS_OF_FREE_CIRCLE_START_FREE_TRIAL:
        ConstructType = NotiFirebaseMemberStartFreeTrialOrganization;
        break;
      case NotiOrg.MEMBERS_OF_FREE_CIRCLE_UPGRADE_SUBSCRIPTION:
        ConstructType = NotiFirebaseMemberUpgradeSubscriptionOrganization;
        break;
      case NotiOrg.DISABLED_AUTO_APPROVE:
        ConstructType = NotiFirebaseDisabledAutoApproveOrganization;
        break;
      case NotiOrg.INVITE_JOIN_SAME_UNPOPULAR_DOMAIN:
        ConstructType = NotiInviteJoinSameUnpopularDomainOrganization;
        break;
      case NotiOrg.REMOVE_ASSOCIATE_DOMAIN:
        ConstructType = NotiRemoveAssociateDomainOrganization;
        break;
      case NotiOrg.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY:
        ConstructType = NotiAnyoneCanJoinEnableAutomaticallyOrganization;
        break;
      case NotiOrg.DELETE_MULTI_FOLDER:
        ConstructType = NotiFirebaseDeleteMultipleFoldersOrganization;
        break;
      default:
        throw Error('Initialize error');
    }
    return new ConstructType(notificationInitialize).derive();
  }
}
