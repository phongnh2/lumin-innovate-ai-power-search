import { IEntityFirebaseNotificationData } from 'Notication/interfaces/notification.interface';

import { NotiFirebaseFolderBase } from './noti.firebase.base.folder';
import { NotiFirebaseFolderInterface } from '../noti.firebase.folder.interface';

export class NotiFirebaseCreateOrganizationFolder extends NotiFirebaseFolderBase {
  constructor(
    protected readonly notiFirebaseFolder: NotiFirebaseFolderInterface,
  ) {
    super(notiFirebaseFolder);
  }

  createEntity(): IEntityFirebaseNotificationData {
    const { organization } = this.notiFirebaseFolder;
    return {
      orgUrl: organization.url,
    };
  }

  createContent(): string {
    const { actor, folder, organization } = this.notiFirebaseFolder;

    return `${actor.name} created ${folder.name} folder in All ${organization.name}`;
  }
}
