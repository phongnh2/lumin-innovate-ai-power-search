import { GetServerSidePropsContext } from 'next';

import { environment } from '@/configs/environment';
import { Routes } from '@/configs/routers';
import { QUERY_KEYS } from '@/constants/common';
import { ErrorCode } from '@/constants/errorCode';
import { SOCKET_EMIT } from '@/constants/socket';
import { OryLoginMethod, OryProvider } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';
import { BaseException } from '@/lib/exceptions/base.exception';
import grpc from '@/lib/grpc';
import { logger } from '@/lib/logger';
import { constructFlowCsrfToken, frontendApi } from '@/lib/ory';
import { createSocketClient } from '@/utils/socket.utils';
import ValidatorUtils from '@/utils/validator.utils';

const handleUpdateLoginFlowError = (e: any, params: { flowId: string; userId: string; userEmail: string; res: any }) => {
  const { flowId, userId, userEmail, res } = params;
  const error = e as BaseException;

  if (typeof (error as any).getResponseError !== 'function') {
    logger.error({
      message: 'Wrong format error during Kratos login flow update',
      err: e,
      meta: {
        flowId,
        userId,
        error: JSON.stringify(error)
      },
      scope: 'withKratosSignInFlow:notBaseException'
    });

    return {
      redirect: {
        destination: Routes.SignIn,
        statusCode: 302
      }
    };
  }

  const { code, meta } = error.getResponseError();

  if (code === ErrorCode.Auth.BROWSER_LOCATION_CHANGE_REQUIRED) {
    const cookies = meta?.set_cookie as unknown as string[];
    if (cookies) {
      res.setHeader('Set-Cookie', cookies);
    }

    const searchParams = new URLSearchParams({ login_hint: userEmail });
    const destination = meta?.redirect_browser_to ? `${meta.redirect_browser_to}&${searchParams.toString()}` : Routes.SignIn;

    return {
      redirect: {
        basePath: false,
        destination,
        statusCode: 302
      }
    };
  }

  logger.error({
    message: 'Unhandled error during Kratos login flow',
    err: e,
    meta: {
      flowId,
      userId,
      errorCode: code,
      error: JSON.stringify(e)
    },
    scope: 'withKratosSignInFlow:unhandledError'
  });

  return {
    redirect: {
      destination: Routes.SignIn,
      statusCode: 302
    }
  };
};

export const withSignInFlow = async (ctx: GetServerSidePropsContext) => {
  const { req, query, res } = ctx;

  const loginHint = <string>query[QUERY_KEYS.LOGIN_HINT];
  const redirectTo = <string>query[QUERY_KEYS.REDIRECT];
  const requestCookies = req.headers.cookie;

  if (!loginHint || !redirectTo) {
    return {
      props: {}
    };
  }
  if (!ValidatorUtils.validateWhitelistUrl(redirectTo)) {
    return {
      redirect: {
        destination: Routes.SignIn,
        statusCode: 302
      }
    };
  }

  try {
    const existingSession = await frontendApi.toSession({ cookie: requestCookies }).catch(() => null);
    if (existingSession?.data?.active) {
      return {
        redirect: {
          destination: redirectTo,
          statusCode: 302
        }
      };
    }

    const user = await grpc.auth.getUserById({ userId: loginHint }).catch(error => {
      logger.error({
        message: 'Failed to get user by ID',
        err: error,
        meta: { userId: loginHint },
        scope: 'withKratosSignInFlow:getUserById'
      });
      return null;
    });
    if (!user || user.loginService !== LoginService.GOOGLE) {
      return {
        redirect: {
          destination: `${Routes.SignIn}?return_to=${redirectTo}`,
          statusCode: 302
        }
      };
    }
    const socket = createSocketClient({ extraHeaders: { Cookie: ctx.req.headers.cookie || '' } });

    const gateWay = environment.public.host.authUrl + '/authentication/gateway';
    const searchParams = new URLSearchParams();
    searchParams.append('redirect_to', redirectTo);
    const loginFlow = await frontendApi
      .createLoginFlow({
        returnTo: gateWay + '?' + searchParams.toString() || ''
      })
      .catch(error => {
        logger.error({
          message: 'Failed to create Kratos login flow',
          err: error,
          meta: { returnTo: redirectTo },
          scope: 'withKratosSignInFlow:createFlow'
        });
        throw error;
      });

    try {
      await frontendApi.updateLoginFlow({
        flowId: loginFlow.data.id,
        body: {
          csrf_token: constructFlowCsrfToken(loginFlow.data),
          method: OryLoginMethod.Oidc,
          provider: OryProvider.Google,
          traits: {
            loginService: LoginService.GOOGLE,
            email: user.email
          }
        }
      });
      socket.emit(SOCKET_EMIT.User.SignIn);

      return {
        redirect: {
          destination: Routes.SignIn,
          statusCode: 302
        }
      };
    } catch (e: any) {
      const result = handleUpdateLoginFlowError(e, {
        flowId: loginFlow.data.id,
        userId: loginHint,
        userEmail: user.email,
        res
      });
      socket.emit(SOCKET_EMIT.User.SignIn);
      socket.close();

      return result;
    }
  } catch (error) {
    logger.error({
      message: 'Unexpected error in Kratos sign-in flow',
      err: error instanceof Error ? error : new Error(String(error)),
      meta: { userId: loginHint, redirectTo },
      scope: 'withKratosSignInFlow:unexpectedError'
    });

    return {
      props: {}
    };
  }
};
