import { NotiTeamInterface } from 'Common/factory/NotiFactory/NotiTeam/noti.team.interface';
import { NotiTarget, NotiEntity } from 'Common/factory/NotiFactory/noti.interface';
// eslint-disable-next-line import/extensions
import { NotiTeamBase } from './noti.base.team';

export class NotiDeleteMultiTeamDocument extends NotiTeamBase {
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

  createEntity(): NotiEntity {
    const { totalDocument, document } = this.notiTeam.entity;
    return {
      entityId: document._id,
      entityName: document.name,
      type: 'document',
      entityData: {
        totalDocument,
      },
    };
  }
}
