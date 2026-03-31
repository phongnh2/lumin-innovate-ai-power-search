import { css } from '@emotion/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';
import { Trans } from 'react-i18next';

import CustomHeader from '@/components/CustomHeader';
import { Header } from '@/components/Header';
import { withTranslation } from '@/components/hoc/withTranslation';
import LayoutSignAuth from '@/components/Layout/LayoutSignAuth';
import * as AuthStyled from '@/components/SignAuth/Auth.styled';
import ButtonOpenGmail from '@/components/SignAuth/ButtonOpenGmail';
import { setVerificationEmail } from '@/features/account/account-slice';
import useTranslation from '@/hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';
import letterIcon from '@/public/assets/letter-open.svg?url';
import { Text } from '@/ui';

const HeaderSignInElement = dynamic(() => import('@/components/HeaderSignInElement'), { ssr: false });

export default function ResendConfirmationEmailPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const email = useAppSelector(state => state.account.verificationEmail);
  const router = useRouter();

  useEffect(() => {
    if (!email) {
      router.replace('/sign-in');
    }
  });

  useEffect(() => {
    return () => dispatch(setVerificationEmail(''));
  }, []);

  if (!email) {
    return null;
  }
  return (
    <>
      <CustomHeader title='Verify account' />
      <Header right={<HeaderSignInElement />} />
      <AuthStyled.VerificationEmailSentContainer>
        <Image
          src={letterIcon}
          alt='icon'
          style={{
            width: '100%',
            marginBottom: '40px'
          }}
        />
        <Text
          as='h1'
          bold
          align='center'
          level={{ mobile: 3, tablet: 1 }}
          css={css`
            margin-bottom: 16px;
          `}
        >
          {t('verifyAccount.verificationEmailHasBeenSent')}
        </Text>
        <Text
          variant='neutral'
          align='center'
          css={css`
            margin-bottom: 24px;
          `}
        >
          <Trans i18nKey='resendVerificationEmail.haveSentANewEmail' values={{ email }} components={{ b: <b /> }} />
          <br />
          {t('resendVerificationEmail.checkYourInbox')}
          <br /> <br />
          {t('resendVerificationEmail.notSeeOurEmail')}
        </Text>
        <ButtonOpenGmail email={email} />
      </AuthStyled.VerificationEmailSentContainer>
    </>
  );
}

ResendConfirmationEmailPage.getLayout = function getLayout(page: ReactElement, pageProps: any) {
  return (
    <LayoutSignAuth isVerifyPage {...pageProps}>
      {page}
    </LayoutSignAuth>
  );
};

export const getServerSideProps = getServerSidePipe(withTranslation);
