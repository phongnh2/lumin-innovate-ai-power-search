/* eslint-disable react/no-unused-prop-types */

import { OAuth2Client } from '@ory/client';
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Fragment, ReactElement, RefObject, useEffect, useRef } from 'react';

import ConsentPage from '@/components/ConsentPage';
import CustomHeader from '@/components/CustomHeader';
import { withTranslation } from '@/components/hoc/withTranslation';
import { environment } from '@/configs/environment';
import { Scope } from '@/constants/oauth2Scopes';
import { OAUTH2_LOGO_MOCK_URI } from '@/constants/url';
import { storage } from '@/lib/aws/s3';
import { logger } from '@/lib/logger';
import { identityApi, oauth2Api } from '@/lib/ory';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';
import { redirect } from '@/utils/oauth2.utils';

interface ConsentProps {
  // is the request coming from first party client?
  skipConsent: boolean;
  challenge: string;
  requestedScopes: Scope[];
  user: {
    email: string;
    subject: string | null;
    avatarRemoteId: string | null;
    name: string;
  };
  requestUrl: string;
  client: OAuth2Client;
  lastAccessWorkspaceId: string;
  workspaces: {
    workspaceId: string;
    workspaceName: string;
    workspaceAvatarRemoteId: string;
  }[];
}

function Consent(props: ConsentProps) {
  const { skipConsent } = props;
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (skipConsent) {
      HTMLFormElement.prototype.submit.call(form.current);
    }
  }, [skipConsent]);

  // eslint-disable-next-line react/jsx-no-useless-fragment, no-use-before-define
  return <>{skipConsent ? renderFirstPartyForm(props, form) : renderThirdPartyForm(props)}</>;
}

Consent.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <CustomHeader title='Consent' />
      {page}
    </>
  );
};

function renderThirdPartyForm(props: ConsentProps) {
  return <ConsentPage {...props} />;
}

// renders hidden form with submit=allow & all requested scopes checked
function renderFirstPartyForm(props: ConsentProps, formRef: RefObject<HTMLFormElement>) {
  return (
    <main>
      <form className='hidden' ref={formRef} action='/api/oauth2/consent' method='POST'>
        <input type='hidden' name='challenge' value={props.challenge} readOnly />
        <input type='hidden' name='submit' value='allow' readOnly />
        <input type='hidden' name='workspace_id' value={props.lastAccessWorkspaceId} readOnly />
        {props.requestedScopes.map(scope => (
          <Fragment key={scope}>
            <input style={{ display: 'none' }} type='checkbox' name='grant_scope' value={scope} defaultChecked readOnly />
          </Fragment>
        ))}
      </form>
    </main>
  );
}

function extractLogoRef(logoUri: string): string | null {
  try {
    const url = new URL(logoUri);
    if (logoUri.startsWith(OAUTH2_LOGO_MOCK_URI)) {
      return url.searchParams.get('ref');
    }
    return null;
  } catch {
    return null;
  }
}

async function getClientLogoUri(logoUri: string | undefined): Promise<string | undefined> {
  if (!logoUri) {
    return undefined;
  }

  const refFileRemoteId = extractLogoRef(logoUri);
  if (refFileRemoteId) {
    return storage.getLogoUri(refFileRemoteId);
  }

  if (logoUri.startsWith('oauth-logo')) {
    return storage.getLogoUri(logoUri);
  }

  return logoUri;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
async function withConsent(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<ConsentProps>> {
  try {
    const { query } = ctx;
    const challenge = String(query.consent_challenge);
    const consentReq = await oauth2Api.getOAuth2ConsentRequest(challenge);
    const sessionName = environment.public.common.orySessionName;
    const orySession = ctx.req.cookies[sessionName];
    if (!orySession) {
      return redirect(308, consentReq.request_url || '/sign-in');
    }
    const userId = String(consentReq.subject);
    const grpc = (await import('@/lib/grpc')).default;
    const identity = await identityApi.getIdentity({ identityId: userId });

    const user = await grpc.user.getUserByEmail({ email: identity.traits.email });
    if (!user) {
      return redirect(308, '/sign-in');
    }

    const firstParty = consentReq.client?.client_id === environment.public.mobile.clientId;

    const [workspaces, destinationWorkspace] = await Promise.all([
      grpc.workspace.getWorkspacesByUserId({ userId: user.user?._id }),
      !firstParty ? grpc.workspace.getDestinationWorkspaceToUpload({ userId: user.user?._id }) : Promise.resolve(null)
    ]);

    let workspacesData =
      workspaces?.organizations?.map(organization => ({
        workspaceId: (organization as { organization_id: string }).organization_id || '',
        workspaceName: organization.name || '',
        workspaceAvatarRemoteId: (organization as { avatar_remote_id: string }).avatar_remote_id || ''
      })) || [];
    if (!workspacesData.length && destinationWorkspace?.organization) {
      const destinationWorkspaceData = destinationWorkspace.organization as { organization_id: string; name: string; avatar_remote_id: string };
      workspacesData = [
        {
          workspaceId: destinationWorkspaceData.organization_id,
          workspaceName: destinationWorkspaceData.name,
          workspaceAvatarRemoteId: destinationWorkspaceData.avatar_remote_id
        }
      ];
    }
    // skip consent if request for only id_token
    const skipConsent = Boolean(consentReq.requested_scope && consentReq.requested_scope.length === 1 && consentReq.requested_scope[0] === 'openid');
    const logoUri = await getClientLogoUri(consentReq.client?.logo_uri);
    return {
      props: {
        skipConsent: firstParty || skipConsent,
        challenge,
        requestedScopes: consentReq.requested_scope as Scope[],
        user: {
          subject: consentReq.subject || null,
          email: identity.traits.email,
          name: identity.traits.name,
          avatarRemoteId: identity.traits.avatarRemoteId || null
        },
        requestUrl: consentReq.request_url || '',
        client: {
          ...consentReq.client,
          logo_uri: logoUri
        },
        workspaces: workspacesData,
        lastAccessWorkspaceId:
          (destinationWorkspace?.organization as { organization_id: string })?.organization_id ||
          (workspacesData.length > 0 ? workspacesData[0].workspaceId : '')
      }
    };
  } catch (e) {
    logger.error({ err: e as Error, message: (e as Error)?.message ?? 'Unknown error', scope: 'Oauth2 consent' });
    if (axios.isAxiosError(e)) {
      const error: AxiosError<{ redirect_to: string }> = e;
      if (error?.response?.status === 410) {
        return {
          redirect: {
            permanent: true,
            destination: error?.response?.data.redirect_to
          }
        };
      }
    }
    return redirect(308, '/sign-in');
  }
}

export const getServerSideProps = getServerSidePipe(withConsent, withTranslation);

export default Consent;
