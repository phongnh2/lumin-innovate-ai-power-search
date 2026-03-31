import { omit } from 'lodash';
import { GetServerSidePropsContext } from 'next';

import { environment } from '@/configs/environment';
import { Routes } from '@/configs/routers';
import { LoggerScope } from '@/constants/common';
import { InvitationTokenStatus } from '@/interfaces/auth';
import grpc from '@/lib/grpc';
import { logger } from '@/lib/logger';
import { frontendApi } from '@/lib/ory';

export const withInvitation = async (context: GetServerSidePropsContext) => {
  const { token } = context.query;

  const goToAuthPage = (path: string) => ({
    redirect: {
      destination: path,
      permanent: false
    }
  });
  if (!token || typeof token !== 'string') {
    return goToAuthPage(Routes.SignUp);
  }
  try {
    const tokenResult = await grpc.kratos.verifyUserInvitationToken({
      token
    });
    const loggerMetadata = omit(tokenResult, ['data.email']);
    logger.info({ message: 'Invitation token', meta: loggerMetadata });
    if (!tokenResult || tokenResult.status === InvitationTokenStatus.INVALID) {
      return goToAuthPage(Routes.SignUp);
    }
    const { error, data, isSignedUp, status } = tokenResult;
    const { email, type, metadata } = data || {};
    const { user } = metadata || {};

    const appReturnToUrl = `${environment.public.host.appUrl}/?token=${token}`;
    const componentProps = {
      email,
      type,
      status,
      isSignedUp,
      metadata,
      error,
      token
    };

    switch (status) {
      case InvitationTokenStatus.INVALID: {
        return goToAuthPage(Routes.SignUp);
      }
      case InvitationTokenStatus.EXPIRED: {
        return { props: componentProps };
      }
      case InvitationTokenStatus.REMOVED:
      case InvitationTokenStatus.VALID: {
        const session = await frontendApi.toSession({ cookie: context.req.headers.cookie }).catch(() => null);
        if (session) {
          return {
            redirect: {
              permanent: false,
              destination: appReturnToUrl
            }
          };
        }
        if (isSignedUp && !user?.isVerified) {
          const params = new URLSearchParams({ return_to: appReturnToUrl, email: email as string });
          return goToAuthPage(`${Routes.SignIn}?${params.toString()}`);
        }
        if (user?.isVerified) {
          const params = new URLSearchParams({ return_to: appReturnToUrl, email: email as string });
          return goToAuthPage(`${Routes.SignIn}?${params.toString()}`);
        }
        return { props: componentProps };
      }
      default:
        return goToAuthPage(Routes.SignUp);
    }
  } catch (e) {
    logger.error({ err: e as any, scope: LoggerScope.ERROR.UNKNOWN_ERROR });
    return goToAuthPage(Routes.SignUp);
  }
};
