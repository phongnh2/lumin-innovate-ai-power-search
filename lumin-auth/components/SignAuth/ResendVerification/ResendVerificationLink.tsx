import { useSnackbar } from 'notistack';
import { MouseEvent } from 'react';

import useResendVerificationMail from '@/hooks/auth/useResendVerificationMail';
import useTranslation from '@/hooks/useTranslation';
import { useCountdown } from '@/lib/use-countdown.';
import { ButtonText } from '@/ui';

type TProps = {
  formValues: (key: string) => string;
  countdownFrom?: number;
};

function ResendVerificationLink(props: TProps) {
  const { formValues, countdownFrom } = props;
  const [countdown, resetCountdown] = useCountdown(countdownFrom || 0);
  const { resendVerificationLink } = useResendVerificationMail(formValues);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const onResendClick = (e: MouseEvent) => {
    e.preventDefault();
    resendVerificationLink();
    enqueueSnackbar(t('authPage.verifiedEmailHasBeenResent'), { variant: 'success' });
    resetCountdown();
  };

  return (
    <ButtonText onClick={onResendClick} disabled={countdown > 0} underline level={6}>
      {t('authPage.didNotReceiveAnEmail')} {countdown > 0 ? `(${countdown}s)` : ''}
    </ButtonText>
  );
}

export default ResendVerificationLink;
