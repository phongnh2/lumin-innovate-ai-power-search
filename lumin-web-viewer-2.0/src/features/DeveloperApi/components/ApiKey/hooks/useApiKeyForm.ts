import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslation } from 'hooks/useTranslation';

import yup from 'utils/yup';

const API_KEY_NAME_MAX_LENGTH = 30;

const useApiKeyForm = () => {
  const { t } = useTranslation();
  const validateSchema = useMemo(
    () =>
      yup.object().shape({
        name: yup
          .string()
          .trim()
          .max(
            API_KEY_NAME_MAX_LENGTH,
            t('developerApi.apiKeyNameMustBeLessThanCharacters', { length: API_KEY_NAME_MAX_LENGTH })
          )
          .notContainUrl(t('developerApi.invalidApiKeyName'))
          .notContainHtml(t('developerApi.invalidApiKeyName')),
      }),
    [t]
  );
  const { register, handleSubmit, formState, reset, setValue } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
    },

    resolver: yupResolver(validateSchema),
  });

  return {
    formState,
    handleSubmit,
    register,
    reset,
    setValue,
  };
};

export default useApiKeyForm;
