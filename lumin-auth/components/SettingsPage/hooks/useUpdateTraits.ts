import { useEffect } from 'react';

import { ErrorCode } from '@/constants/errorCode';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { useUpdateTraitsMutation } from '@/features/account/settings-api-slice';
import useTranslation from '@/hooks/useTranslation';
import { useSnackbar } from '@/ui';
import { getErrorMetadata } from '@/utils/error.utils';

const useUpdateTraits = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [updateTraits, { isLoading, isSuccess, error: serverError }] = useUpdateTraitsMutation();

  useEffect(() => {
    if (serverError) {
      const metadata = getErrorMetadata(serverError);
      if (metadata?.errorCode === ErrorCode.Auth.SESSION_REFRESH_REQUIRED) {
        return;
      }
      enqueueSnackbar((serverError as unknown as { data?: { message?: string } }).data?.message || t(CommonErrorMessage.Common.SOMETHING_WENT_WRONG), {
        variant: 'error'
      });
    }
  }, [serverError]);

  useEffect(() => {
    if (isSuccess) {
      enqueueSnackbar(t('profileSettings.changeNameSuccessfully'), { variant: 'success' });
    }
  }, [isSuccess]);

  return {
    isLoading,
    updateTraits,
    serverError
  };
};

export default useUpdateTraits;
