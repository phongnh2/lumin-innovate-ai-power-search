/* eslint-disable import/extensions */
import { NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
import { NotiFolderInterface } from '../noti.folder.interface';
import { NotiFolderBase } from '../noti.base.folder';

export class NotiCreateTeamFolder extends NotiFolderBase {
  constructor(protected readonly notiTeam: NotiFolderInterface) {
    super(notiTeam);
  }

  createTarget(): NotiTarget {
    const { organization: targetOrg, team: targetTeam } = this.notiTeam.target;
    return {
      targetId: targetTeam._id,
      targetName: targetTeam.name,
      targetData: {
        orgId: targetOrg._id,
        orgName: targetOrg.name,
        orgUrl: targetOrg.url,
      },
      type: 'team',
    };
  }
}
