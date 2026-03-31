import { ReactElement } from 'react';

import CustomHeader from '@/components/CustomHeader';
import ForgotPasswordPage from '@/components/ForgotPasswordPage';
import { withTranslation } from '@/components/hoc/withTranslation';
import LayoutSignAuth from '@/components/Layout/LayoutSignAuth';
import useTranslation from '@/hooks/useTranslation';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';

function ForgotPassword() {
  const { t } = useTranslation();
  return (
    <>
      <CustomHeader
        title={t('pageTitle.forgotYourPassword')}
        metaTitle='Forgot Password | Lumin'
        description='Change your password. Enter your email below to receive your password reset instructions.'
      />
      <ForgotPasswordPage />
    </>
  );
}

ForgotPassword.getLayout = function getLayout(page: ReactElement, pageProps: any) {
  return <LayoutSignAuth {...pageProps}>{page}</LayoutSignAuth>;
};

export default ForgotPassword;

export const getServerSideProps = getServerSidePipe(withTranslation);
