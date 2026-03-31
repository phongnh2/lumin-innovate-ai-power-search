/* eslint-disable import/extensions */
import { NotiTeam } from 'Common/constants/NotificationConstants';
import { NotiAbstractFactory } from 'Common/factory/NotiFactory/noti.abstract.factory';
import { NotiInterface } from 'Common/factory/NotiFactory/noti.interface';
import { NotiDeleteMultiTeamDocument } from './Product/noti.delete-multi-team-document';
import { NotiTeamInterface } from './noti.team.interface';
import { NotiTeamBase } from './Product/noti.base.team';
import { NotiDeleteDocumentTeam } from './Product/noti.delete-document.team';

export class NotiTeamFactory extends NotiAbstractFactory {
  public create(type: number, notificationInterface: Partial<NotiTeamInterface>): NotiInterface {
    const notificationInitialize = {
      ...notificationInterface,
      actionType: type,
      notificationType: 'TeamNotification',
    } as NotiTeamInterface;

    let ConstructType: new (noti: NotiTeamInterface) => NotiTeamBase;

    switch (type) {
      case NotiTeam.DELETE_DOCUMENT_TEAM:
        ConstructType = NotiDeleteDocumentTeam;
        break;
      case NotiTeam.DELETE_MULTI_DOCUMENT:
        ConstructType = NotiDeleteMultiTeamDocument;
        break;
      default:
        throw Error('Initialize error');
    }

    return new ConstructType(notificationInitialize).derive();
  }
}
