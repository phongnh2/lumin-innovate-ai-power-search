import { TEAM_TEXT } from 'Common/constants/TeamConstant';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseFolderBase } from './noti.firebase.base.folder';
import { NotiFirebaseFolderInterface } from '../noti.firebase.folder.interface';

export class NotiFirebaseDeleteTeamFolder extends NotiFirebaseFolderBase {
  constructor(
    protected readonly notiFirebaseFolder: NotiFirebaseFolderInterface,
  ) {
    super(notiFirebaseFolder);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { organization, team } = this.notiFirebaseFolder;
    return {
      orgUrl: organization.url,
      teamId: team._id,
    };
  }

  createContent(): string {
    const {
      actor, folder, team,
    } = this.notiFirebaseFolder;

    return `${actor.name} deleted ${folder.name} folder from ${
      team.name
    }'s ${TEAM_TEXT}`;
  }
}
