import { AuthenticationResult } from '@azure/msal-browser';
import { SettingsFlow } from '@ory/client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { ElementName, QUERY_KEYS } from '@/constants/common';
import { LocalStorageKey } from '@/constants/localStorageKey';
import { LoggerReason } from '@/constants/logger';
import { useConfirmLinkAccountMutation, useEnsureSettingsFlowMutation, useLinkAccountMutation } from '@/features/account/settings-api-slice';
import { closeElement, openElement } from '@/features/visibility-slice';
import { clientLogger } from '@/lib/logger';
import sessionManagement from '@/lib/session';
import { getErrorMessage } from '@/utils/error.utils';

import { SOCIAL_SIGN_IN_PROVIDER_TO_ORY_PROVIDER, SocialSignInProvider, SocialSignInStatus } from '../constant';
import { microsoftClient } from '../MicrosoftClient';

import { usePromptSelectSocialAccount } from './usePromptSelectSocialAccount';

interface EnableSocialSignInProps {
  email: string;
  provider: SocialSignInProvider;
}

export const useEnableSocialSignIn = ({ email, provider }: EnableSocialSignInProps) => {
  const [status, setStatus] = useState<SocialSignInStatus>(SocialSignInStatus.INITIAL);
  const [error, setError] = useState<unknown>(null);
  const [ensureFlow, { data: flow }] = useEnsureSettingsFlowMutation();
  const [linkAccount] = useLinkAccountMutation();
  const dispatch = useDispatch();
  const [confirmLinkAccount] = useConfirmLinkAccountMutation();
  const { promptSelectSocialAccount } = usePromptSelectSocialAccount({ hintEmail: email, provider });

  const router = useRouter();
  const { social_sign_in_enabled: enabledSuccess } = router.query;

  const submitLinkAccountFlowHandler = async () => {
    setStatus(SocialSignInStatus.LINKING_ACCOUNT);
    try {
      dispatch(openElement(ElementName.LUMIN_LOADING));
      const afterLinkAccountUrl = window.location.href + (window.location.search ? '&' : '?') + `${QUERY_KEYS.SOCIAL_SIGN_IN_ENABLED}=true`;
      const newFlow = await ensureFlow({ initial: flow, returnTo: afterLinkAccountUrl }).unwrap();
      await linkAccount({
        flow: newFlow as SettingsFlow,
        provider: SOCIAL_SIGN_IN_PROVIDER_TO_ORY_PROVIDER[provider],
        loginHint: email
      }).unwrap();
    } catch (linkAccountErr) {
      clientLogger.error({
        message: getErrorMessage(linkAccountErr),
        reason: LoggerReason.LINK_ACCOUNT,
        attributes: { provider }
      });
      dispatch(closeElement(ElementName.LUMIN_LOADING));
      setStatus(SocialSignInStatus.FAILED);
      setError(linkAccountErr);
    }
  };

  const handleSubmitLinkAccountFlow = async (selectedEmail: string) => {
    if (!selectedEmail) {
      setStatus(SocialSignInStatus.CANCELLED);
      return;
    }
    if (selectedEmail.toLowerCase() !== email) {
      setStatus(SocialSignInStatus.WRONG_ACCOUNT_SELECTED);
      return;
    }
    await submitLinkAccountFlowHandler();
  };

  const promptEnableSocialSignIn = async () => {
    setStatus(SocialSignInStatus.PROMPT_SELECT_ACCOUNT);
    const selectedEmail = await promptSelectSocialAccount();
    if (provider !== SocialSignInProvider.MICROSOFT) {
      await handleSubmitLinkAccountFlow(selectedEmail);
    }
  };

  useEffect(() => {
    if (provider === SocialSignInProvider.MICROSOFT) {
      microsoftClient.onRedirect(results => {
        if (!results) {
          return;
        }
        const { account } = results as AuthenticationResult;
        const responseEmail = (account.idTokenClaims?.email || account.username) as string;
        handleSubmitLinkAccountFlow(responseEmail);
      });
    }
  }, [provider]);

  useEffect(() => {
    if (enabledSuccess) {
      setStatus(SocialSignInStatus.SUCCESS);
      // Set flag to prevent session expired modal from showing on current tab
      localStorage.setItem(LocalStorageKey.LOGIN_METHOD_CHANGE_PENDING, 'true');
      confirmLinkAccount();
      // To get the new session with updated login service
      sessionManagement.forceResetSession();
    }
  }, [enabledSuccess]);

  return { status, promptEnableSocialSignIn, error };
};
