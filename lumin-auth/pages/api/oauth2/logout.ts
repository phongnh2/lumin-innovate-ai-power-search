import { NextApiRequest, NextApiResponse } from 'next';

import grpc from '@/lib/grpc';
import { frontendApi, oauth2Api } from '@/lib/ory';

/*
Swagger documentation for this API is located in:
 - docs/swagger/paths/oauth2-path.yaml
 - docs/swagger/schemas/oauth2-schema.yaml
*/
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  const challenge = String(req.body.challenge);
  const logoutToken = String(req.body.logout_token);
  const submit = String(req.body.submit);

  if (submit !== 'allow') {
    await denyLogout(challenge, resp);
    return;
  }

  await acceptLogout({ challenge, resp, logoutToken, req });
}

async function acceptLogout({ logoutToken, challenge, req, resp }: { logoutToken: string; challenge: string; req: NextApiRequest; resp: NextApiResponse }) {
  const { redirect_to: redirectTo } = await oauth2Api.acceptOAuth2LogoutRequest(challenge);

  if (logoutToken && logoutToken !== 'already logout') {
    const { data } = await frontendApi.toSession({ cookie: req.headers.cookie });

    await frontendApi.updateLogoutFlow(
      { logoutToken: logoutToken },
      {
        headers: {
          Cookie: req.headers.cookie || ''
        }
      }
    );
    grpc.kratos.handleSignOut({ id: data.identity?.id });
  }

  resp.redirect(redirectTo);
}

async function denyLogout(challenge: string, resp: NextApiResponse) {
  await oauth2Api.rejectOAuth2LogoutRequest(challenge);
  // TODO
  resp.redirect('/');
}
