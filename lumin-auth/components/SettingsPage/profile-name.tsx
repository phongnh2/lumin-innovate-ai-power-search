import { useEffect } from 'react';
import { Trans } from 'react-i18next';

import useTranslation from '@/hooks/useTranslation';
import { LoginService } from '@/interfaces/user';
import { useForm } from '@/lib/react-hook-form';
import { yup, yupValidator } from '@/lib/yup';
import { Button, ButtonText, Input, Label, Tooltip } from '@/ui';
import { ButtonColor } from '@/ui/Button/types';
import { getErrorMessageTranslated } from '@/utils/error.utils';

import { changeNameButtonCss, formCss, nameInputLabelCss, nameSubmitButtonGroupCss } from './Settings.styled';

const schema = yup.object().shape({
  name: yupValidator.username
});

export function ProfileName({ name, className = '', onSave, changingName, setChangingName, loading, loginService }: ProfileNameProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, resetField, formState, setFocus, getValues } = useForm<FormData>({
    defaultValues: { name },
    schema
  });

  const onSubmit = async (data: FormData) => {
    await onSave(data.name);
    setChangingName(false);
  };
  const onCancel = () => {
    setChangingName(false);
    reset({
      name
    });
  };

  const onChangeName = () => {
    setChangingName(true);
  };

  useEffect(() => {
    if (changingName) {
      setFocus('name');
    } else {
      reset({ name });
    }
  }, [changingName, name, reset, setFocus]);

  return (
    <article className={className}>
      <form css={formCss} onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('name')}
          label={
            <div css={nameInputLabelCss}>
              <Label>{t('common.name')}</Label>
              {!changingName && (
                <Tooltip title={loginService === LoginService.SAML_SSO && <Trans i18nKey='sso.notAllowedChangeUserInfo' components={{ b: <b /> }} />}>
                  <div css={changeNameButtonCss}>
                    <ButtonText onClick={onChangeName} underline level={6} disabled={loginService === LoginService.SAML_SSO}>
                      {t('profileSettings.changeName')}
                    </ButtonText>
                  </div>
                </Tooltip>
              )}
            </div>
          }
          readOnly={!changingName}
          onClear={() => resetField('name', { defaultValue: '' })}
          error={getErrorMessageTranslated(formState.errors.name?.message, t)}
          disabled={!changingName || loading}
          inputValue={getValues('name')}
        />
        {changingName && (
          <div css={nameSubmitButtonGroupCss}>
            <Button color={ButtonColor.TERTIARY} disabled={loading} type='button' onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type='submit' loading={formState.isSubmitting || loading}>
              {t('common.save')}
            </Button>
          </div>
        )}
      </form>
    </article>
  );
}

type ProfileNameProps = {
  className?: string;
  onSave: (name: string) => void | Promise<void>;
  name: string;
  changingName: boolean;
  setChangingName: (changing: boolean) => void;
  loading: boolean;
  loginService?: LoginService;
};

type FormData = {
  name: string;
};
