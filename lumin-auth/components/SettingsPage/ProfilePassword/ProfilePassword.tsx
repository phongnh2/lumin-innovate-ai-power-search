/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { useEffect, useCallback, useRef } from 'react';

import Form from '@/components/Form';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { FormName } from '@/constants/formName';
import { isSerializedError, getServerError } from '@/features/errors';
import useTranslation from '@/hooks/useTranslation';
import { useForm } from '@/lib/react-hook-form';
import { passwordSchema, TPasswordSchema } from '@/lib/yup';
import { Alert, Button, ButtonText, Input, PasswordInput, Text } from '@/ui';
import { ButtonColor } from '@/ui/Button/types';
import { getErrorMessageTranslated } from '@/utils/error.utils';

import { titleCss } from '../Settings.styled';

import { buttonGroupCss, containerCss, highlightAnimationCss, passwordLabelContainerCss, passwordTitleGroupCss } from './ProfilePassword.styled';

export default function ProfilePassword({
  changePassword,
  error,
  reset: resetMutation,
  changingPassword: changing,
  setChangingPassword: setChanging
}: ProfilePasswordProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { flow, ref } = router.query;
  const isMobileRef = useRef(ref === 'mobile');
  const {
    register,
    handleSubmit,
    formState,
    reset: resetForm,
    setFocus
  } = useForm<TPasswordSchema>({
    defaultValues: {
      newPassword: ''
    },
    schema: passwordSchema
  });

  const onSubmit = async (data: TPasswordSchema) => {
    await changePassword(data.newPassword);
    setChanging(false);
  };

  const onChangePassword = () => {
    setChanging(true);
  };

  useEffect(() => {
    // Only call router.replace if there are params to remove
    // This prevents unnecessary navigation that could trigger SSR redirect
    if (flow || ref) {
      const { pathname, query } = router;
      delete query.flow;
      delete query.ref;

      router.replace({
        pathname,
        query
      });
    }
  }, []);

  useEffect(() => {
    if (!changing) {
      resetForm({ newPassword: '' }, { keepErrors: false });
      resetMutation();
    } else {
      setFocus('newPassword');
    }
  }, [changing]);

  const shouldHighlight = useCallback(() => {
    return !isMobileRef.current && flow && changing;
  }, [changing]);

  const getServerErrorMessage = () => {
    if (!error) {
      return null;
    }
    if (!isSerializedError(error)) {
      return t(CommonErrorMessage.Common.SOMETHING_WENT_WRONG);
    }
    const errorMapping = getServerError(error as any, t);
    return errorMapping[error.data.code] || error.data.message;
  };

  return (
    <section
      css={css`
        max-width: 456px;
      `}
    >
      <div css={passwordTitleGroupCss}>
        <Text as='h2' bold css={titleCss}>
          {t('common.password')}
        </Text>
        {!changing && (
          <div css={passwordLabelContainerCss}>
            <ButtonText level={6} underline onClick={onChangePassword} tabIndex={2}>
              {t('profileSettings.changePassword')}
            </ButtonText>
          </div>
        )}
      </div>

      <div>
        {/* placeholder */}
        {!changing && <Input type='password' value='•••••••••••••••' readOnly disabled={!changing} />}

        {/* change password form */}
        {changing && (
          <Form data-lumin-form-name={shouldHighlight() ? FormName.RESET_PASSWORD : ''} onSubmit={handleSubmit(onSubmit)}>
            <Alert
              show={Boolean(error)}
              css={css`
                margin-bottom: 16px;
              `}
            >
              {getServerErrorMessage()}
            </Alert>
            <div css={containerCss}>
              <div css={shouldHighlight() && highlightAnimationCss} />
              <div>
                <PasswordInput
                  {...register('newPassword')}
                  label={t('profileSettings.newPassword')}
                  autoComplete='new-password'
                  hideIcon
                  error={getErrorMessageTranslated(formState.errors.newPassword?.message, t)}
                  readOnly={formState.isSubmitting}
                />
              </div>
            </div>
            <div css={buttonGroupCss}>
              <Button color={ButtonColor.TERTIARY} type='button' onClick={() => setChanging(false)}>
                {t('common.cancel')}
              </Button>
              <Button type='submit' loading={formState.isSubmitting}>
                {t('common.save')}
              </Button>
            </div>
          </Form>
        )}
      </div>
    </section>
  );
}

type ProfilePasswordProps = {
  changePassword: (password: string) => Promise<void>;
  error: any;
  reset: () => void;
  changingPassword: boolean;
  setChangingPassword: (changing: boolean) => void;
};
