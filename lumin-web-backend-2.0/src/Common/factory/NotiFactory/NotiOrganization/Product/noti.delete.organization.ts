import { NotiOrganizationInterface } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.interface';
import { NotiTarget, NotiActor } from 'Common/factory/NotiFactory/noti.interface';
// eslint-disable-next-line import/extensions
import { NotiOrganizationBase } from './noti.base.organization';

export class NotiDeleteOrganization extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createActor(): NotiActor {
    return null;
  }

  createTarget(): NotiTarget {
    return null;
  }
}
