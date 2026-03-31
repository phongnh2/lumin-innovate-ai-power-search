import { css } from '@emotion/react';
import Image from 'next/image';

import useTranslation from '@/hooks/useTranslation';
import letterOpenSuccess from '@/public/assets/letter-open-success.svg?url';
import { Text } from '@/ui';
import { avoidNonOrphansWord } from '@/utils/string.utils';

import ButtonOpenGmail from '../SignAuth/ButtonOpenGmail';

function EmailSent({ email }: { email: string }) {
  const { t } = useTranslation();
  return (
    <>
      <Image
        src={letterOpenSuccess}
        alt='email sent'
        height={144}
        css={css`
          margin-bottom: 40px;
          width: 100%;
        `}
      />
      <Text
        as='h1'
        bold
        level={1}
        css={css`
          margin-bottom: 16px;
          text-align: center;
        `}
      >
        {t('forgotPassword.emailSent')}
      </Text>
      <Text
        variant='neutral'
        align='center'
        css={css`
          margin-bottom: 24px;
        `}
      >
        {t('forgotPassword.passwordResetEmailHasBeenSent')} <br />
        {t('forgotPassword.followThePromptsToReset')}
        <br />
        {avoidNonOrphansWord(t('forgotPassword.note'))}
      </Text>

      <ButtonOpenGmail email={email} />
    </>
  );
}

export default EmailSent;
