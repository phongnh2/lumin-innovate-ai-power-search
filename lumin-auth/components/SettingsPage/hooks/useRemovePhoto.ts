import { useEffect } from 'react';

import { useRemoveAvatarMutation } from '@/features/account/settings-api-slice';
import useTranslation from '@/hooks/useTranslation';
import { useSnackbar } from '@/ui';

const useRemovePhoto = () => {
  const { t } = useTranslation();
  const [removeAvatar, { isLoading, isSuccess }] = useRemoveAvatarMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (isSuccess) {
      enqueueSnackbar(t('profileAvatar.removePhotoSuccessfully'), { variant: 'success' });
    }
  }, [isSuccess]);

  return {
    removeAvatar,
    isLoading
  };
};

export default useRemovePhoto;
