import { LoginFlow, RegistrationFlow } from '@ory/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { QUERY_KEYS } from '@/constants/common';
import { ErrorCode } from '@/constants/errorCode';
import { DEFAULT_RETURN_TO_VALUE } from '@/constants/url';
import { OryResponseCode } from '@/lib/ory/errors';
import { useSnackbar } from '@/ui';

type UseHandleFlowErrorsProps = {
  existingFlow?: LoginFlow | RegistrationFlow;
  isRegistrationFlow?: boolean;
};

function useHandleFlowErrors({ existingFlow, isRegistrationFlow }: UseHandleFlowErrorsProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const updateUrlFromReturnTo = (returnTo?: string) => {
    let redirectTo: string | null = null;
    if (returnTo && returnTo !== DEFAULT_RETURN_TO_VALUE) {
      try {
        const decodedReturnTo = decodeURIComponent(returnTo);
        const url = new URL(decodedReturnTo);
        // Extract redirect_to from gateway URL if present
        const redirectToParam = url.searchParams.get('redirect_to');
        redirectTo = redirectToParam || (isRegistrationFlow ? returnTo : null);
      } catch {
        redirectTo = isRegistrationFlow ? returnTo : null;
      }
    }

    const { [QUERY_KEYS.FLOW]: _, ...restQuery } = router.query;
    const newQuery = { ...restQuery, ...(redirectTo && { [QUERY_KEYS.RETURN_TO]: redirectTo }) };

    router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  };

  useEffect(() => {
    if (!existingFlow) {
      return;
    }

    // Check for access denied error
    const firstMessage = existingFlow?.ui?.messages?.[0];
    const isAccessDenied =
      firstMessage?.id === OryResponseCode.GENERIC_ERROR &&
      firstMessage?.type === 'error' &&
      (firstMessage?.context as { reason?: string })?.reason?.includes('access_denied');

    // Check for already signed in with another method error
    const isAlreadySignedInAnotherMethod = existingFlow?.ui?.messages?.some(
      message => (message?.context as { code?: string })?.code === ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD
    );

    if (isAccessDenied || isAlreadySignedInAnotherMethod) {
      if (isAccessDenied) {
        enqueueSnackbar(t('authPage.accessDenied'), { variant: 'error' });
      }
      updateUrlFromReturnTo(existingFlow.return_to);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingFlow]);
}

export default useHandleFlowErrors;
