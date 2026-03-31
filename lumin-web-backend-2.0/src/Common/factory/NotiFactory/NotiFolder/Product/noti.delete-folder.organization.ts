/* eslint-disable import/extensions */
import { NotiTarget } from 'Common/factory/NotiFactory/noti.interface';
import { NotiFolderBase } from '../noti.base.folder';
import { NotiFolderInterface } from '../noti.folder.interface';

export class NotiDeleteFolderOrganization extends NotiFolderBase {
  constructor(protected readonly notiFolder: NotiFolderInterface) {
    super(notiFolder);
  }

  createTarget(): NotiTarget {
    const { organization: targetOrganization } = this.notiFolder.target;
    return {
      targetId: targetOrganization._id,
      targetName: targetOrganization.name,
      targetData: {
        orgUrl: targetOrganization.url,
      },
      type: 'organization',
    };
  }
}
