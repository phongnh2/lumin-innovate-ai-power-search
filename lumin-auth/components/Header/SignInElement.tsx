import Link from 'next/link';

import useTranslation from '@/hooks/useTranslation';
import { Text, tabletUpCss } from '@/ui';

export default function SignInElement({ loginChallenge }: { loginChallenge?: string | null }) {
  const { t } = useTranslation();
  return (
    <p>
      <span css={tabletUpCss}>{t('authPage.alreadyHaveAccount')}&nbsp;</span>
      <Text bold variant='highlight'>
        <Link href={loginChallenge ? `/oauth2/sign-in?login_challenge=${loginChallenge}` : '/sign-in'}>{t('common.signIn')}</Link>
      </Text>
    </p>
  );
}
