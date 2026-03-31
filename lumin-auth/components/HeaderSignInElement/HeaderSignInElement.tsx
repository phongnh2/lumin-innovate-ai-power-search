import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { UrlObject } from 'url';

import useTranslation from '@/hooks/useTranslation';
import { Text, tabletUpCss } from '@/ui';

interface HeaderSignInElementProps {
  loginChallenge?: string | null;
  returnTo?: string;
}

export function HeaderSignInElement({ loginChallenge, returnTo }: Readonly<HeaderSignInElementProps>) {
  const { t } = useTranslation();
  const [signInLink, setSignInLink] = useState<string | UrlObject>('/sign-in');

  const generateLink = useCallback(() => {
    if (loginChallenge) {
      return {
        pathname: '/oauth2/sign-in',
        query: { login_challenge: loginChallenge }
      };
    }
    return {
      pathname: '/sign-in',
      query: { ...(returnTo && { return_to: returnTo }) }
    };
  }, [loginChallenge, returnTo]);

  useEffect(() => {
    const link = generateLink();
    setSignInLink(link);
  }, [generateLink]);

  return (
    <Text as={'p'} align='center' variant='neutral'>
      <span css={tabletUpCss}>{t('authPage.alreadyHaveAccount')}&nbsp;</span>
      <Text as='span' bold variant='highlight'>
        <Link href={signInLink}>{t('common.signIn')}</Link>
      </Text>
    </Text>
  );
}

export default HeaderSignInElement;
