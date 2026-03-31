import { useEffect } from 'react';

import useTranslation from '@/hooks/useTranslation';
import { useForm } from '@/lib/react-hook-form';
import { yup } from '@/lib/yup';
import { Input } from '@/ui';

const useGetDeleteAccountConfirmMessage = () => {
  const { t } = useTranslation();
  const { register, formState, setFocus } = useForm<{ confirmString: string }>({
    schema: yup.object().shape({
      confirmString: yup.string().required().is(['DELETE'])
    }),
    mode: 'onChange'
  });

  const ConfirmInput = (props: Record<string, any>) => {
    useEffect(() => {
      setFocus('confirmString');
    }, []);

    return <Input {...props} {...register('confirmString')} type='text' placeholder={`${t('placeholder.confirmByTyping')} "DELETE"`} />;
  };

  return {
    ConfirmInput,
    matchConfirmString: formState.isValid
  };
};

export default useGetDeleteAccountConfirmMessage;
