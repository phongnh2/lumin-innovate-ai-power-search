import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useState, useEffect, useRef } from 'react';

import { withTranslation } from '@/components/hoc/withTranslation';
import LoadingLogo from '@/components/LoadingLogo/LoadingLogo';
import { frontendApi, oauth2Api } from '@/lib/ory';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';

interface LogoutProps {
  firstParty: boolean;
  challenge: string;
}

export default function Logout(props: LogoutProps) {
  const [logoutToken, setLogoutToken] = useState('');
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const setupLogout = async () => {
      try {
        const { data: flow } = await frontendApi.createLogoutFlow();
        setLogoutToken(flow.logout_token);
      } catch {
        setLogoutToken('already logout');
      }
    };
    if (props.firstParty) {
      setupLogout();
    }
  }, [props.firstParty]);

  useEffect(() => {
    if (logoutToken) {
      HTMLFormElement.prototype.submit.call(form.current);
    }
  }, [logoutToken]);
  return (
    <main>
      <form className='hidden' ref={form} action='/api/oauth2/logout' method='POST'>
        <input type='hidden' name='challenge' value={props.challenge} readOnly />
        <input type='hidden' name='logout_token' value={logoutToken} readOnly />
        <input type='hidden' name='submit' value='allow' readOnly />
        <LoadingLogo />
      </form>
    </main>
  );
}

async function withLogout(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<LogoutProps>> {
  const { query } = ctx;
  const challenge = String(query.logout_challenge);
  const logoutReq = await oauth2Api.getOAuth2LogoutRequest(challenge);
  return {
    props: {
      firstParty: true,
      challenge: logoutReq.challenge as string
    }
  };
}

export const getServerSideProps = getServerSidePipe(withLogout, withTranslation);
