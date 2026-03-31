import { TEAM_TEXT } from 'Common/constants/TeamConstant';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseTeamBase } from './noti.firebase.base.team';
import { NotiFirebaseTeamInterface } from '../noti.firebase.team.interface';

export class NotiFirebaseDeleteMultiDocumentTeam extends NotiFirebaseTeamBase {
  constructor(protected readonly notiFirebaseTeam: NotiFirebaseTeamInterface) {
    super(notiFirebaseTeam);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { team, organization } = this.notiFirebaseTeam;
    return {
      teamId: team._id,
      orgUrl: organization.url,
    };
  }

  createContent(): string {
    const {
      team, totalDocuments, actor,
    } = this.notiFirebaseTeam;
    return `${actor.name} deleted ${totalDocuments} documents from ${
      team.name
    }'s ${TEAM_TEXT}`;
  }

  createContentForTargetUser(): string {
    return null;
  }
}
