import { css } from '@emotion/react';
import { VerificationFlow } from '@ory/client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Header } from '@/components/Header';
import * as AuthStyled from '@/components/SignAuth/Auth.styled';
import { environment } from '@/configs/environment';
import { Routes } from '@/configs/routers';
import { QUERY_KEYS } from '@/constants/common';
import { DEFAULT_RETURN_TO_VALUE } from '@/constants/url';
import { useGetVerificationFlowQuery } from '@/features/account/verification-api-slice';
import useTranslation from '@/hooks/useTranslation';
import { clientLogger } from '@/lib/logger';
import { OryResponseCode, ValidationError } from '@/lib/ory';
import monitorSuccess from '@/public/assets/monitor-success.svg?url';
import { Text, Button } from '@/ui';
import { ButtonSize } from '@/ui/Button';

import VerificationFailed from './components/VerificationFailed';

import { verifyContainerCss, verificationTitleCss, verifySuccessCss } from './VerificationPage.styled';

const HeaderSignInElement = dynamic(() => import('@/components/HeaderSignInElement'), { ssr: false });

type VerificationPageProps = {
  siteRef?: string | null;
  loginChallenge?: string | null;
  returnTo?: string | null;
};

export default function VerificationPage(props: VerificationPageProps) {
  const router = useRouter();
  const flowQuery = router.query.flow;
  const flowId = flowQuery ? String(flowQuery) : null;

  const { data: flow, isLoading } = useGetVerificationFlowQuery(flowId);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!flowId) {
      router.push('/sign-in');
    }
  }, [flowId, router]);

  useEffect(() => {
    if (!flow) {
      return;
    }
    if (flow.state === 'passed_challenge') {
      setVerified(true);
      return;
    }
    const error = ValidationError.fromSelfServiceFlow(flow);
    if (error.messages()[0].id === OryResponseCode.ALREADY_VERIFIED) {
      setVerified(true);
      return;
    }
    const { expires_at, issued_at, state } = error.flow() as VerificationFlow;
    clientLogger.error({
      reason: 'Verification failed',
      message: error.messages()[0].message,
      attributes: { expires_at, issued_at, state }
    });
  }, [flow]);

  if (isLoading) {
    return null;
  }

  return <>{verified ? <VerifySuccess {...props} /> : <VerificationFailed />}</>;
}

function VerifySuccess({ siteRef, loginChallenge, returnTo }: VerificationPageProps): JSX.Element {
  const { t } = useTranslation();
  const getParamFromSiteRef = () => {
    if (!siteRef) {
      return '';
    }
    return `?${QUERY_KEYS.RETURN_TO}=${siteRef}`;
  };

  const returnToParams = getParamFromSiteRef();

  const getRedirectUrl = () => {
    if (loginChallenge) {
      return `${environment.public.host.authUrl}/oauth2/sign-in?login_challenge=${loginChallenge}`;
    }
    return `${Routes.SignIn}${returnToParams}`;
  };

  const getReturnToProps = () => {
    if (!returnTo || returnTo === DEFAULT_RETURN_TO_VALUE) {
      return undefined;
    }
    return returnTo;
  };

  return (
    <div>
      <Header right={<HeaderSignInElement loginChallenge={loginChallenge} returnTo={getReturnToProps()} />} />

      <AuthStyled.VerifyEmailContainer
        css={[
          verifyContainerCss,
          css`
            align-items: center;
          `
        ]}
      >
        <Image
          src={monitorSuccess}
          alt='icon'
          style={{
            width: '100%',
            marginBottom: '24px'
          }}
        />
        <Text as='h1' bold level={{ mobile: 3, tablet: 1 }} align='center' css={verificationTitleCss}>
          {t('verifyAccount.niceWork')}
        </Text>
        <Text variant='neutral' align='center' css={verifySuccessCss}>
          {t('verifyAccount.verifiedSuccessfully')}
        </Text>

        <Link href={getRedirectUrl()} passHref legacyBehavior>
          <Button component='a' width={320} size={ButtonSize.XL}>
            {t('common.continue')}
          </Button>
        </Link>
      </AuthStyled.VerifyEmailContainer>
    </div>
  );
}
