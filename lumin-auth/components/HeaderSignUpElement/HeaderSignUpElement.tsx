import Link from 'next/link';
import { useEffect, useState } from 'react';

import { UrlObject } from 'url';

import { ButtonName } from '@/constants/buttonEvent';
import { Platforms } from '@/constants/platform';
import useTranslation from '@/hooks/useTranslation';
import { Text, tabletUpCss } from '@/ui';

interface HeaderSignUpElementProps {
  returnTo?: string;
  from?: string;
  platform?: Platforms;
}

export function HeaderSignUpElement({ returnTo, from, platform }: Readonly<HeaderSignUpElementProps>) {
  const { t } = useTranslation();
  const [signInLink, setSignInLink] = useState<string | UrlObject>('/sign-up');

  useEffect(() => {
    setSignInLink({
      pathname: '/sign-up',
      query: {
        ...(returnTo && { return_to: returnTo }),
        ...(from && { from }),
        ...(platform && { platform })
      }
    });
  }, [from, returnTo, platform]);

  return (
    <Text as={'p'} align='center' variant='neutral'>
      <span css={tabletUpCss}>{t('authPage.newToLumin')}&nbsp;</span>
      <Text as='span' bold variant='highlight'>
        <Link data-lumin-btn-name={ButtonName.SIGN_UP} href={signInLink}>
          {t('common.signUp')}
        </Link>
      </Text>
    </Text>
  );
}

export default HeaderSignUpElement;
