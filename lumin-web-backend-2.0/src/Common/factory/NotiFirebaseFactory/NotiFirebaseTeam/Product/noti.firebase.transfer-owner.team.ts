import { CommonConstants } from 'Common/constants/CommonConstants';
import { TEAM_TEXT } from 'Common/constants/TeamConstant';

import { APP_USER_TYPE } from 'Auth/auth.enum';
import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseTeamBase } from './noti.firebase.base.team';
import { NotiFirebaseTeamInterface } from '../noti.firebase.team.interface';

export class NotiFirebaseTransferOwnerTeam extends NotiFirebaseTeamBase {
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
      team, targetUser, actor, actorType,
    } = this.notiFirebaseTeam;
    return `${
      actorType === APP_USER_TYPE.SALE_ADMIN
        ? CommonConstants.LUMIN_ADMIN
        : actor.name
    } transferred the ownership of ${team.name}'s ${TEAM_TEXT} to ${targetUser.name}`;
  }

  createContentForTargetUser(): string {
    const {
      team, actor, actorType,
    } = this.notiFirebaseTeam;
    return `${
      actorType === APP_USER_TYPE.SALE_ADMIN
        ? CommonConstants.LUMIN_ADMIN
        : actor.name
    } transferred the ownership of ${team.name}'s ${TEAM_TEXT} to you`;
  }
}
