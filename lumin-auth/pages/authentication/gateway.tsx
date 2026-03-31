import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { withRememberLastAccessAccount } from '@/components/hoc/withRememberLastAccessAccount';
import LoadingLogo from '@/components/LoadingLogo/LoadingLogo';
import { environment } from '@/configs/environment';
import { LUMIN_SESSION } from '@/constants/sessionKey';
import { useUpdateUserIdentityIdMutation } from '@/features/account/account-api-slice';
import { clientLogger } from '@/lib/logger';
import { frontendApi } from '@/lib/ory';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';
import CookieUtils from '@/utils/cookie.utils';
import ValidatorUtils from '@/utils/validator.utils';

function AuthenticationGateway({ redirectUrl }: { redirectUrl: string }) {
  const router = useRouter();
  const [updateUserIdentityId] = useUpdateUserIdentityIdMutation();
  const sessionName = environment.public.common.orySessionName;

  const handleRedirect = () => {
    router.push(redirectUrl);
  };

  const getAuthentication = async () => {
    try {
      const { tokenized } = await frontendApi.getAuthenticationToken();
      CookieUtils.setAuthenticationCookie(tokenized);
      await updateUserIdentityId({});
    } catch (error: unknown) {
      clientLogger.error({
        reason: 'AuthenticationGateway',
        message: error instanceof Error ? error.message : 'Unknown error',
        attributes: {
          error: JSON.stringify(error),
          orySessionCookie: Boolean(CookieUtils.get(sessionName)),
          luminAuthenticationCookie: Boolean(CookieUtils.get(LUMIN_SESSION.AUTHENTICATION)),
          redirectUrl
        }
      });
    } finally {
      handleRedirect();
    }
  };

  useEffect(() => {
    getAuthentication();
  }, []);

  return <LoadingLogo whiteBackground />;
}

export default AuthenticationGateway;

export const getServerSideProps = getServerSidePipe(async (ctx: GetServerSidePropsContext) => {
  const { query } = ctx;
  let redirectTo = query.redirect_to as string;
  if (!ValidatorUtils.validateWhitelistUrl(redirectTo)) {
    redirectTo = '/';
  }
  return {
    props: {
      redirectUrl: redirectTo || '/'
    }
  };
}, withRememberLastAccessAccount);
