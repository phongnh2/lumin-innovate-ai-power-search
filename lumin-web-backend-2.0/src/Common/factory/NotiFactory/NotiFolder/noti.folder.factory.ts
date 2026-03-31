/* eslint-disable import/extensions */
import { NotiFolder } from 'Common/constants/NotificationConstants';
import { NotiAbstractFactory } from 'Common/factory/NotiFactory/noti.abstract.factory';
import { NotiInterface } from 'Common/factory/NotiFactory/noti.interface';

import { NotiFolderBase } from './noti.base.folder';
import { NotiFolderInterface } from './noti.folder.interface';
import { NotiCreateOrganizationFolder } from './Product/noti.create-folder.organization';
import { NotiCreateTeamFolder } from './Product/noti.create-folder.team';
import { NotiDeleteFolderOrganization } from './Product/noti.delete-folder.organization';
import { NotiDeleteFolderTeam } from './Product/noti.delete-folder.team';

export class NotiFolderFactory extends NotiAbstractFactory {
  public create(type: number, notificationInterface: Partial<NotiFolderInterface>): NotiInterface {
    const notificationInitialize = {
      ...notificationInterface,
      actionType: type,
      notificationType: 'FolderNotification',
    } as NotiFolderInterface;

    let ConstructType: new (noti: NotiFolderInterface) => NotiFolderBase;

    switch (type) {
      // organization
      case NotiFolder.DELETE_ORG_FOLDER:
        ConstructType = NotiDeleteFolderOrganization;
        break;
      case NotiFolder.CREATE_ORG_FOLDER:
        ConstructType = NotiCreateOrganizationFolder;
        break;
      // organization team
      case NotiFolder.DELETE_TEAM_FOLDER:
        ConstructType = NotiDeleteFolderTeam;
        break;
      case NotiFolder.CREATE_TEAM_FOLDER:
        ConstructType = NotiCreateTeamFolder;
        break;
      default:
        throw Error('Initialize error');
    }

    return new ConstructType(notificationInitialize).derive();
  }
}
