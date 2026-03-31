/* eslint-disable class-methods-use-this */
import { RequestAccessService } from './base';

class TeamRequestAccessService extends RequestAccessService {
  acceptAll(): void {}

  rejectAll(): void {}
}

export default new TeamRequestAccessService();
