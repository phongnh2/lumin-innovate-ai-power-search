/* eslint-disable sonarjs/no-small-switch */
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { environment } from '@/configs/environment';
import { CookieStorageKey } from '@/constants/cookieKey';
import { ErrorCode } from '@/constants/errorCode';
import { OryLoginMethod, OryProvider, SelfServiceFlow } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';
import { BaseException } from '@/lib/exceptions/base.exception';
import { logger } from '@/lib/logger';
import { constructFlowCsrfToken, frontendApi } from '@/lib/ory';

type TGetFlow = [SelfServiceFlow | null, Error | null];

const removeCookies = (res: any) => {
  const domain = environment.isDevelopment ? 'localhost' : '.luminpdf.com';
  res.setHeader('Set-Cookie', [
    `${CookieStorageKey.IN_FLOW}=empty; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-age=0; SameSite=Strict; Secure`,
    `${CookieStorageKey.LOGIN_HINT}=empty; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-age=0; SameSite=Lax; Secure`,
    `${CookieStorageKey.GOOGLE_LOGIN_HINT}=empty; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-age=0; SameSite=Lax; Secure`,
    `${CookieStorageKey.GOOGLE_ACCESS_TOKEN}=empty; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-age=0`
  ]);
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const withOpenFileFlowRegistration = async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Record<string, never>>> => {
  const { req, query, res } = ctx;

  const flowId = <string>query.flow;
  const requestCookies = req.headers.cookie;
  const loginHint = req.cookies[CookieStorageKey.LOGIN_HINT];
  const googleLoginHint = req.cookies[CookieStorageKey.GOOGLE_LOGIN_HINT];
  const hintEmail = googleLoginHint || loginHint;

  if (!flowId || !hintEmail) {
    return { props: {} };
  }
  const [regFlow, flowError] = await frontendApi
    .getRegistrationFlow({
      flowId,
      cookie: requestCookies
    })
    .then<TGetFlow>(flowRes => [flowRes.data, null])
    .catch<TGetFlow>(e => [null, e]);
  if ((flowError as any)?.code === 429) {
    logger.error({
      message: 'Too many requests',
      err: flowError as Error,
      meta: {
        flowId
      },
      scope: 'withOpenFileFlowRegistration:getRegistrationFlow'
    });
    return {
      redirect: {
        destination: `/open-drive?flow=${flowId}`,
        statusCode: 303
      }
    };
  }
  const error_code = (regFlow?.ui?.messages?.[0]?.context as any)?.code;
  if (flowError || !regFlow || !regFlow.return_to || error_code) {
    removeCookies(res);
    return { props: {} };
  }
  try {
    const postAuthUrl = new URL(regFlow.return_to);
    const postUrlQueryParam = new URLSearchParams(postAuthUrl.search);
    const redirectTo = postUrlQueryParam.get('redirect_to');
    const isGoogleFlow = redirectTo?.includes('/open/google/post-auth');
    const isOnedriveFlow = redirectTo?.includes('/open/onedrive/import-document');

    if (!isOnedriveFlow && !isGoogleFlow) {
      return { props: {} };
    }
    let provider = '';
    let loginService = '';
    switch (true) {
      case redirectTo?.includes('/open/google/post-auth'):
        provider = OryProvider.Google;
        loginService = LoginService.GOOGLE;
        break;
      case redirectTo?.includes('/open/onedrive/import-document'):
        provider = OryProvider.Microsoft;
        loginService = LoginService.MICROSOFT;
        break;
      default:
        break;
    }
    await frontendApi.updateRegistrationFlow({
      flowId: regFlow.id,
      body: {
        csrf_token: constructFlowCsrfToken(regFlow),
        method: OryLoginMethod.Oidc,
        provider,
        traits: {
          loginService
        }
      }
    });
  } catch (e: any) {
    const error = e as BaseException;
    if (typeof error.getResponseError !== 'function') {
      logger.error({
        message: 'Wrong format error during update registration flow',
        err: e,
        meta: {
          flowId,
          error: JSON.stringify(error)
        },
        scope: 'withOpenFileFlowRegistration:notBaseException'
      });
    }
    const { code, meta } = error.getResponseError();
    if (code !== ErrorCode.Auth.BROWSER_LOCATION_CHANGE_REQUIRED) {
      if (code === 429) {
        logger.error({
          message: 'Too many requests',
          err: e,
          meta: {
            flowId
          },
          scope: 'withOpenFileFlowRegistration:updateRegistrationFlow'
        });
        return {
          redirect: {
            destination: `/open-drive?flow=${flowId}`,
            statusCode: 303
          }
        };
      }
      logger.error({
        message: 'Error during update registration flow',
        err: e,
        meta: {
          flowId,
          error: JSON.stringify(error)
        },
        scope: 'withOpenFileFlowRegistration:unhandleError'
      });
      return { props: {} };
    }
    const cookies = meta?.set_cookie as unknown as string[];
    res.setHeader('Set-Cookie', cookies);
    return {
      redirect: {
        basePath: false,
        destination: `${meta?.redirect_browser_to}&login_hint=${hintEmail}`,
        statusCode: 302
      }
    };
  }
  return { props: {} };
};
