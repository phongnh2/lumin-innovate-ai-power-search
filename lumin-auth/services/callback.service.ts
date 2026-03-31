import { LoggerScope } from '@/constants/common';
import { AfterLinkAccountCallback } from '@/interfaces/auth';
import { logger } from '@/lib/logger';
import { identityApi } from '@/lib/ory';

import { linkAccountService } from './linkAccount.service';

class CallbackService {
  async handleLinkAccountFlow(params: AfterLinkAccountCallback): Promise<{ success: boolean }> {
    const { identity, currentCredential, linkedCredential } = params;
    try {
      await linkAccountService.adaptNewCredential(params);
    } catch (error) {
      logger.error({
        err: error as unknown as Error,
        meta: {
          identityId: identity.id,
          currentProvider: currentCredential?.provider,
          linkedProvider: linkedCredential.provider
        },
        scope: LoggerScope.ERROR.LINK_ACCOUNT
      });
      await identityApi.deleteIdentityCredential(identity.id, linkedCredential);
      return { success: false };
    }

    return { success: true };
  }
}

export const callbackService = new CallbackService();
