import { useEffect } from 'react';

import { CUSTOM_EVENT } from 'constants/customEvent';

import type { UsePromptInviteUsersBannerHandlerData } from './usePromptInviteUsersHandler';

type UseTrackUserReAuthorizeProps = Pick<
  UsePromptInviteUsersBannerHandlerData,
  'canShowBanner' | 'getCurrentOrgId' | 'getPromptGoogleUsersHandler'
>;

const useTrackUserReAuthorize = ({
  canShowBanner,
  getCurrentOrgId,
  getPromptGoogleUsersHandler,
}: UseTrackUserReAuthorizeProps): void => {
  // When user re-authorize
  useEffect(() => {
    const reAuthorizeUserEvent = async (): Promise<void> => {
      const orgId = getCurrentOrgId();
      await getPromptGoogleUsersHandler({
        orgId,
        forceUpdate: true,
      });
    };

    if (canShowBanner) {
      window.addEventListener(CUSTOM_EVENT.SHOW_PROMPT_INVITE_USERS_BANNER, reAuthorizeUserEvent);
    }

    return () => {
      window.removeEventListener(CUSTOM_EVENT.SHOW_PROMPT_INVITE_USERS_BANNER, reAuthorizeUserEvent);
    };
  }, [canShowBanner]);
};

export default useTrackUserReAuthorize;
