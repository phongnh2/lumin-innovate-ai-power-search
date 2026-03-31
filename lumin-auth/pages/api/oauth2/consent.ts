import { NextApiRequest, NextApiResponse } from 'next';

import { environment } from '@/configs/environment';
import grpc from '@/lib/grpc';
import { logger } from '@/lib/logger';
import { identityApi, oauth2Api } from '@/lib/ory';

/*
Swagger documentation for this API is located in:
 - docs/swagger/paths/oauth2-path.yaml
 - docs/swagger/schemas/oauth2-schema.yaml
*/
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  const challenge = String(req.body.challenge);
  const submit = String(req.body.submit);

  if (submit !== 'allow') {
    // submit must be "allow" to grant the request
    await denyAccess(challenge, resp);
    return;
  }

  // user accept the consent request
  const bodyScopes = req.body.grant_scope;
  const scopes: string[] = Array.isArray(bodyScopes) ? bodyScopes.map(s => String(s)) : [String(bodyScopes)];

  await allowAccess({ challenge, scopes, workspace_id: req.body.workspace_id, cookies: req.cookies || {} }, resp);
}

async function allowAccess(
  req: {
    challenge: string;
    scopes: string[];
    workspace_id: string;
    cookies: Record<string, unknown>;
  },
  resp: NextApiResponse
) {
  // Let's fetch the consent request again to be able to set `grantAccessTokenAudience` properly.
  const consentReq = await oauth2Api.getOAuth2ConsentRequest(req.challenge);
  const sessionName = environment.public.common.orySessionName;
  const orySession = req.cookies[sessionName];
  if (!orySession) {
    return resp.redirect(308, consentReq.request_url || '/sign-in');
  }
  const userId = String(consentReq.subject);
  const firstParty = consentReq.client?.client_id === environment.public.mobile.clientId;
  const identity = await identityApi.getIdentity({ identityId: userId });
  const user = await grpc.user.getCurrentUser({ identityId: identity.id });
  if (!user) {
    logger.info({ message: '(Consent) User not found' });
    await denyAccess(req.challenge, resp);
    return;
  }

  const workspace = req.workspace_id && (await grpc.workspace.getWorkspaceByIdAndUserId({ organizationId: req.workspace_id, userId: user._id }));
  if (!workspace && !firstParty) {
    logger.info({ message: '(Consent) Workspace not found' });
    await denyAccess(req.challenge, resp);
    return;
  }
  const { redirect_to: redirectTo } = await oauth2Api.acceptOAuth2ConsentRequest(req.challenge, {
    // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
    // are requested accidentally.
    grant_scope: req.scopes,
    // TODO: session
    session: {
      access_token: {
        email: identity.traits.email,
        sessionId: (consentReq?.context as { sessionId: string })?.sessionId,
        workspace_id: req.workspace_id || ''
      },
      id_token: {
        email: identity.traits.email,
        sessionId: (consentReq?.context as { sessionId: string })?.sessionId,
        workspace_id: req.workspace_id || ''
      }
    },
    // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
    grant_access_token_audience: consentReq.requested_access_token_audience,
    remember: true,
    remember_for: 0 // infinity and beyond
  });
  // All we need to do now is to redirect the user back to hydra!
  resp.redirect(redirectTo);
}

async function denyAccess(challenge: string, resp: NextApiResponse) {
  const { redirect_to: redirectTo } = await oauth2Api.rejectOAuth2ConsentRequest(challenge, {
    error: 'access_denied',
    error_description: 'The resource owner denied the request'
  });
  resp.redirect(redirectTo);
}
