import { serialize } from 'cookie';
import { GetServerSidePropsContext } from 'next';

import { CookieStorageKey } from '@/constants/cookieKey';
import { frontendApi } from '@/lib/ory';

export const withRememberLastAccessAccount = async (context: GetServerSidePropsContext) => {
  const { req, res } = context;
  try {
    const { cookie } = req.headers;
    const { data: session } = await frontendApi.toSession({ cookie });

    if (session.active && session.identity) {
      const cookies: string[] = [
        serialize(
          CookieStorageKey.LAST_ACCESS_ACCOUNT,
          JSON.stringify({
            name: session.identity.traits.name,
            email: session.identity.traits.email,
            loginService: session.identity.traits.loginService,
            avatarRemoteId: session.identity.traits.avatarRemoteId || null
          }),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/'
          }
        )
      ];

      if (process.env.NODE_ENV !== 'development') {
        // Expire the legacy cookie set with Domain=.luminpdf.com after switching to host-only cookie
        cookies.push(
          serialize(CookieStorageKey.LAST_ACCESS_ACCOUNT, '', {
            httpOnly: true,
            expires: new Date(0),
            path: '/',
            domain: '.luminpdf.com'
          })
        );
      }

      const existing = res.getHeader('Set-Cookie');
      const headers = Array.isArray(existing) ? existing : existing ? [String(existing)] : [];
      res.setHeader('Set-Cookie', [...headers, ...cookies]);
    }
  } catch (error) {}
};
