import { ReactElement } from 'react';

import CustomHeader from '@/components/CustomHeader';
import { withOpenFileFlowRegistration } from '@/components/hoc/withOpenFileFlowRegistration';
import { withTranslation } from '@/components/hoc/withTranslation';
import LayoutSignAuth from '@/components/Layout/LayoutSignAuth';
import SignUpPage from '@/components/SignUpPage';
import useTranslation from '@/hooks/useTranslation';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';

function SignUp() {
  const { t } = useTranslation();
  return (
    <>
      <CustomHeader
        title={t('pageTitle.createAnAccountLumin')}
        description='Make work seamless. Create your Lumin account. Continue with Google, Dropbox, Microsoft and Email. Single sign-on (SSO).'
        metaTitle='Sign Up | Lumin'
      />
      <SignUpPage />
    </>
  );
}

SignUp.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutSignAuth i18nKeyTitle={'authPage.signUpForFree'} i18nSubTitle={'authPage.recommendWorkEmail'}>
      {page}
    </LayoutSignAuth>
  );
};

export default SignUp;

export const getServerSideProps = getServerSidePipe(withOpenFileFlowRegistration, withTranslation);
