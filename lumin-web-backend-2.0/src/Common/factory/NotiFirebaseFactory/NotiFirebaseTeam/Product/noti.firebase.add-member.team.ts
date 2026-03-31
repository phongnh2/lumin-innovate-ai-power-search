import { TEAM_TEXT } from 'Common/constants/TeamConstant';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseTeamBase } from './noti.firebase.base.team';
import { NotiFirebaseTeamInterface } from '../noti.firebase.team.interface';

export class NotiFirebaseAddMemberDocumentTeam extends NotiFirebaseTeamBase {
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
      team, actor, targetUser,
    } = this.notiFirebaseTeam;
    return `${actor.name} added ${targetUser.name} to ${team.name}'s ${TEAM_TEXT}`;
  }

  createContentForTargetUser(): string {
    const { team, actor } = this.notiFirebaseTeam;
    return `${actor.name} added you to ${team.name}'s ${TEAM_TEXT}`;
  }
}
