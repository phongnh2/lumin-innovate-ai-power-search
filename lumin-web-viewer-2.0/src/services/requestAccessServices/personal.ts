/* eslint-disable class-methods-use-this */
import { RequestAccessService } from './base';

class PersonalRequestAccessService extends RequestAccessService {
  acceptAll(): void {}

  rejectAll(): void {}
}

export default new PersonalRequestAccessService();
