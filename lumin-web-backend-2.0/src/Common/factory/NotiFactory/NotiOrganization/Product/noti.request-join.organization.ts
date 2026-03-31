import { NotiTarget } from 'Common/factory/NotiFactory/noti.interface';

import { NotiOrganizationInterface } from '../noti.organization.interface';
import { NotiOrganizationBase } from './noti.base.organization';

export class NotiRequestJoinOrganization extends NotiOrganizationBase {
  constructor(protected readonly notiOrganization: NotiOrganizationInterface) {
    super(notiOrganization);
  }

  createTarget(): NotiTarget {
    return null;
  }
}
