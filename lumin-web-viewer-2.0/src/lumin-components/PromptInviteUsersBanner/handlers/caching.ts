import { PromptInviteUsersBannerResponse } from 'services/types/documentServices.types';

import { Nullable } from 'interfaces/common';

class CachingHandlers {
  private readonly cachedDataByOrg = new Map<string, PromptInviteUsersBannerResponse>();

  get(orgId: string): Nullable<PromptInviteUsersBannerResponse> {
    return this.cachedDataByOrg.get(orgId);
  }

  set(orgId: string, data: PromptInviteUsersBannerResponse): void {
    this.cachedDataByOrg.set(orgId, data);
  }

  remove(orgId: string): void {
    this.cachedDataByOrg.delete(orgId);
  }
}

export default new CachingHandlers();
