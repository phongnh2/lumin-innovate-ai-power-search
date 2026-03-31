import { NotiTeamInterface } from 'Common/factory/NotiFactory/NotiTeam/noti.team.interface';
import { NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
// eslint-disable-next-line import/extensions
import { NotiTeamBase } from './noti.base.team';

export class NotiDeleteDocumentTeam extends NotiTeamBase {
  constructor(protected readonly notiTeam: NotiTeamInterface) {
    super(notiTeam);
  }

  createTarget(): NotiTarget {
    const { team: targetTeam } = this.notiTeam.target;
    return {
      targetId: targetTeam._id,
      targetName: targetTeam.name,
      type: 'team',
    };
  }
}
