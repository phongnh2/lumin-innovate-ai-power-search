import { ReactElement } from 'react';

import CustomHeader from '@/components/CustomHeader';
import { withTranslation } from '@/components/hoc/withTranslation';
import { withVerification, VerificationProps } from '@/components/hoc/withVerification';
import LayoutSignAuth from '@/components/Layout/LayoutSignAuth';
import VerificationPage from '@/components/VerificationPage/VerificationPage';
import useTranslation from '@/hooks/useTranslation';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';

export default function Verification({ siteRef, loginChallenge, returnTo }: VerificationProps) {
  const { t } = useTranslation();
  return (
    <>
      <CustomHeader title={t('pageTitle.verifyAccount')} />
      <VerificationPage siteRef={siteRef} loginChallenge={loginChallenge} returnTo={returnTo} />
    </>
  );
}

Verification.getLayout = function getLayout(page: ReactElement, pageProps: any) {
  return <LayoutSignAuth {...pageProps}>{page}</LayoutSignAuth>;
};

export const getServerSideProps = getServerSidePipe(withVerification, withTranslation);
