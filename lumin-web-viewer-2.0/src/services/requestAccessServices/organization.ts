/* eslint-disable class-methods-use-this */
import { RequestAccessService } from './base';

class OrganizationRequestAccessService extends RequestAccessService {
  acceptAll(): void {}

  rejectAll(): void {}
}

export default new OrganizationRequestAccessService();
