import {
  NotiFolder,
  NotificationType,
} from 'Common/constants/NotificationConstants';

import { NotiFirebaseFolderInterface } from './noti.firebase.folder.interface';
import { NotiFirebaseFolderBase } from './Product/noti.firebase.base.folder';
import { NotiFirebaseCreateOrganizationFolder } from './Product/noti.firebase.create-folder.organization';
import { NotiFirebaseCreateTeamFolder } from './Product/noti.firebase.create-folder.team';
import { NotiFirebaseDeleteOrganizationFolder } from './Product/noti.firebase.delete-folder.organization';
import { NotiFirebaseDeleteTeamFolder } from './Product/noti.firebase.delete-folder.team';
import { NotiFirebaseAbstractFactory } from '../noti.firebase.abstract.factory';
import { NotiFirebaseInterface } from '../noti.firebase.interface';

export class NotiFirebaseFolderFactory extends NotiFirebaseAbstractFactory {
  public create(
    type: number,
    notificationFirebase: Partial<NotiFirebaseFolderInterface>,
  ): NotiFirebaseInterface {
    const notificationInitialize = {
      ...notificationFirebase,
      notificationData: {
        actionType: type.toString(),
        notificationType: NotificationType.FOLDER,
      },
      notificationContent: {
        title: 'Lumin PDF',
      },
    } as NotiFirebaseFolderInterface;

    let ConstructType: new (
      noti: NotiFirebaseInterface,
    ) => NotiFirebaseFolderBase;

    switch (type) {
      case NotiFolder.DELETE_ORG_FOLDER:
        ConstructType = NotiFirebaseDeleteOrganizationFolder;
        break;
      case NotiFolder.CREATE_ORG_FOLDER:
        ConstructType = NotiFirebaseCreateOrganizationFolder;
        break;
      case NotiFolder.DELETE_TEAM_FOLDER:
        ConstructType = NotiFirebaseDeleteTeamFolder;
        break;
      case NotiFolder.CREATE_TEAM_FOLDER:
        ConstructType = NotiFirebaseCreateTeamFolder;
        break;
      default:
        throw Error('Initialize error');
    }

    return new ConstructType(notificationInitialize).derive();
  }
}
