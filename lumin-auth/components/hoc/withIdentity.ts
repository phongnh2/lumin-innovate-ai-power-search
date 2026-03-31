import { serialize } from 'cookie';
import { isbot } from 'isbot';
import { omit } from 'lodash';
import { GetServerSidePropsContext } from 'next';

import { environment } from '@/configs/environment';
import { AUTH_JWT_TEMPLATE, LUMIN_SESSION } from '@/constants/sessionKey';
import { BadRequestException } from '@/lib/exceptions/common/BadRequest.exception';
import grpc from '@/lib/grpc';
import { frontendApi } from '@/lib/ory';

// eslint-disable-next-line sonarjs/cognitive-complexity
export const withIdentity = async (context: GetServerSidePropsContext) => {
  const { req, res } = context;
  const { cookie } = req.headers;
  const userAgent = req.headers['user-agent'];

  // Skip authentication for bots to allow them to read og:tags
  if (isbot(userAgent)) {
    // return { props: { identity: null, currentUser: null } };
  }
  try {
    const { data: session } = await frontendApi.toSession({
      cookie,
      tokenizeAs: AUTH_JWT_TEMPLATE.AUTHENTICATION
    });
    const { identity, tokenized } = session;
    if (tokenized) {
      const newAuthenCookie = serialize(LUMIN_SESSION.AUTHENTICATION, tokenized, {
        path: '/',
        expires: new Date(Date.now() + environment.public.jwt.authentication.cookieExpiry * 24 * 60 * 60 * 1000),
        sameSite: 'lax',
        secure: true,
        domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'luminpdf.com'
      });
      res.setHeader('Set-Cookie', newAuthenCookie);
    }
    if (identity) {
      const getUserRes = await grpc.user.getUserByEmail({ email: identity.traits.email });
      if (!getUserRes?.user) {
        // No Lumin user linked with this identity
        // Temporary allow them to access profile setting
        // Will be linked later when they access app
        return { props: { identity, currentUser: {} } };
      }
      // Some attributes cannot be serialized in getServerSideProps
      const currentUser = omit(getUserRes.user, ['storageSize', 'usedStorage']);
      if (identity.traits.name && identity.traits.name !== currentUser.name) {
        await grpc.auth.updateUserPropertiesById({ userId: currentUser._id, properties: { name: identity.traits.name } });
        return {
          props: {
            identity,
            currentUser: {
              ...currentUser,
              name: identity.traits.name?.name
            }
          }
        };
      }
      return { props: { identity, currentUser } };
    }
    return { props: { identity: null, currentUser: null } };
  } catch (e) {
    if (e instanceof BadRequestException) {
      const reponseError = e.getResponseError();
      // in case session revoked
      if (reponseError.code === 401 && reponseError.message === 'unauthorized') {
        // Don't redirect bots - allow them to see the page for og:tags
        if (isbot(userAgent)) {
          // return { props: { identity: null, currentUser: null } };
        }
        const isDevelopment = process.env.NODE_ENV === 'development';
        const sessionName = environment.public.common.orySessionName;
        const expiredSessionCookie = serialize(sessionName, '', {
          path: '/',
          expires: new Date('Thu, 01 Jan 1970 00:00:01 GMT'),
          sameSite: 'lax',
          secure: true,
          httpOnly: true,
          domain: isDevelopment ? 'localhost' : 'luminpdf.com'
        });
        res.writeHead(302, {
          Location: '/sign-in',
          'Set-Cookie': expiredSessionCookie
        });
        res.end();
        return { props: { identity: null, currentUser: null } };
      }
    }
  }
  return { props: { identity: null, currentUser: null } };
};
