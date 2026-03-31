import Link from 'next/link';

import useTranslation from '@/hooks/useTranslation';
import { Text, tabletUpCss } from '@/ui';

type SignUpElementProps = {
  returnTo?: string;
  from?: string;
};

export default function SignUpElement({ returnTo, from }: SignUpElementProps) {
  const { t } = useTranslation();
  return (
    <div>
      <span css={tabletUpCss}>{t('authPage.newToLumin')}&nbsp;</span>
      <Text as='span' bold variant='highlight'>
        <Link
          href={{
            pathname: '/sign-up',
            query: {
              ...(returnTo && { return_to: returnTo }),
              ...(from && { from })
            }
          }}
        >
          {t('common.signUp')}
        </Link>
      </Text>
    </div>
  );
}
