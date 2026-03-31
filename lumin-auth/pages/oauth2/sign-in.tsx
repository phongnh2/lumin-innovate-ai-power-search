import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ReactElement } from 'react';

import CustomHeader from '@/components/CustomHeader';
import { withTranslation } from '@/components/hoc/withTranslation';
import LayoutSignAuth from '@/components/Layout/LayoutSignAuth';
import SignInPage from '@/components/SignInPage';
import { environment } from '@/configs/environment';
import { QUERY_KEYS } from '@/constants/common';
import { Platforms } from '@/constants/platform';
import { getOAuth2Ref } from '@/constants/ref';
import useTranslation from '@/hooks/useTranslation';
import { frontendApi, oauth2Api } from '@/lib/ory';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';
import { redirect } from '@/utils/oauth2.utils';

interface SignInProps {
  challenge: string;
  from: string | null;
  platform?: Platforms;
}

function SignIn({ challenge, from, platform }: SignInProps) {
  const oAuth2Refvalue = getOAuth2Ref(from);
  const returnTo = `${environment.public.host.authUrl}/oauth2/sign-in?login_challenge=${challenge}`;
  const { t } = useTranslation();

  const getPlatform = () => {
    if (platform === Platforms.SignMobile) {
      return Platforms.SignMobile;
    }
    if (oAuth2Refvalue === 'mobile') {
      return Platforms.PDFMobile;
    }
    return platform;
  };

  return (
    <>
      <CustomHeader
        title={t('common.signIn')}
        description='Lumin brings your documents to life with smart editing and markup tools to help you easily annotate PDF documents and images.
        Add text, images, comments, shapes and signatures. All from your browser.'
      />
      <SignInPage
        oauth2={{
          from: oAuth2Refvalue,
          challenge,
          returnTo
        }}
        platform={getPlatform()}
      />
    </>
  );
}

SignIn.getLayout = function getLayout(page: ReactElement) {
  return <LayoutSignAuth>{page}</LayoutSignAuth>;
};

const clearHydraCookie = (res: any, req: any, location: string) => {
  if (req.cookies['ory_hydra_session_dev']) {
    const oauthCookie = `ory_hydra_session_dev=empty; Max-Age=0; path=/; domain=.luminpdf.com`;
    res.writeHead(308, {
      Location: location,
      'Set-Cookie': oauthCookie
    });
    res.end();
  }
};

export default SignIn;

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function withSignInOauth2(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<SignInProps>> {
  const { req, res, query } = ctx;

  const challenge = String(query.login_challenge);
  let showLogin: { props: any } = {
    props: {
      challenge,
      from: ''
    }
  };

  try {
    const loginReq = await oauth2Api.getOAuth2LoginRequest(challenge);
    const { subject, request_url, client } = loginReq;
    const reqUrl = new URL(request_url);

    try {
      // if hydra was already able to authenticate the user, skip will be true
      // and we don't need to re-authenticate the user.
      // eslint-disable-next-line camelcase
      const ref = client?.client_id === environment.public.mobile.clientId ? 'mobile' : reqUrl.searchParams.get('ref');
      const platform = reqUrl.searchParams.get(QUERY_KEYS.PLATFORM) as Platforms;

      showLogin = {
        props: {
          challenge,
          from: ref,
          platform
        }
      };

      const sessionName = environment.public.common.orySessionName;
      const orySession = req.cookies[sessionName];
      if (!orySession) {
        clearHydraCookie(res, req, reqUrl.href);
        return showLogin;
      }
      const { cookie } = req.headers;
      const { data: session } = await frontendApi.toSession({ cookie });

      if (!session.active) {
        clearHydraCookie(res, req, reqUrl.href);
        return showLogin;
      }

      // if (skip) {
      //   const { redirect_to: redirectTo } = await oauth2Api.acceptOAuth2LoginRequest(challenge, { subject });

      //   return redirect(301, redirectTo);
      // }

      if (subject && subject !== session.identity?.id) {
        // remove oauth2 cookie when using new session
        const oauthCookie = `ory_hydra_session_dev=${req.cookies['ory_hydra_session_dev']}; Max-Age=0; path=/; domain=.luminpdf.com`;
        res.writeHead(302, {
          Location: reqUrl.href,
          'Set-Cookie': oauthCookie
        });
        res.end();
        return {
          props: {
            challenge,
            from: null,
            platform
          }
        };
      }

      const _loginReq = await oauth2Api.acceptOAuth2LoginRequest(challenge, {
        subject: session.identity?.id || '',
        remember: true,
        remember_for: 0,
        context: {
          sessionId: session.id
        }
      });

      return redirect(301, _loginReq.redirect_to);
    } catch (e: any) {
      if (axios.isAxiosError(e)) {
        const error: AxiosError<{ redirect_to: string; error?: { code?: number } }> = e;
        if (error?.response?.data?.error?.code === 401) {
          clearHydraCookie(res, req, reqUrl.href);
          return showLogin;
        }

        if (error?.response?.status === 404) {
          return redirect(308, '/sign-in');
        }

        if (error?.response?.status === 410) {
          return redirect(301, error?.response?.data.redirect_to);
        }
      }
      if (e.response?.status === 401 || e.code === 401) {
        clearHydraCookie(res, req, reqUrl.href);
        return showLogin;
      }
      return redirect(308, '/');
    }
  } catch (e) {
    return redirect(308, '/');
  }
}

export const getServerSideProps = getServerSidePipe(withSignInOauth2, withTranslation);
