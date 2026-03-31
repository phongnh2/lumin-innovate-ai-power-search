import {
  NotiOrgTeam,
  NotificationType,
} from 'Common/constants/NotificationConstants';

import { NotiFirebaseTeamInterface } from './noti.firebase.team.interface';
import { NotiFirebaseAddMemberDocumentTeam } from './Product/noti.firebase.add-member.team';
import { NotiFirebaseTeamBase } from './Product/noti.firebase.base.team';
import { NotiFirebaseDeleteDocumentTeam } from './Product/noti.firebase.delete-document.team';
import { NotiFirebaseDeleteMultiDocumentTeam } from './Product/noti.firebase.delete-multi-document.team';
import { NotiFirebaseDeleteMultipleFoldersTeam } from './Product/noti.firebase.delete-multiple-folders.team';
import { NotiFirebaseDeleteTemplateTeam } from './Product/noti.firebase.delete-template.team';
import { NotiFirebaseDeleteTeam } from './Product/noti.firebase.delete.team';
import { NotiFirebaseLeaveTeam } from './Product/noti.firebase.leave.team';
import { NotiFirebaseRemoveMemberDocumentTeam } from './Product/noti.firebase.remove-member.team';
import { NotiFirebaseTransferOwnerTeam } from './Product/noti.firebase.transfer-owner.team';
import { NotiFirebaseUploadTemplateTeam } from './Product/noti.firebase.upload-template.team';
import { NotiFirebaseAbstractFactory } from '../noti.firebase.abstract.factory';
import { NotiFirebaseInterface } from '../noti.firebase.interface';

export class NotiFirebaseTeamFactory extends NotiFirebaseAbstractFactory {
  public create(
    type: number,
    notificationFirebase: Partial<NotiFirebaseTeamInterface>,
  ): NotiFirebaseInterface {
    const notificationInitialize = {
      ...notificationFirebase,
      notificationData: {
        actionType: type.toString(),
        notificationType: NotificationType.TEAM,
      },
      notificationContentForTargetUser: {
        title: 'Lumin PDF',
      },
      notificationContent: {
        title: 'Lumin PDF',
      },
    } as NotiFirebaseTeamInterface;

    let ConstructType: new (
      noti: NotiFirebaseInterface,
    ) => NotiFirebaseTeamBase;

    switch (type) {
      case NotiOrgTeam.DELETE_DOCUMENT:
        ConstructType = NotiFirebaseDeleteDocumentTeam;
        break;
      case NotiOrgTeam.DELETE_MULTI_DOCUMENT:
        ConstructType = NotiFirebaseDeleteMultiDocumentTeam;
        break;
      case NotiOrgTeam.ADD_MEMBER:
        ConstructType = NotiFirebaseAddMemberDocumentTeam;
        break;
      case NotiOrgTeam.REMOVE_MEMBER:
        ConstructType = NotiFirebaseRemoveMemberDocumentTeam;
        break;
      case NotiOrgTeam.LEAVE_ORG_TEAM:
        ConstructType = NotiFirebaseLeaveTeam;
        break;
      case NotiOrgTeam.DELETE_TEAM:
        ConstructType = NotiFirebaseDeleteTeam;
        break;
      case NotiOrgTeam.TRANSFER_OWNER:
        ConstructType = NotiFirebaseTransferOwnerTeam;
        break;
      case NotiOrgTeam.DELETE_TEAM_TEMPLATE:
        ConstructType = NotiFirebaseDeleteTemplateTeam;
        break;
      case NotiOrgTeam.UPLOAD_TEMPLATE:
        ConstructType = NotiFirebaseUploadTemplateTeam;
        break;
      case NotiOrgTeam.DELETE_MULTI_FOLDER:
        ConstructType = NotiFirebaseDeleteMultipleFoldersTeam;
        break;
      default:
        throw Error('Initialize error');
    }
    return new ConstructType(notificationInitialize).derive();
  }
}
