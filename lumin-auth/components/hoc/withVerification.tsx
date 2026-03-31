import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { QUERY_KEYS } from '@/constants/common';
import { frontendApi } from '@/lib/ory';

export type VerificationProps = {
  siteRef?: string | null;
  loginChallenge?: string | null;
  returnTo?: string | null;
};

export async function withVerification(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<VerificationProps>> {
  const { query, req } = ctx;
  const flowQuery = String(query.flow);

  if (!flowQuery) {
    return { props: {} };
  }

  const flowId = String(flowQuery);
  const { data: flow } = await frontendApi.getVerificationFlow({
    flowId,
    cookie: req.headers.cookie
  });
  if (!flow.request_url) {
    return { props: {} };
  }

  const reqUrl = new URL(flow.request_url);
  const ref = reqUrl.searchParams.get('ref');
  const returnTo = reqUrl.searchParams.get(QUERY_KEYS.RETURN_TO);
  const loginChallenge = reqUrl.searchParams.get('login_challenge');

  return {
    props: {
      siteRef: ref,
      loginChallenge,
      returnTo
    }
  };
}
