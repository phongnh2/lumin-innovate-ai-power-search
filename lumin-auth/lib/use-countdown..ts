import { useEffect, useState } from 'react';

import { RESEND_VERIFICATION_EMAIL_COUNTDOWN } from '@/features/account/helpers';

export const useCountdown = (countdownFrom: number) => {
  const [countdown, setCountdown] = useState(countdownFrom);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    setTimeout(() => setCountdown(countdown - 1), 1000);
  }, [countdown]);

  const resetCountdown = (newCountdown = RESEND_VERIFICATION_EMAIL_COUNTDOWN) => {
    newCountdown == null ? setCountdown(countdownFrom) : setCountdown(newCountdown);
  };
  return [countdown, resetCountdown] as const;
};
