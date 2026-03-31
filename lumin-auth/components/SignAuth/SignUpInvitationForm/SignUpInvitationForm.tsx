/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from '@emotion/react';
import dynamic from 'next/dynamic';

import Form from '@/components/Form';
import * as AuthStyled from '@/components/SignAuth/Auth.styled';
import AuthMethodDivider from '@/components/SignAuth/AuthMethodDivider';
import SocialAuthGroup from '@/components/SignAuth/SocialAuthGroup';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { FormName } from '@/constants/formName';
import { isSerializedError, getServerError, isFrontendApiError } from '@/features/errors';
import { useSignUp } from '@/hooks/auth';
import useTranslation from '@/hooks/useTranslation';
import { OryProvider } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';
import { Input, PasswordInput, VerticalGap, Alert, ErrorMessage } from '@/ui';
import { ButtonSize } from '@/ui/Button';
import { getErrorMessageTranslated } from '@/utils/error.utils';

import * as Styled from './SignUpInvitationForm.styled';

const AcceptTerms = dynamic(() => import('@/components/SignAuth/AcceptTerms'), { ssr: false });

type TProps = {
  email: string;
  token: string;
};

function SignUpInvitationForm({ email, token }: TProps) {
  const { t } = useTranslation();
  const { register, signUpPassword, signUpOidc, signUpWithGoogle, formState, serverError } = useSignUp({
    token,
    defaultValues: {
      email,
      terms: false
    }
  });
  const getServerErrorMessage = () => {
    if (!serverError) {
      return null;
    }
    const errorMapping = getServerError(serverError as any, t);
    if (!isSerializedError<{ loginService?: LoginService }>(serverError)) {
      if (isFrontendApiError(serverError)) {
        return errorMapping[(serverError as any).code] || (serverError as any).message;
      }
      return CommonErrorMessage.Common.SOMETHING_WENT_WRONG;
    }
    return errorMapping[serverError.data.code] || serverError.data.message;
  };

  return (
    <>
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
        onDropboxClick={signUpOidc({ provider: OryProvider.Dropbox })}
        handleGoogleSignInResponse={signUpWithGoogle}
        onGoogleClick={signUpOidc({ provider: OryProvider.Google })}
        onMicrosoftClick={signUpOidc({ provider: OryProvider.Microsoft })}
        onXeroClick={signUpOidc({ provider: OryProvider.Xero })}
      />
      <AuthMethodDivider />
      <Form data-lumin-form-name={FormName.SIGN_UP_WITH_LINK} onSubmit={signUpPassword}>
        <VerticalGap level={4}>
          <div>
            <Input type='email' icon='email' placeholder={t('placeholder.yourEmail')} autoComplete='email' disabled value={email} />
            <Styled.EmailPreserve>{t('invitationRegistration.emailCanNotBeChanged')}</Styled.EmailPreserve>
          </div>
          <Input
            {...register('name')}
            placeholder={t('placeholder.yourName')}
            autoComplete='name'
            icon='user'
            error={getErrorMessageTranslated(formState.errors.name?.message, t)}
          />
          <div>
            <PasswordInput
              {...register('password')}
              placeholder={t('placeholder.password')}
              autoComplete='password'
              error={getErrorMessageTranslated(formState.errors.password?.message, t)}
            />
            <AuthStyled.AcceptTermsWrapper>
              <AcceptTerms register={register} />
              {formState.errors.terms && <ErrorMessage style={{ marginTop: 4 }}>{getErrorMessageTranslated(formState.errors.terms.message, t)}</ErrorMessage>}
            </AuthStyled.AcceptTermsWrapper>
            <AuthStyled.SubmitButton fullWidth loading={formState.isSubmitting} type='submit' size={ButtonSize.XL}>
              {t('common.signUp')}
            </AuthStyled.SubmitButton>
          </div>
        </VerticalGap>
      </Form>
    </>
  );
}

export default SignUpInvitationForm;
