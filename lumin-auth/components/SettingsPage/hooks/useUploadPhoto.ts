import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import { ALLOW_IMAGE_MIMETYPE } from '@/constants/common';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { ValidatorRule } from '@/constants/validator-rule';
import { useUploadAvatarMutation } from '@/features/account/settings-api-slice';
import { isSerializedError } from '@/features/errors';
import useCompressImage from '@/hooks/useCompressImage';
import useTranslation from '@/hooks/useTranslation';
import { useSnackbar } from '@/ui';
import { getErrorMessageTranslated } from '@/utils/error.utils';

const PHOTO_MAX_WIDTH = 300;
const PHOTO_MAX_HEIGHT = 300;

const validateFileSize = (file: File) => file.size <= ValidatorRule.Avatar.MaximumAvatarSize;

const validateFileType = (file: File) => ALLOW_IMAGE_MIMETYPE.includes(file.type);

const useUploadPhoto = () => {
  const { t } = useTranslation();
  const [uploadAvatar, { isLoading, isSuccess, error: serverError }] = useUploadAvatarMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { compressor } = useCompressImage();
  const [clientError, setError] = useState<string>('');

  const getServerError = useCallback(
    () => (isSerializedError(serverError) ? serverError.data.message : CommonErrorMessage.Common.SOMETHING_WENT_WRONG),
    [serverError]
  );

  const compressFile = (file: File) =>
    compressor(file, {
      maxHeight: PHOTO_MAX_WIDTH,
      maxWidth: PHOTO_MAX_HEIGHT,
      quality: 0.8
    });

  const uploadPhoto = async (file: File) => {
    flushSync(() => {
      // reset error before revalidating
      setError('');
    });

    if (!validateFileType(file)) {
      setError(getErrorMessageTranslated(CommonErrorMessage.Avatar.VALID_TYPE, t));
      return;
    }

    if (!validateFileSize(file)) {
      setError(getErrorMessageTranslated(CommonErrorMessage.Avatar.LIMIT_FILE_SIZE, t));
      return;
    }

    const compressedFile = await compressFile(file);
    await uploadAvatar(compressedFile);
  };

  useEffect(() => {
    if (serverError) {
      enqueueSnackbar(getServerError(), { variant: 'error' });
    }
  }, [serverError]);

  useEffect(() => {
    if (isSuccess) {
      enqueueSnackbar(t('profileAvatar.updateSuccessfully'), { variant: 'success' });
    }
  }, [isSuccess]);

  return {
    uploadPhoto,
    isLoading,
    clientError
  };
};

export default useUploadPhoto;
