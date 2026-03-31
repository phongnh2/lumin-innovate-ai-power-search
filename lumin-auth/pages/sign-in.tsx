import { GetServerSidePropsContext } from 'next';
import { ReactElement } from 'react';
import { useRouter } from 'next/router';

import CustomHeader from '@/components/CustomHeader';
import { withSignInFlow } from '@/components/hoc/withSignInFlow';
import { withTranslation } from '@/components/hoc/withTranslation';
import LayoutSignAuth from '@/components/Layout/LayoutSignAuth';
import SignInPage from '@/components/SignInPage';
import { CookieStorageKey } from '@/constants/cookieKey';
import { Platforms } from '@/constants/platform';
import { QUERY_KEYS } from '@/constants/common';
import useTranslation from '@/hooks/useTranslation';
import { LastAccessAccount } from '@/interfaces/account';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';

function SignIn({ lastAccessAccount }: { lastAccessAccount: LastAccessAccount }) {
  const { t } = useTranslation();
  const router = useRouter();
  const rawPlatform = router.query[QUERY_KEYS.PLATFORM];
  const platform =
  typeof rawPlatform === 'string' && rawPlatform
    ? (rawPlatform as Platforms)
    : undefined;
  return (
    <>
      <CustomHeader
        title={t('common.signIn')}
        description='Log in to your Lumin account. Continue with Google, Dropbox, Microsoft and Email. Single sign-on (SSO).'
        metaTitle='Sign In | Lumin'
      />
      <SignInPage lastAccessAccount={lastAccessAccount} platform={platform} />
    </>
  );
}

export const getServerSideProps = getServerSidePipe(withTranslation, withSignInFlow, async (ctx: GetServerSidePropsContext) => {
  const lastAccessAccountCookie = ctx.req.cookies[CookieStorageKey.LAST_ACCESS_ACCOUNT];
  let lastAccessAccount = null;
  if (lastAccessAccountCookie) {
    try {
      lastAccessAccount = JSON.parse(lastAccessAccountCookie);
    } catch (_) {}
  }
  return {
    props: {
      lastAccessAccount
    }
  };
});

SignIn.getLayout = function getLayout(page: ReactElement) {
  return <LayoutSignAuth>{page}</LayoutSignAuth>;
};

export default SignIn;