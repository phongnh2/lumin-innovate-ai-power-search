/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from '@emotion/react';
import jwtDecode from 'jwt-decode';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import Form from '@/components/Form';
import { Header } from '@/components/Header';
import * as Styled from '@/components/SignAuth/Auth.styled';
import AuthMethodDivider from '@/components/SignAuth/AuthMethodDivider';
import SocialAuthGroup from '@/components/SignAuth/SocialAuthGroup';
import { ButtonName } from '@/constants/buttonEvent';
import { QUERY_KEYS } from '@/constants/common';
import { ErrorCode } from '@/constants/errorCode';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { FORM_FIELD } from '@/constants/formField';
import { FormName } from '@/constants/formName';
import { useGetRegistrationFlowQuery } from '@/features/account/account-api-slice';
import { isSerializedError, getServerError, isFrontendApiError } from '@/features/errors';
import { useGetQueryValuesFromReturnTo } from '@/hooks';
import { useHandleFlowErrors } from '@/hooks/auth';
import useTranslation from '@/hooks/useTranslation';
import { OryProvider } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';
import { useAppSelector } from '@/lib/hooks';
import { useSignUpForm } from '@/lib/use-sign-up-form';
import { getLoginChallenge } from '@/selectors';
import { PasswordInput, Input, ErrorMessage, VerticalGap, Alert } from '@/ui';
import { ButtonSize } from '@/ui/Button';
import { getErrorMessageTranslated } from '@/utils/error.utils';

import { ResendVerificationLink } from '../SignAuth/ResendVerification';

const AcceptTerms = dynamic(() => import('@/components/SignAuth/AcceptTerms'), { ssr: false });
const HeaderSignInElement = dynamic(() => import('@/components/HeaderSignInElement'), { ssr: false });

function SignUpPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { errors, register, submitSignUp, signInOidc, formState, serverError, getValues } = useSignUpForm();
  const loginChallenge = useAppSelector(getLoginChallenge) || '';
  const { from } = router.query;

  const { returnToValue } = useGetQueryValuesFromReturnTo();

  const registrationFlowId = router.query[QUERY_KEYS.FLOW] as string;
  const { data: existingRegistrationFlow } = useGetRegistrationFlowQuery(registrationFlowId);
  useHandleFlowErrors({ existingFlow: existingRegistrationFlow, isRegistrationFlow: true });

  const _handleGoogleSignInResponse = async ({ credential }: { credential: string }) => {
    const decoded = jwtDecode(credential) as { email: string };

    signInOidc(OryProvider.Google, decoded.email)(null);
  };

  const getServerErrorMessage = () => {
    if (!serverError) {
      return null;
    }
    if (!isSerializedError<{ loginService?: LoginService; remainingTime?: number }>(serverError as any)) {
      if (isFrontendApiError(serverError as any)) {
        const mappingError = getServerError(serverError as any, t);
        return mappingError[(serverError as any).code] || (serverError as any).message;
      }
      return CommonErrorMessage.Common.SOMETHING_WENT_WRONG;
    }

    const errorMapping = {
      [ErrorCode.User.UNACTIVATED_ACCOUNT]: (
        <>
          {t('authPage.resendVerifyYourEmail')}
          <br />
          <ResendVerificationLink formValues={getValues} countdownFrom={serverError?.data?.meta?.remainingTime as unknown as number} />
        </>
      ),
      ...getServerError(serverError, t)
    };
    return errorMapping[serverError.data.code] || serverError.data.message;
  };

  return (
    <>
      <Header />

      <div>
        <Alert
          css={css`
            margin-bottom: 16px;
          `}
          show={Boolean(serverError)}
        >
          {getServerErrorMessage()}
        </Alert>

        <SocialAuthGroup
          isSignUp
          handleGoogleSignInResponse={_handleGoogleSignInResponse}
          onDropboxClick={signInOidc(OryProvider.Dropbox)}
          onAppleClick={signInOidc(OryProvider.Apple)}
          fromOAuth2={Boolean(from === 'mobile')}
          onGoogleClick={signInOidc(OryProvider.Google)}
          onMicrosoftClick={signInOidc(OryProvider.Microsoft)}
          onXeroClick={signInOidc(OryProvider.Xero)}
        />

        <AuthMethodDivider />

        <Form data-lumin-form-name={FormName.SIGN_UP_FORM} onSubmit={submitSignUp}>
          <VerticalGap level={4}>
            <Input
              {...register('name')}
              placeholder={t('placeholder.yourName')}
              icon='user'
              autoComplete='username'
              error={getErrorMessageTranslated(errors.name?.message, t)}
              inputData={{
                'data-lumin-name': FORM_FIELD.SIGNUP.NAME.name,
                'data-lumin-purpose': FORM_FIELD.SIGNUP.NAME.purpose
              }}
            />
            <Input
              {...register('email')}
              id='email'
              icon='email'
              type='email'
              autoComplete='email'
              placeholder={t('placeholder.yourEmail')}
              error={getErrorMessageTranslated(errors.email?.message, t)}
              inputData={{
                'data-lumin-name': FORM_FIELD.SIGNUP.EMAIL.name,
                'data-lumin-purpose': FORM_FIELD.SIGNUP.EMAIL.purpose
              }}
            />
            <PasswordInput
              {...register('password')}
              id='lock'
              autoComplete='new-password'
              placeholder={t('placeholder.password')}
              error={getErrorMessageTranslated(errors.password?.message, t)}
              inputData={{
                'data-lumin-name': FORM_FIELD.SIGNUP.PASSWORD.name,
                'data-lumin-purpose': FORM_FIELD.SIGNUP.PASSWORD.purpose
              }}
            />
          </VerticalGap>
          <Styled.AcceptTermsWrapper>
            <AcceptTerms
              register={register}
              dataAttribute={{
                'data-lumin-name': FORM_FIELD.SIGNUP.TERM.name,
                'data-lumin-purpose': FORM_FIELD.SIGNUP.TERM.purpose
              }}
            />
          </Styled.AcceptTermsWrapper>
          {errors.terms && <ErrorMessage style={{ marginTop: 4 }}>{getErrorMessageTranslated(errors.terms.message, t)}</ErrorMessage>}

          <Styled.SubmitButton type='submit' fullWidth loading={formState.isSubmitting} data-lumin-btn-name={ButtonName.SIGN_UP_SUBMIT} size={ButtonSize.XL}>
            {t('common.signUp')}
          </Styled.SubmitButton>

          <HeaderSignInElement loginChallenge={loginChallenge} returnTo={returnToValue} />
        </Form>
      </div>
    </>
  );
}

export default SignUpPage;
