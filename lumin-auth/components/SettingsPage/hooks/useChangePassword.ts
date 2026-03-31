import { useEffect } from 'react';

import { useSubmitChangePasswordFlowMutation } from '@/features/account/settings-api-slice';
import useTranslation from '@/hooks/useTranslation';
import { useSnackbar } from '@/ui';

const useChangePassword = () => {
  const { t } = useTranslation();
  const [submitChangePasswordFlow, { isSuccess: submited, error, reset }] = useSubmitChangePasswordFlowMutation();

  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (submited) {
      enqueueSnackbar(t('profileSettings.changePasswordSuccessfully'), { variant: 'success' });
    }
  }, [submited]);

  return {
    changePassword: submitChangePasswordFlow,
    error,
    reset
  };
};

export default useChangePassword;
