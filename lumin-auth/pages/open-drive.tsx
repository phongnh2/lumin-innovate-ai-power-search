import { useRouter } from 'next/router';
import { useEffect } from 'react';

import RedirectPage from '@/components/RedirectPage';
import { CookieStorageKey } from '@/constants/cookieKey';
import { ErrorCode } from '@/constants/errorCode';
import { OryLoginMethod, OryProvider, SelfServiceFlow } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';
import { BaseException } from '@/lib/exceptions/base.exception';
import { constructFlowCsrfToken, frontendApi } from '@/lib/ory';
import CookieUtils from '@/utils/cookie.utils';

type TGetFlow = [SelfServiceFlow | null, Error | null];

const OpenDrive = () => {
  const router = useRouter();
  const { query } = router;
  const flowId = query.flow as string;

  const signUpWithGoogle = async () => {
    const loginHint = CookieUtils.get(CookieStorageKey.LOGIN_HINT);
    const googleLoginHint = CookieUtils.get(CookieStorageKey.GOOGLE_LOGIN_HINT);
    const hintEmail = googleLoginHint || loginHint;
    const [regFlow, flowError] = await frontendApi
      .getRegistrationFlow({
        flowId
      })
      .then<TGetFlow>(flowRes => [flowRes.data, null])
      .catch<TGetFlow>(e => [null, e]);
    if (flowError || !regFlow || !regFlow.return_to) {
      router.push('/sign-in');
      return;
    }
    const postAuthUrl = new URL(regFlow.return_to);
    const postUrlQueryParam = new URLSearchParams(postAuthUrl.search);
    const redirectTo = postUrlQueryParam.get('redirect_to');
    const isInOpenGoogleFlow = redirectTo?.includes('/open/google/post-auth');
    const isOnedriveFlow = redirectTo?.includes('/open/onedrive/import-document');
    if (!isInOpenGoogleFlow && !isOnedriveFlow) {
      router.push('/sign-in');
      return;
    }

    try {
      await frontendApi.updateRegistrationFlow({
        flowId: regFlow.id,
        body: {
          csrf_token: constructFlowCsrfToken(regFlow),
          method: OryLoginMethod.Oidc,
          provider: isInOpenGoogleFlow ? OryProvider.Google : OryProvider.Microsoft,
          traits: {
            loginService: isInOpenGoogleFlow ? LoginService.GOOGLE : LoginService.MICROSOFT
          }
        }
      });
    } catch (e) {
      const error = e as BaseException;
      const { code, meta } = error.getResponseError();
      if (code !== ErrorCode.Auth.BROWSER_LOCATION_CHANGE_REQUIRED) {
        window.location.href = '/sign-in';
        return;
      }
      window.location.href = `${meta?.redirect_browser_to}&login_hint=${hintEmail}` as string;
    }
  };

  useEffect(() => {
    if (flowId) {
      signUpWithGoogle();
    }
  }, [flowId]);

  return <RedirectPage />;
};

export default OpenDrive;
