/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from '@emotion/react';
import { GoogleReCaptchaCheckbox, useGoogleReCaptcha } from '@google-recaptcha/react';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import Form from '@/components/Form';
import * as AuthStyled from '@/components/SignAuth/Auth.styled';
import { ErrorCode } from '@/constants/errorCode';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { FormName } from '@/constants/formName';
import { getServerError } from '@/features/errors';
import useTranslation from '@/hooks/useTranslation';
import { THookFormSubmitHandler } from '@/interfaces/common';
import { LoginService, ReCaptchaAction } from '@/interfaces/user';
import { TForgotPasswordSchema } from '@/lib/yup';
import ShieldQuestionIcon from '@/public/assets/shield-question.svg';
import { Button, Input, Text, VerticalGap, Alert, ErrorMessage, ConfirmationDialog } from '@/ui';
import { getAuthenticationMethodMessage, getAuthenticationMethodText } from '@/utils/auth.utils';
import { getErrorMessageTranslated } from '@/utils/error.utils';
import { avoidNonOrphansWord } from '@/utils/string.utils';

import useClickLogout from '../ProfileDropdown/useClickLogout';

type TProps = {
  formState: UseFormReturn<TForgotPasswordSchema>['formState'];
  register: UseFormReturn<TForgotPasswordSchema>['register'];
  resetField: UseFormReturn<TForgotPasswordSchema>['resetField'];
  handleSubmit: THookFormSubmitHandler;
  error: any;
};

function ForgotPassword({ formState, register, resetField, handleSubmit, error }: TProps) {
  const { t } = useTranslation();
  const { reset } = useGoogleReCaptcha();
  const [confirmLogOutModal, setConfirmLogoutModal] = useState(false);
  const [logout] = useClickLogout();
  const isSessionAlreadyAvailableError = (serverError: { data: any }) => serverError.data?.code === ErrorCode.Auth.SESSION_ALREADY_AVAILABLE;
  useEffect(() => {
    if (error) {
      reset?.();
      resetField('token');
      if (isSessionAlreadyAvailableError(error)) {
        setConfirmLogoutModal(true);
      }
    }
  }, [error]);

  const getErrorMessage = (): string => {
    if (!error) {
      return '';
    }
    if (isSessionAlreadyAvailableError(error)) {
      return '';
    }
    const errorMapping = {
      ...getServerError(error, t),
      [ErrorCode.User.ALREADY_SIGNED_IN_ANOTHER_METHOD]: getAuthenticationMethodMessage(
        getAuthenticationMethodText((error.data?.meta?.loginService as LoginService) || 'unknown_third_party', t),
        true
      )
    };
    return errorMapping[error.data?.code] || error.data?.message || t(CommonErrorMessage.Common.SOMETHING_WENT_WRONG);
  };

  const handleRecaptchaChange = useCallback(
    (token: string) => {
      register('token').onChange({ target: { value: token, name: 'token' } });
    },
    [register]
  );

  return (
    <>
      <ShieldQuestionIcon
        css={css`
          margin: 0 auto;
          margin-bottom: 40px;
          display: block;
        `}
        height={144}
      />

      <Text
        as='h1'
        bold
        level={1}
        align='center'
        css={css`
          margin-bottom: 8px;
        `}
      >
        {t('forgotPassword.title')}
      </Text>
      <Text css={AuthStyled.forgotPwdDescCss} variant='neutral' align='center'>
        {avoidNonOrphansWord(t('forgotPassword.enterYourEmail'))}
      </Text>
      <Alert
        css={css`
          margin-bottom: 24px;
          width: 100%;
        `}
        show={Boolean(getErrorMessage())}
      >
        {getErrorMessage()}
      </Alert>
      <Form data-lumin-form-name={FormName.FORGOT_PASSWORD} onSubmit={handleSubmit}>
        <VerticalGap level={10}>
          <Input
            {...register('email')}
            placeholder={t('placeholder.yourEmail')}
            icon='email'
            autoComplete='email'
            onClear={() => resetField('email')}
            error={getErrorMessageTranslated(formState.errors.email?.message, t)}
          />
          <div>
            <GoogleReCaptchaCheckbox onChange={handleRecaptchaChange} action={ReCaptchaAction.FORGOT_PASSWORD} />
            {formState.errors.token?.message && (
              <ErrorMessage style={{ marginTop: 4 }}>{getErrorMessageTranslated(formState.errors.token?.message, t)}</ErrorMessage>
            )}
          </div>
          <Button fullWidth type='submit' loading={formState.isSubmitting || (formState.isSubmitted && isEmpty(formState.errors) && isEmpty(error))}>
            {t('forgotPassword.resetMyPassword')}
          </Button>
        </VerticalGap>
      </Form>
      <ConfirmationDialog
        open={confirmLogOutModal}
        title={t('forgotPassword.forceLogoutTitle')}
        confirmText={t('common.logOut')}
        onConfirm={logout}
        onCancel={() => setConfirmLogoutModal(false)}
        message={t('forgotPassword.forceLogoutMessage')}
      />
    </>
  );
}

export default ForgotPassword;
