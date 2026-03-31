/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactElement } from 'react';

import CustomHeader from '@/components/CustomHeader';
import { withTranslation } from '@/components/hoc/withTranslation';
import LayoutSignAuth from '@/components/Layout/LayoutSignAuth';
import SignInSSOPage from '@/components/SignInSSOPage';
import useTranslation from '@/hooks/useTranslation';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';

function SignInSSO() {
  const { t } = useTranslation();
  return (
    <>
      <CustomHeader title={t('pageTitle.signInSSO')} metaTitle='Sign in with SSO | Lumin' description='Sign in with SSO' />
      <SignInSSOPage />
    </>
  );
}

SignInSSO.getLayout = function getLayout(page: ReactElement, pageProps: any) {
  return <LayoutSignAuth {...pageProps}>{page}</LayoutSignAuth>;
};

export default SignInSSO;

export const getServerSideProps = getServerSidePipe(withTranslation);
