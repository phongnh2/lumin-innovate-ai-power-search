import Link from 'next/link';
import { useMemo } from 'react';

import { Platforms } from '@/constants/platform';
import useTranslation from '@/hooks/useTranslation';
import { Text } from '@/ui';

import { subTextCss } from '../Layout/LayoutSignAuth/LayoutSignAuth.styled';

type SignUpFooterProps = {
  returnTo?: string;
  from?: string;
  platform?: Platforms;
};
function SignUpFooter({ returnTo, from, platform }: SignUpFooterProps) {
  const { t } = useTranslation();
  const signInLink = useMemo(() => {
    return {
      pathname: '/sign-up',
      query: {
        ...(returnTo && { return_to: returnTo }),
        ...(from && { from }),
        ...(platform && { platform })
      }
    };
  }, [from, returnTo, platform]);

  return (
    <Text as={'p'} align='center' variant='neutral'>
      <span css={subTextCss}>{t('authPage.newToLumin')}&nbsp;</span>
      <Text as='span' bold variant='highlight'>
        <Link href={signInLink}>{t('common.signUp')}</Link>
      </Text>
    </Text>
  );
}

export default SignUpFooter;
