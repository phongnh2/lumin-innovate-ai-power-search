/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from '@emotion/react';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';

import Form from '@/components/Form';
import { Header } from '@/components/Header';
import { Routes } from '@/configs/routers';
import { ErrorCode } from '@/constants/errorCode';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { FormName } from '@/constants/formName';
import { getServerError, isFrontendApiError, isSerializedError } from '@/features/errors';
import useTranslation from '@/hooks/useTranslation';
import { LoginService } from '@/interfaces/user';
import { Alert, Button, Input, VerticalGap } from '@/ui';
import { getErrorMessageTranslated } from '@/utils/error.utils';

import useSignInSSO from './hooks/useSignInSSO';

import * as Styled from './SignInSSO.styled';

const SignInSSOPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { register, resetField, formState, handleSubmit, loginError } = useSignInSSO();

  const getErrorMessage = () => {
    if (!loginError) {
      return '';
    }
    if (!isSerializedError<{ loginService?: LoginService }>(loginError)) {
      if (isFrontendApiError(loginError)) {
        const mappingError = getServerError(loginError as any, t);
        return mappingError[(loginError as any).code] || (loginError as any).message;
      }
      return CommonErrorMessage.Common.SOMETHING_WENT_WRONG;
    }
    const errorMapping = {
      [ErrorCode.User.EMAIL_NOT_CONFIGURED_FOR_SSO]: t('signInSSOPage.emailNotConfiguredForSSOMessage'),
      ...getServerError(loginError, t)
    };
    return errorMapping[loginError.data?.code] || loginError.data?.message;
  };

  return (
    <div>
      <Header />
      <Styled.SignInSSOContainer>
        <Styled.ShieldIconWrapper />
        <Styled.SignInSSOText as='h1' bold level={1} align='center' marginBottom={16}>
          {t('signInSSOPage.title')}
        </Styled.SignInSSOText>
        <Styled.SignInSSOText variant='neutral' align='center' marginBottom={24}>
          {t('signInSSOPage.description')}
        </Styled.SignInSSOText>
        <Alert
          css={css`
            margin-bottom: 8px;
          `}
          show={Boolean(getErrorMessage())}
        >
          {getErrorMessage()}
        </Alert>
        <Form data-lumin-form-name={FormName.SIGN_IN_SSO} onSubmit={handleSubmit}>
          <VerticalGap level={6}>
            <Input
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register('email')}
              placeholder={t('placeholder.yourEmail')}
              icon='email'
              autoComplete='email'
              onClear={() => resetField('email')}
              error={getErrorMessageTranslated(formState.errors.email?.message, t)}
            />
            <Button fullWidth type='submit' loading={formState.isSubmitting || (formState.isSubmitted && isEmpty(formState.errors) && isEmpty(loginError))}>
              {t('common.continue')}
            </Button>
          </VerticalGap>
        </Form>
        <Styled.SignInWithoutSSOButton level={5} align='center' onClick={() => router.push(Routes.SignIn)}>
          {t('signInSSOPage.signInWithoutSSO')}
        </Styled.SignInWithoutSSOButton>
      </Styled.SignInSSOContainer>
    </div>
  );
};

export default SignInSSOPage;
