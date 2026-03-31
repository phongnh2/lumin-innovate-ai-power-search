import { TEAM_TEXT } from 'Common/constants/TeamConstant';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseTeamBase } from './noti.firebase.base.team';
import { NotiFirebaseTeamInterface } from '../noti.firebase.team.interface';

export class NotiFirebaseRemoveMemberDocumentTeam extends NotiFirebaseTeamBase {
  constructor(protected readonly notiFirebaseTeam: NotiFirebaseTeamInterface) {
    super(notiFirebaseTeam);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { team, organization, targetUser } = this.notiFirebaseTeam;
    return {
      teamId: team._id,
      orgUrl: organization.url,
      targetId: targetUser._id,
    };
  }

  createContent(): string {
    const {
      team, actor, targetUser,
    } = this.notiFirebaseTeam;
    return `${actor.name} removed ${targetUser.name} from ${
      team.name
    }'s ${TEAM_TEXT}`;
  }

  createContentForTargetUser(): string {
    const { team, actor } = this.notiFirebaseTeam;
    return `${actor.name} removed you from ${team.name}'s ${TEAM_TEXT}`;
  }
}
