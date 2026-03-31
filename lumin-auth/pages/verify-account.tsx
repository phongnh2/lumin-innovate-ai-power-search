import { css } from '@emotion/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { MouseEvent, ReactElement, useEffect } from 'react';
import { Trans } from 'react-i18next';

import CustomHeader from '@/components/CustomHeader';
import { Header } from '@/components/Header';
import { withTranslation } from '@/components/hoc/withTranslation';
import LayoutSignAuth from '@/components/Layout/LayoutSignAuth';
import * as AuthStyled from '@/components/SignAuth/Auth.styled';
import ButtonOpenGmail from '@/components/SignAuth/ButtonOpenGmail';
import { setVerificationEmail } from '@/features/account/account-slice';
import { useEnsureVerificationFlowMutation, useResendVerificationLinkMutation } from '@/features/account/verification-api-slice';
import useTranslation from '@/hooks/useTranslation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { useCountdown } from '@/lib/use-countdown.';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';
import letterOpen from '@/public/assets/letter-open.svg?url';
import { getVerificationEmail } from '@/selectors';
import { ButtonText, Text } from '@/ui';
import { avoidNonOrphansWord } from '@/utils/string.utils';

const HeaderSignInElement = dynamic(() => import('@/components/HeaderSignInElement'), { ssr: false });

function Verify() {
  const { t } = useTranslation();
  const email = useAppSelector(getVerificationEmail);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [countdown, resetCountdown] = useCountdown(0);
  const [ensureFlow, { data: flow }] = useEnsureVerificationFlowMutation();
  const [resendVerificationLink] = useResendVerificationLinkMutation();

  const { ref, login_challenge: loginChallenge, return_to } = router.query;

  const returnTo = (return_to as string) ?? undefined;

  useEffect(() => {
    if (!email) {
      router.replace('/sign-up');
    }

    ensureFlow({
      ref,
      loginChallenge
    });
  }, [email, ensureFlow, router]);

  useEffect(() => {
    return () => dispatch(setVerificationEmail(''));
  }, []);

  const resendVerificationEmail = async (e: MouseEvent) => {
    e.preventDefault();

    if (countdown > 0 || !email) {
      return;
    }

    const newFlow = await ensureFlow({
      initial: flow,
      ref,
      loginChallenge
    }).unwrap();
    await resendVerificationLink({ flow: newFlow, email });
    resetCountdown();
  };

  if (!email) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }
  return (
    <>
      <CustomHeader title={t('pageTitle.verifyAccount')} />
      <Header right={<HeaderSignInElement returnTo={returnTo} />} />
      <AuthStyled.VerifyEmailContainer>
        <Image
          src={letterOpen}
          alt='icon'
          style={{
            width: '100%'
          }}
          css={css`
            margin-bottom: 24px;
          `}
        />
        <Text
          as='h1'
          bold
          level={1}
          align='center'
          css={css`
            margin-bottom: 16px;
          `}
        >
          {avoidNonOrphansWord(t('verifyAccount.verifyYourEmail'))}
        </Text>
        <Text
          variant='neutral'
          align='center'
          css={css`
            margin-bottom: 8px;
          `}
        >
          <br />
          <Trans i18nKey='verifyAccount.messageVerifyYourEmail' components={{ b: <strong className='font-semibold' /> }} values={{ email }} />
          <br />
          {t('resendVerificationEmail.checkYourInbox')}
        </Text>
        <br />
        <Text variant='neutral' align='center'>
          {avoidNonOrphansWord(t('verifyAccount.probablyAlreadySignedUp'))}
        </Text>

        <ButtonOpenGmail email={email as string} />

        <Text variant='neutral' align='center'>
          {t('verifyAccount.resendVerifyYourEmail')}{' '}
          <ButtonText onClick={resendVerificationEmail} disabled={countdown > 0} underline>
            {countdown > 0 ? t('verifyAccount.resendCount', { count: countdown }) : t('authPage.didNotReceiveAnEmail')}
          </ButtonText>
        </Text>
      </AuthStyled.VerifyEmailContainer>
    </>
  );
}

Verify.getLayout = function getLayout(page: ReactElement, pageProps: any) {
  return (
    <LayoutSignAuth isVerifyPage {...pageProps}>
      {page}
    </LayoutSignAuth>
  );
};

export default Verify;

export const getServerSideProps = getServerSidePipe(withTranslation);
