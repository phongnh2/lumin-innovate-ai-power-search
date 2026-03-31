import { ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';
import { TEAM_TEXT } from 'Common/constants/TeamConstant';

import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseTeamBase } from './noti.firebase.base.team';
import { NotiFirebaseTeamInterface } from '../noti.firebase.team.interface';

export class NotiFirebaseUploadTemplateTeam extends NotiFirebaseTeamBase {
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
      team, actor, organization, template,
    } = this.notiFirebaseTeam;
    return `${actor.name} added ${template.name} to ${team.name}'s ${TEAM_TEXT} (in ${
      organization.name
    }'s ${ORGANIZATION_TEXT})`;
  }

  createContentForTargetUser(): string {
    return null;
  }
}
